import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const PLAN_TOKEN_KEY = 'trilha_plan_token';

const cache = new Map();

export function getSupabase(planToken = null) {
  const cacheKey = planToken || '__anon__';
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const client = createClient(url, key, {
    auth: { persistSession: false },
    global: planToken ? { headers: { 'x-plan-token': planToken } } : {},
  });
  cache.set(cacheKey, client);
  return client;
}

// Separate authenticated client for supervisors/admins.
// Persists session so password / magic-link sign-in survive reloads.
// Notas:
// - `lock` bypassa o navigator.locks interno do supabase-js v2 (deadlock
//   conhecido em alguns ambientes).
// - `autoRefreshToken: false` e `detectSessionInUrl: false` impedem o init
//   interno (`_initializePromise`) de travar quando tenta refresh proativo
//   ou parse de URL. Sem isso, getSession()/getUser() travam pra sempre.
// - Magic-link continua funcionando porque o token vem no hash da URL e o
//   SupervisorLogin processa o callback manualmente via onAuthStateChange.
let authClient = null;
export function getAuthClient() {
  if (authClient) return authClient;
  authClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'trilha_supervisor_auth',
      lock: (_name, _acquireTimeout, fn) => fn(),
    },
  });
  return authClient;
}

const SUPERVISOR_STORAGE_KEY = 'trilha_supervisor_auth';

// Lê a sessão do supervisor direto do localStorage. Bypassa getSession() do
// supabase-js v2, que em alguns ambientes trava o init interno indefinidamente.
export function readSupervisorSession() {
  try {
    const raw = localStorage.getItem(SUPERVISOR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.user) return null;
    // expires_at vem em segundos unix epoch.
    if (parsed.expires_at && Date.now() >= parsed.expires_at * 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSupervisorSession() {
  try {
    localStorage.removeItem(SUPERVISOR_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Client autenticado on-the-fly pra queries do supervisor. NÃO usa
// persistSession nem init proativo, então não trava como o getAuthClient.
export function getAuthedClient(accessToken) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export function getPlanToken() {
  try {
    return localStorage.getItem(PLAN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setPlanToken(token) {
  localStorage.setItem(PLAN_TOKEN_KEY, token);
}

export function clearPlanToken() {
  try {
    localStorage.removeItem(PLAN_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export const supabase = getSupabase();
