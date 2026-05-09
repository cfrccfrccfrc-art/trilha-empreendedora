import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplates from '../data/taskTemplates.json';
import companionsData from '../data/taskCompanions.json';
import { getSupabase, getPlanToken } from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { OpenBook } from '../components/Sketches';
import DonationBanner from '../components/DonationBanner';

export default function LearningResponse() {
  const { id } = useParams();
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
        const { data: task, error: te } = await client
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();
        if (te) throw te;

        const { data: plans, error: pe } = await client
          .from('plans')
          .select('*')
          .eq('id', task.plan_id)
          .single();
        if (pe) throw pe;

        const { data: latestSubmission } = await client
          .from('task_submissions')
          .select('*')
          .eq('task_id', id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        let latestReview = null;
        if (latestSubmission?.[0]) {
          const { data: reviews } = await client
            .from('task_reviews')
            .select('*')
            .eq('submission_id', latestSubmission[0].id)
            .order('reviewed_at', { ascending: false })
            .limit(1);
          latestReview = reviews?.[0] || null;
        }

        const { data: planTasks } = await client
          .from('tasks')
          .select('*')
          .eq('plan_id', task.plan_id)
          .order('week', { ascending: true })
          .order('created_at', { ascending: true });

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              task,
              plan: plans,
              template: taskTemplates.find((t) => t.id === task.task_template_id),
              submission: latestSubmission?.[0] || null,
              review: latestReview,
              planTasks: planTasks || [],
            },
          });
        }
      } catch (err) {
        console.error('LearningResponse load error:', err);
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message || 'Não conseguimos carregar essa tela.',
            data: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const archetype = useMemo(() => {
    if (!state.data?.plan) return null;
    return archetypesData.find((a) => a.id === state.data.plan.archetype_id);
  }, [state.data]);

  const nextTask = useMemo(() => {
    const data = state.data;
    if (!data) return null;
    const idx = data.planTasks.findIndex((t) => t.id === data.task.id);
    return idx >= 0 ? data.planTasks[idx + 1] : null;
  }, [state.data]);

  const nextWeek = useMemo(() => {
    if (!archetype || !nextTask) return null;
    return archetype.roadmap30d?.find((w) => w.week === nextTask.week);
  }, [archetype, nextTask]);

  if (state.loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Aprendizado" />
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Aprendizado" />
        <Card className="border-coral">
          <p className="text-coral text-sm">
            {state.error || 'Não foi possível carregar.'}
          </p>
        </Card>
      </div>
    );
  }

  const { task, template, submission, review } = state.data;
  const autoApproved = review?.review_status === 'aprovada';
  const stuck =
    review?.review_status === 'precisa_ajustar' ||
    review?.review_status === 'travada';
  const companion = stuck
    ? companionsData.find(
        (c) =>
          c.taskTemplateId === task.task_template_id && c.status === 'active'
      )
    : null;

  return (
    <div className="space-y-5">
      <PageHeader accent="Bom passo." title={task.title} />

      {template?.expectedLearning && (
        <Card>
          <h2 className="font-bold text-ink mb-2">
            O que essa tarefa deveria mostrar
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            {template.expectedLearning}
          </p>
        </Card>
      )}

      {template?.commonMistakes?.length > 0 && (
        <Card>
          <h2 className="font-bold text-ink mb-2">
            O que você deve revisar agora
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
            {template.commonMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-bold text-ink mb-2">Próximo passo provável</h2>
        {nextTask ? (
          <p className="text-secondary text-sm leading-relaxed">
            {nextWeek
              ? `${nextWeek.title} — ${nextTask.title}`
              : nextTask.title}
          </p>
        ) : (
          <p className="text-secondary text-sm leading-relaxed">
            Você chegou ao fim das missões dessa trilha. Em breve traremos
            novos passos.
          </p>
        )}
      </Card>

      {companion && (
        <button
          type="button"
          onClick={() => navigate(`/companheiros/${task.task_template_id}`)}
          className="w-full flex gap-3 items-start text-left bg-primaryLight/40 rounded-2xl p-4 border border-primary hover:bg-primaryLight/60 transition-colors"
        >
          <OpenBook className="w-10 h-10 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              Antes de seguir
            </p>
            <p className="text-ink text-sm leading-snug">
              Vê como <strong>{companion.personaName}</strong> encarou essa
              mesma tarefa. Os tropeços dela costumam ser parecidos com os que
              travaram aqui →
            </p>
          </div>
        </button>
      )}

      <Card className={autoApproved ? 'border-green' : 'border-lavender'}>
        <h2 className="font-bold text-ink mb-2">Revisão</h2>
        {review?.custom_comment ? (
          <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
            {review.custom_comment}
          </p>
        ) : (
          <p className="text-secondary text-sm leading-relaxed">
            {autoApproved
              ? 'Esta tarefa foi marcada como concluída automaticamente.'
              : submission
              ? 'Um supervisor vai revisar sua tarefa em breve.'
              : 'Ainda não recebemos sua resposta. Volte para a tarefa para enviar.'}
          </p>
        )}
        {review?.review_status &&
          review.review_status !== 'aprovada' &&
          !autoApproved && (
            <p className="text-xs text-secondary mt-3">
              Status: {review.review_status.replace('_', ' ')}
            </p>
          )}
      </Card>

      {autoApproved && <DonationBanner placement="learning_response" />}

      <div className="space-y-3 pt-2">
        <Button onClick={() => navigate('/minha-trilha')} className="w-full">
          Voltar para minha trilha
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/conteudos')}
          className="w-full"
        >
          Ver conteúdos sobre isso
        </Button>
      </div>
    </div>
  );
}
