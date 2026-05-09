import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import { getSupabase, getPlanToken } from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Pin, WavyUnderline } from '../components/Sketches';

const BUSINESS_TYPE_LABELS = {
  alimentacao: 'Alimentação',
  beleza: 'Beleza',
  moda_revenda: 'Moda / revenda',
  artesanato: 'Artesanato',
  servicos: 'Serviços',
  educacao: 'Educação',
  outro: 'Outro',
};

function deriveBadgeLevel(tasks) {
  if (!tasks?.length) return 'Diagnóstico concluído';
  const completed = tasks.filter((t) => t.status === 'concluida').length;
  if (completed === 0) return 'Diagnóstico concluído';
  if (completed >= tasks.length) return 'Trilha de 30 dias concluída';
  return 'Primeira tarefa concluída';
}

function formatDateBR(d = new Date()) {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function BadgeCard() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [shareMsg, setShareMsg] = useState(null);

  useEffect(() => {
    const token = getPlanToken();
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      const client = getSupabase(token);
      try {
        const { data: users } = await client.from('users').select('*').limit(1);
        const user = users?.[0];
        if (!user) {
          navigate('/', { replace: true });
          return;
        }
        const { data: plans } = await client
          .from('plans')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        const plan = plans?.[0] || null;
        let tasks = [];
        if (plan) {
          const { data } = await client
            .from('tasks')
            .select('id, status')
            .eq('plan_id', plan.id);
          tasks = data || [];
        }
        if (!cancelled) {
          setState({ loading: false, error: null, data: { user, plan, tasks } });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message || 'Erro ao carregar.',
            data: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const archetype = useMemo(() => {
    if (!state.data?.plan) return null;
    return archetypesData.find((a) => a.id === state.data.plan.archetype_id);
  }, [state.data]);

  if (state.loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Cartão" />
        <Card><p className="text-secondary text-sm">Carregando…</p></Card>
      </div>
    );
  }
  if (state.error || !state.data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Cartão" />
        <Card className="border-coral">
          <p className="text-coral text-sm">{state.error || 'Não encontrado.'}</p>
        </Card>
      </div>
    );
  }

  const { user, tasks } = state.data;
  const badgeLevel = deriveBadgeLevel(tasks);
  const businessName = user.business_name?.trim() || 'Meu negócio';
  const businessType = BUSINESS_TYPE_LABELS[user.business_type] || '—';
  const dateStr = formatDateBR(new Date());

  const handleShare = async () => {
    const text = `${user.name} — ${businessName}\nPerfil: ${archetype?.name || '—'}\nNível: ${badgeLevel}\nTrilha Empreendedora · ${dateStr}`;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu cartão da Trilha', text, url });
        return;
      } catch {
        // user cancelled — ignore
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg('Texto e link copiados.');
    } catch {
      setShareMsg('Copie manualmente.');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader accent="Cartão" title="Meu cartão" />

      <Card className="border-primary bg-beige relative">
        <div className="absolute -top-2 right-4">
          <Pin className="w-7 h-7" />
        </div>
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          Trilha Empreendedora
        </p>
        <h2 className="font-bold text-2xl text-ink leading-tight">
          {user.name}
        </h2>
        <WavyUnderline className="w-24 h-2 mb-2" />
        <p className="text-ink text-base mb-4">{businessName}</p>

        <dl className="text-sm space-y-2 mb-4">
          <div className="flex justify-between">
            <dt className="text-secondary">Tipo de negócio</dt>
            <dd className="text-ink font-semibold">{businessType}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-secondary">Perfil</dt>
            <dd className="text-ink font-semibold text-right max-w-[60%]">
              {archetype?.name || '—'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-secondary">Nível</dt>
            <dd className="text-ink font-semibold">{badgeLevel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-secondary">Data</dt>
            <dd className="text-ink font-semibold">{dateStr}</dd>
          </div>
        </dl>

        <p className="text-xs text-secondary leading-relaxed border-t border-line pt-3">
          Este cartão não representa aprovação de crédito, garantia
          financeira ou recomendação individual de empréstimo. Ele indica
          apenas que o empreendedor concluiu etapas de diagnóstico,
          organização e aprendizado prático.
        </p>
      </Card>

      <Button onClick={handleShare} className="w-full">
        Compartilhar
      </Button>
      {shareMsg && (
        <p className="text-secondary text-sm text-center">{shareMsg}</p>
      )}
      <Button
        variant="ghost"
        onClick={() => navigate('/minha-trilha')}
        className="w-full"
      >
        ← Voltar para minha trilha
      </Button>
    </div>
  );
}
