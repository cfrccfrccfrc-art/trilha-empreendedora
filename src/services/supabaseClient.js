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
