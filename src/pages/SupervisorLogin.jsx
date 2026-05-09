import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

export default function SupervisorLogin() {
  const { loading, session, supervisor } = useSupervisorSession();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  if (!loading && session && supervisor) {
    return <Navigate to="/supervisor" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Coloque seu e-mail.');
      return;
    }
    setSending(true);
    try {
      const client = getAuthClient();
      const { error: authError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/supervisor` },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      console.error('signInWithOtp error:', err);
      setError(err?.message || 'Não foi possível enviar o link.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Verifique o e-mail" title="Link enviado" />
        <Card>
          <p className="text-secondary text-sm leading-relaxed">
            Mandamos um link mágico pra <strong>{email}</strong>. Clique nele
            no celular ou computador onde você quer revisar tarefas.
          </p>
        </Card>
      </div>
    );
  }

  if (!loading && session && !supervisor) {
    return (
      <div className="space-y-5">
        <PageHeader title="Acesso restrito" />
        <Card className="border-coral">
          <p className="text-coral text-sm leading-relaxed">
            Você está autenticada(o), mas não consta na lista de supervisores
            ativos. Peça pra alguém da equipe te cadastrar.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Painel"
        title="Entrar como supervisor"
        subtitle="Login por link mágico — sem senha."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Seu e-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
            autoComplete="email"
          />
        </div>
        {error && <p className="text-coral text-sm">{error}</p>}
        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Enviando…' : 'Receber link mágico'}
        </Button>
      </form>
    </div>
  );
}
