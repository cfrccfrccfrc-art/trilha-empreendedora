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
  queue.push({
    event_type: eventType,
    plan_token: token || null,
    page:
      typeof window !== 'undefined' && window.location
        ? window.location.pathname
        : null,
    meta: meta && typeof meta === 'object' ? meta : {},
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
