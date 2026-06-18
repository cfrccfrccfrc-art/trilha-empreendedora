// Telemetria leve: batch de eventos no client_events do Supabase.
// ----------------------------------------------------------------------------
// Uso: track('event_name', { meta: opcional }).
// Eventos são acumulados em fila e enviados em batch a cada 1.5s OU quando
// a aba é ocultada (visibilitychange). Falhas são silenciosas — telemetria
// não pode atrapalhar o fluxo do usuário.
// ----------------------------------------------------------------------------

import { getSupabase, getPlanToken } from './supabaseClient';

const BATCH_INTERVAL_MS = 1500;
const MAX_QUEUE = 50;

let queue = [];
let flushTimer = null;
let installed = false;
let sessionCtx = null;

function newId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // ignora e cai no fallback
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Contexto de origem + identidade anônima.
// - vid (visitante): persiste entre visitas (localStorage) → conta gente única.
// - sid (sessão): persiste só na aba (sessionStorage) → uma visita.
// - src (origem): first-touch da sessão (UTM da URL + domínio do referrer).
// Nada disso é dado pessoal: são ids aleatórios e marcadores de campanha.
function getSessionContext() {
  if (sessionCtx) return sessionCtx;
  if (typeof window === 'undefined') {
    sessionCtx = { sid: null, vid: null, src: {} };
    return sessionCtx;
  }
  try {
    let vid = localStorage.getItem('te_vid');
    if (!vid) {
      vid = newId();
      localStorage.setItem('te_vid', vid);
    }

    let sid = sessionStorage.getItem('te_sid');
    let src;
    if (!sid) {
      sid = newId();
      sessionStorage.setItem('te_sid', sid);
      const params = new URLSearchParams(window.location.search || '');
      let referrer = null;
      try {
        if (document.referrer) referrer = new URL(document.referrer).hostname;
      } catch {
        referrer = null;
      }
      src = {
        utm_source: params.get('utm_source') || null,
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
        referrer,
      };
      sessionStorage.setItem('te_src', JSON.stringify(src));
    } else {
      try {
        src = JSON.parse(sessionStorage.getItem('te_src') || '{}');
      } catch {
        src = {};
      }
    }

    sessionCtx = { sid, vid, src };
  } catch {
    // storage indisponível (modo anônimo restrito etc.): segue sem ids
    sessionCtx = { sid: null, vid: null, src: {} };
  }
  return sessionCtx;
}

function ensureFlushOnHide() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}

export function track(eventType, meta = {}) {
  if (!eventType) return;
  ensureFlushOnHide();
  const token = getPlanToken();
  const ctx = getSessionContext();
  queue.push({
    event_type: eventType,
    plan_token: token || null,
    page:
      typeof window !== 'undefined' && window.location
        ? window.location.pathname
        : null,
    meta: {
      ...(meta && typeof meta === 'object' ? meta : {}),
      sid: ctx.sid,
      vid: ctx.vid,
      src: ctx.src,
    },
  });
  if (queue.length >= MAX_QUEUE) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, BATCH_INTERVAL_MS);
  }
}

async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  try {
    const token = getPlanToken();
    const client = getSupabase(token);
    await client.from('client_events').insert(batch);
  } catch (e) {
    // best-effort: telemetria não pode atrapalhar o fluxo
    if (import.meta.env?.DEV) {
      console.warn('telemetry flush failed', e);
    }
  }
}

// Helper pra eventos que dependem de Effects: chama uma vez por montagem.
export function trackOnce(eventType, meta = {}) {
  track(eventType, meta);
}
