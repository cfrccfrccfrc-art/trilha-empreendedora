import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplates from '../data/taskTemplates.json';
import feedbackTemplates from '../data/feedbackTemplates.json';
import rubrics from '../data/rubrics.json';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const DECISIONS = [
  { value: 'aprovada',        label: 'Aprovar',         taskStatus: 'concluida' },
  { value: 'precisa_ajustar', label: 'Pedir ajuste',    taskStatus: 'precisa_ajustar' },
  { value: 'travada',         label: 'Marcar travada',  taskStatus: 'a_fazer' },
  { value: 'encaminhada',     label: 'Encaminhar ajuda',taskStatus: 'enviada' },
  { value: 'escalada',        label: 'Escalar',         taskStatus: 'enviada' },
];

export default function SupervisorReview() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { loading, session, supervisor } = useSupervisorSession();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [decision, setDecision] = useState('aprovada');
  const [feedbackId, setFeedbackId] = useState('');
  const [comment, setComment] = useState('');
  const [rubricChecks, setRubricChecks] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading || !session || !supervisor) return;
    let cancelled = false;
    (async () => {
      setLoadingData(true);
      try {
        const client = getAuthClient();
        const { data: sub, error: e1 } = await client
          .from('task_submissions')
          .select(`
            *,
            tasks ( id, title, week, review_level, task_template_id, plan_id, status ),
            users ( id, name, city, neighborhood )
          `)
          .eq('id', submissionId)
          .single();
        if (e1) throw e1;

        const { data: plan } = await client
          .from('plans')
          .select('id, archetype_id, current_week')
          .eq('id', sub.tasks?.plan_id)
          .single();

        if (!cancelled) {
          setData({ sub, plan });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err?.message || 'Erro ao carregar.');
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session, supervisor, submissionId]);

  const template = useMemo(() => {
    if (!data?.sub?.tasks?.task_template_id) return null;
    return taskTemplates.find((t) => t.id === data.sub.tasks.task_template_id);
  }, [data]);

  const archetype = useMemo(() => {
    if (!data?.plan?.archetype_id) return null;
    return archetypesData.find((a) => a.id === data.plan.archetype_id);
  }, [data]);

  const matchingTemplates = useMemo(() => {
    if (!template) return [];
    return feedbackTemplates.filter(
      (f) =>
        (f.taskTemplateId === template.id ||
          f.archetypeId === archetype?.id ||
          (f.taskTemplateId === null && f.archetypeId === null)) &&
        f.decision === decision
    );
  }, [template, archetype, decision]);

  const rubric = useMemo(() => {
    if (!template) return null;
    return rubrics.find((r) => r.appliesTo === template.id);
  }, [template]);

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;

  if (loadingData) {
    return (
      <div className="space-y-5">
        <PageHeader title="Revisar" />
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Revisar" />
        <Card className="border-coral">
          <p className="text-coral text-sm">{error || 'Não encontrado.'}</p>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Revisado" title="Pronto" />
        <Card>
          <p className="text-secondary text-sm leading-relaxed">
            A entrepreneur será avisada na próxima vez que abrir a trilha.
          </p>
        </Card>
        <Button onClick={() => navigate('/supervisor')} className="w-full">
          Voltar para a fila
        </Button>
      </div>
    );
  }

  const { sub } = data;
  const firstName = (sub.users?.name || '').split(' ')[0] || '—';

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const client = getAuthClient();
      const decisionMeta = DECISIONS.find((d) => d.value === decision);

      const fbTemplate = feedbackTemplates.find((f) => f.id === feedbackId);
      const customComment =
        comment.trim() ||
        [fbTemplate?.recognition, fbTemplate?.learning, fbTemplate?.adjustment, fbTemplate?.nextStep]
          .filter(Boolean)
          .join('\n\n') ||
        null;

      const rubricScores = Object.keys(rubricChecks).length
        ? rubricChecks
        : null;

      const { error: revErr } = await client.from('task_reviews').insert({
        submission_id: sub.id,
        reviewer_id: supervisor.id,
        review_status: decision,
        rubric_scores_json: rubricScores,
        feedback_template_id: feedbackId || null,
        custom_comment: customComment,
        next_action: decisionMeta?.taskStatus || null,
      });
      if (revErr) throw revErr;

      const update = { status: decisionMeta?.taskStatus || 'enviada' };
      if (decision === 'aprovada') update.completed_at = new Date().toISOString();
      const { error: tErr } = await client
        .from('tasks')
        .update(update)
        .eq('id', sub.task_id);
      if (tErr) throw tErr;

      if (decision === 'encaminhada') {
        await client.from('help_requests').insert({
          user_id: sub.user_id,
          task_id: sub.task_id,
          submission_id: sub.id,
          topic: 'tarefa',
          message: `Encaminhada por ${supervisor.name || supervisor.email}: ${customComment || ''}`.slice(0, 500),
          status: 'aberto',
        });
      }

      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Erro ao salvar revisão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        accent={`${firstName} · semana ${sub.tasks?.week}`}
        title={sub.tasks?.title || 'Tarefa'}
      />

      {template && (
        <>
          <Card>
            <h3 className="font-bold text-ink mb-2">O que era pra fazer</h3>
            <p className="text-secondary text-sm leading-relaxed mb-2">
              {template.action}
            </p>
            <p className="text-secondary text-sm leading-relaxed">
              <strong>Por que importa:</strong> {template.purpose}
            </p>
          </Card>
          <Card>
            <h3 className="font-bold text-ink mb-2">Aprendizado esperado</h3>
            <p className="text-secondary text-sm leading-relaxed">
              {template.expectedLearning}
            </p>
          </Card>
        </>
      )}

      <Card>
        <h3 className="font-bold text-ink mb-2">Resposta da pessoa</h3>
        <p className="text-xs text-secondary mb-2">
          Status reportado: <strong>{sub.status_reported}</strong>
          {sub.obstacle && <> · obstáculo: {sub.obstacle}</>}
          {sub.needs_help && <span className="text-coral"> · pediu ajuda</span>}
        </p>
        {sub.text_response ? (
          <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
            {sub.text_response}
          </p>
        ) : (
          <p className="text-secondary text-sm italic">Sem texto.</p>
        )}
        {Array.isArray(sub.evidence_url) && sub.evidence_url.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-secondary mb-2">
              Evidências enviadas ({sub.evidence_url.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              {sub.evidence_url.map((url, idx) => {
                const isImage = /\.(jpe?g|png|webp|gif)$/i.test(url);
                return (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-20 h-20 rounded-xl border border-line overflow-hidden bg-beige hover:border-primary transition-colors"
                  >
                    {isImage ? (
                      <img
                        src={url}
                        alt={`Evidência ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-primary p-1 text-center break-all">
                        link
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {rubric && (
        <Card>
          <h3 className="font-bold text-ink mb-3">Rubrica: {rubric.name}</h3>
          <ul className="space-y-2">
            {rubric.criteria.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!rubricChecks[c.id]}
                  onChange={(e) =>
                    setRubricChecks((s) => ({ ...s, [c.id]: e.target.checked }))
                  }
                  className="mt-1 w-5 h-5 accent-primary"
                />
                <span className="text-sm text-ink leading-snug flex-1">
                  {c.label}{' '}
                  <span className="text-secondary">(peso {c.weight})</span>
                </span>
              </li>
            ))}
          </ul>
          {rubric.notes && (
            <p className="text-xs text-secondary mt-3">{rubric.notes}</p>
          )}
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-ink mb-3">Decisão</h3>
        <div className="space-y-2 mb-4">
          {DECISIONS.map((d) => (
            <label
              key={d.value}
              className={`flex items-center gap-3 min-h-12 px-4 rounded-xl border cursor-pointer transition-colors ${
                decision === d.value
                  ? 'border-primary bg-primaryLight'
                  : 'border-line bg-paper'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-ink">{d.label}</span>
            </label>
          ))}
        </div>

        {matchingTemplates.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-ink mb-1">
              Modelo de retorno (opcional)
            </p>
            <select
              value={feedbackId}
              onChange={(e) => setFeedbackId(e.target.value)}
              className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Sem modelo (escrever do zero)</option>
              {matchingTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink mb-1">
            Comentário pra pessoa
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
            placeholder="Se vazio, usamos o modelo selecionado."
          />
        </div>

        {error && <p className="text-coral text-sm mb-3">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? 'Salvando…' : 'Salvar revisão'}
        </Button>
      </Card>

      <Button
        variant="ghost"
        onClick={() => navigate('/supervisor')}
        className="w-full"
      >
        ← Voltar para a fila
      </Button>
    </div>
  );
}
