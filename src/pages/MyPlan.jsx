import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import {
  getSupabase,
  getPlanToken,
  clearPlanToken,
} from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import DonationBanner from '../components/DonationBanner';
import ShareBanner from '../components/ShareBanner';
import { Sparkle } from '../components/Sketches';

const STATUS_META = {
  a_fazer:           { label: 'A fazer',         className: 'bg-line text-secondary' },
  enviada:           { label: 'Enviada',         className: 'bg-lavender text-white' },
  precisa_ajustar:   { label: 'Precisa ajustar', className: 'bg-coral text-white' },
  concluida:         { label: 'Concluída',       className: 'bg-green text-white' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status,
    className: 'bg-line text-secondary',
  };
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export default function MyPlan() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, data: null });

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
        const { data: users, error: ue } = await client
          .from('users')
          .select('*')
          .limit(1);
        if (ue) throw ue;
        const user = users?.[0];
        if (!user) {
          clearPlanToken();
          navigate('/', { replace: true });
          return;
        }

        const { data: plans, error: pe } = await client
          .from('plans')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        if (pe) throw pe;
        const plan = plans?.[0];
        if (!plan) {
          if (!cancelled) {
            setState({
              loading: false,
              error: null,
              data: { user, plan: null, tasks: [] },
            });
          }
          return;
        }

        const { data: tasks, error: te } = await client
          .from('tasks')
          .select('*')
          .eq('plan_id', plan.id)
          .order('week', { ascending: true })
          .order('created_at', { ascending: true });
        if (te) throw te;

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: { user, plan, tasks: tasks || [] },
          });
        }
      } catch (err) {
        console.error('MyPlan load error:', err);
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message || 'Não conseguimos carregar sua trilha.',
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

  const tasksByWeek = useMemo(() => {
    if (!state.data?.tasks) return [];
    const groups = new Map();
    for (const t of state.data.tasks) {
      if (!groups.has(t.week)) groups.set(t.week, []);
      groups.get(t.week).push(t);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [state.data]);

  const progress = useMemo(() => {
    const tasks = state.data?.tasks || [];
    if (!tasks.length) return { done: 0, total: 0, percent: 0 };
    const done = tasks.filter((t) => t.status === 'concluida').length;
    return {
      done,
      total: tasks.length,
      percent: Math.round((done / tasks.length) * 100),
    };
  }, [state.data]);

  if (state.loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Minha trilha" />
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Minha trilha" />
        <Card className="border-coral">
          <p className="text-coral text-sm">{state.error}</p>
        </Card>
      </div>
    );
  }

  const { user, plan, tasks } = state.data;
  const firstName = (user?.name || '').split(' ')[0] || 'Você';
  const businessName = user?.business_name?.trim() || 'Meu negócio';

  return (
    <div className="space-y-5">
      <PageHeader accent={firstName} title={businessName} />

      {archetype && (
        <Card>
          <p className="font-semibold text-ink mb-1">{archetype.name}</p>
          {archetype.commonPain && (
            <p className="text-secondary text-sm leading-snug">
              {archetype.commonPain.split('.')[0] + '.'}
            </p>
          )}
        </Card>
      )}

      {plan && tasks.length > 0 && (
        <Card>
          <div className="flex justify-between items-baseline mb-2">
            <p className="font-semibold text-ink flex items-center gap-2">
              {progress.done > 0 && <Sparkle className="w-4 h-4" />}
              Semana {plan.current_week} de 4
            </p>
            <p className="text-xs text-secondary">
              {progress.done} de {progress.total} concluídas
            </p>
          </div>
          <ProgressBar value={progress.percent} />
        </Card>
      )}

      {!plan && (
        <Card>
          <p className="text-secondary text-sm">
            Você ainda não tem uma trilha ativa.
          </p>
        </Card>
      )}

      {tasksByWeek.map(([week, weekTasks]) => (
        <div key={week} className="space-y-3">
          <p className="font-hand text-secondary text-lg leading-tight px-1">
            Semana {week}
          </p>
          {weekTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:bg-beige transition-colors"
              onClick={() => navigate(`/tarefa/${task.id}`)}
            >
              <div className="flex justify-between items-start gap-3">
                <p className="font-semibold text-ink leading-snug flex-1">
                  {task.title}
                </p>
                <StatusBadge status={task.status} />
              </div>
            </Card>
          ))}
        </div>
      ))}

      {progress.percent === 100 && (
        <Card className="border-primary bg-primaryLight/30">
          <div className="flex gap-3 items-start mb-3">
            <Sparkle className="w-7 h-7 mt-1 shrink-0" />
            <div>
              <p className="font-hand text-secondary text-base leading-tight mb-1">
                Você terminou os 30 dias
              </p>
              <h3 className="font-bold text-ink leading-snug">
                Topa contar como foi pra ajudar quem está começando?
              </h3>
            </div>
          </div>
          <p className="text-secondary text-sm leading-relaxed mb-3">
            5 a 10 minutos. A gente edita, anonimiza no nível que você
            autorizar, e publica como caso oficial pra inspirar outras
            pessoas no seu mesmo perfil.
          </p>
          <Button
            onClick={() => navigate('/minha-historia')}
            className="w-full"
          >
            Contar minha história
          </Button>
        </Card>
      )}

      <DonationBanner placement="my_plan" />

      <ShareBanner
        tone="soft"
        title="Tá ajudando você?"
        body="Conhece alguém começando ou tentando organizar o negócio? Manda a Trilha. É gratuita e sem cadastro pra começar."
        shareText="Tô usando a Trilha Empreendedora pra organizar meu negócio. É gratuita e tem trilha de 30 dias com tarefas práticas. Vale a pena conhecer."
      />

      <div className="space-y-3 pt-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/preciso-de-ajuda')}
          className="w-full"
        >
          Preciso de ajuda
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/conteudos')}
          className="w-full"
        >
          Explorar conteúdos
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/cartao')}
          className="w-full"
        >
          Compartilhar meu cartão
        </Button>
      </div>
    </div>
  );
}
