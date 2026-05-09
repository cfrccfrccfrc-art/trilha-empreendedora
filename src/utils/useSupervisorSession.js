import { useEffect, useState } from 'react';
import { getAuthClient } from '../services/supabaseClient';

// Returns { loading, session, supervisor (row or null), isAdmin, signOut }
export function useSupervisorSession() {
  const [state, setState] = useState({
    loading: true,
    session: null,
    supervisor: null,
    isAdmin: false,
  });

  useEffect(() => {
    const client = getAuthClient();
    let cancelled = false;

    async function load(session) {
      if (!session) {
        if (!cancelled) {
          setState({ loading: false, session: null, supervisor: null, isAdmin: false });
        }
        return;
      }
      const { data, error } = await client
        .from('supervisors')
        .select('*')
        .eq('user_id', session.user.id)
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
    }

    client.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => load(session));

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    await getAuthClient().auth.signOut();
  };

  return { ...state, signOut };
}
