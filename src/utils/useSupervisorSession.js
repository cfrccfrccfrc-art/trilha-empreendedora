import { useEffect, useState } from 'react';
import {
  readSupervisorSession,
  clearSupervisorSession,
  getAuthedClient,
} from '../services/supabaseClient';

// Lê a sessão do supervisor direto do localStorage (sem chamar getSession do
// supabase-js, que trava em alguns ambientes) e busca a linha em `supervisors`
// via REST autenticado com o access_token do storage.
//
// Returns { loading, session, supervisor (row or null), isAdmin, signOut }
export function useSupervisorSession() {
  const [state, setState] = useState({
    loading: true,
    session: null,
    supervisor: null,
    isAdmin: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const stored = readSupervisorSession();
      if (!stored) {
        if (!cancelled) {
          setState({ loading: false, session: null, supervisor: null, isAdmin: false });
        }
        return;
      }

      // session no formato esperado pelos consumidores ({ user, access_token })
      const session = {
        user: stored.user,
        access_token: stored.access_token,
        expires_at: stored.expires_at,
      };

      try {
        const client = getAuthedClient(stored.access_token);
        const { data, error } = await client
          .from('supervisors')
          .select('*')
          .eq('user_id', stored.user.id)
          .eq('active', true)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error('supervisor lookup error:', error);
          setState({ loading: false, session, supervisor: null, isAdmin: false });
          return;
        }
        setState({
          loading: false,
          session,
          supervisor: data || null,
          isAdmin: data?.role === 'admin',
        });
      } catch (err) {
        console.error('supervisor lookup threw:', err);
        if (cancelled) return;
        setState({ loading: false, session, supervisor: null, isAdmin: false });
      }
    }

    load();

    // Re-checa se outra aba mudar o storage (login/logout em paralelo).
    function onStorage(e) {
      if (e.key === null || e.key === 'trilha_supervisor_auth') {
        load();
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  const signOut = async () => {
    clearSupervisorSession();
    setState({ loading: false, session: null, supervisor: null, isAdmin: false });
  };

  return { ...state, signOut };
}
