import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import resourcesData from '../data/resources.json';
import opportunitiesData from '../data/opportunities.json';
import casesData from '../data/cases.json';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import {
  fetchTaskFailureRates,
  fetchOverdueContentReviews,
  fetchOpenContentGaps,
  nextReviewDate,
} from '../services/contentService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

function isOverdue(item) {
  if (!item.nextReview) return false;
  return item.nextReview <= new Date().toISOString().slice(0, 10);
}

const NEEDS_ATTENTION_STATUSES = ['needs_review', 'broken_link', 'outdated'];

function flagged(items) {
  return items.filter(
    (i) => isOverdue(i) || NEEDS_ATTENTION_STATUSES.includes(i.sourceStatus)
  );
}

export default function SourceRefresh() {
  const { loading, session, supervisor } = useSupervisorSession();
  const [serverData, setServerData] = useState({
    overdue: [],
    gaps: [],
    failures: [],
  });
  const [serverError, setServerError] = useState(null);
  const [marked, setMarked] = useState({});

  useEffect(() => {
    if (loading || !session || !supervisor) return;
    let cancelled = false;
    (async () => {
      try {
        const client = getAuthClient();
        const [overdue, gaps, failures] = await Promise.all([
          fetchOverdueContentReviews(client),
          fetchOpenContentGaps(client),
          fetchTaskFailureRates(client),
        ]);
        if (!cancelled) setServerData({ overdue, gaps, failures });
      } catch (err) {
        console.error(err);
        if (!cancelled) setServerError(err?.message || 'Erro ao carregar.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session, supervisor]);

  const seedFlagged = useMemo(
    () => ({
      resources: flagged(resourcesData),
      opportunities: flagged(opportunitiesData),
      cases: casesData.filter((c) => c.status === 'draft'),
    }),
    []
  );

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;

  const handleMark = async (contentType, contentId) => {
    try {
      const client = getAuthClient();
      const next = nextReviewDate(contentType);
      const { error } = await client.from('content_reviews').insert({
        content_type: contentType,
        content_id: contentId,
        reviewed_by: supervisor.id,
        status: 'ok',
        next_review: next,
      });
      if (error) throw error;
      setMarked((m) => ({ ...m, [`${contentType}:${contentId}`]: next }));
    } catch (err) {
      alert(err?.message || 'Erro ao salvar revisão.');
    }
  };

  const renderList = (label, type, items) => (
    <Card>
      <h3 className="font-bold text-ink mb-3">{label} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-secondary text-sm">Nada para revisar.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const key = `${type}:${item.id}`;
            const markedAt = marked[key];
            return (
              <li key={item.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                <p className="font-semibold text-ink leading-snug mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-secondary mb-2">
                  {item.sourceStatus && <>status: {item.sourceStatus} · </>}
                  última revisão: {item.lastReviewed || '—'} · próxima: {item.nextReview || '—'}
                </p>
                {markedAt ? (
                  <p className="text-green text-xs">
                    Marcado como revisado. Próxima revisão: {markedAt}
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => handleMark(type, item.id)}
                    className="px-3"
                  >
                    Marcar revisado
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Admin"
        title="Atualizar fontes"
        subtitle="Conteúdo com revisão vencida ou link quebrado."
      />

      {serverError && (
        <Card className="border-coral">
          <p className="text-coral text-sm">{serverError}</p>
        </Card>
      )}

      {renderList('Conteúdos para revisar', 'resource', seedFlagged.resources)}
      {renderList('Oportunidades para revisar', 'opportunity', seedFlagged.opportunities)}
      {renderList('Casos em rascunho', 'case', seedFlagged.cases)}

      <Card>
        <h3 className="font-bold text-ink mb-3">
          Tarefas com alta taxa de falha (últimos 30 dias)
        </h3>
        {serverData.failures.length === 0 ? (
          <p className="text-secondary text-sm">
            Nenhuma tarefa com taxa &gt; 40% e ao menos 5 envios.
          </p>
        ) : (
          <ul className="space-y-2">
            {serverData.failures.map((f) => (
              <li key={f.tplId} className="text-sm">
                <strong>{f.title || f.tplId}</strong>{' '}
                <span className="text-secondary">
                  · {Math.round(f.failureRate * 100)}% ({f.failed}/{f.total})
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-3">Gaps abertos (banco)</h3>
        {serverData.gaps.length === 0 ? (
          <p className="text-secondary text-sm">Nenhum gap aberto.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {serverData.gaps.map((g) => (
              <li key={g.id}>
                <strong>{g.type}</strong> · {g.reference_id}
                {g.observation && (
                  <p className="text-secondary text-xs mt-1">
                    {g.observation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-3">
          Revisões vencidas registradas
        </h3>
        {serverData.overdue.length === 0 ? (
          <p className="text-secondary text-sm">Nada vencido no banco.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {serverData.overdue.map((r) => (
              <li key={r.id}>
                {r.content_type} · {r.content_id} · venceu em {r.next_review}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
