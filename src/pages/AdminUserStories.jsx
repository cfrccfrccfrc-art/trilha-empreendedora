import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const STATUS_LABELS = {
  submitted: 'Recebido',
  in_review: 'Em revisão',
  anonymized: 'Anonimizado',
  published: 'Publicado',
  rejected: 'Recusado',
};

const STATUSES = ['submitted', 'in_review', 'anonymized', 'published', 'rejected'];

const ALL = '__all__';

function archetypeName(id) {
  return archetypesData.find((a) => a.id === id)?.name || id;
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
}

export default function AdminUserStories() {
  const navigate = useNavigate();
  const { loading, session, supervisor, isAdmin } = useSupervisorSession();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState(ALL);
  const [editing, setEditing] = useState({});

  const load = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const client = getAuthClient();
      const { data, error: e } = await client
        .from('user_case_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (e) throw e;
      setStories(data || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Erro ao carregar.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (loading || !session || !supervisor || !isAdmin) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, supervisor, isAdmin]);

  const filtered = useMemo(() => {
    if (filter === ALL) return stories;
    return stories.filter((s) => s.status === filter);
  }, [stories, filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const client = getAuthClient();
      const { error: e } = await client
        .from('user_case_submissions')
        .update({ status: newStatus })
        .eq('id', id);
      if (e) throw e;
      await load();
    } catch (err) {
      alert(err?.message || 'Erro ao salvar.');
    }
  };

  const handleSaveNotes = async (id) => {
    const local = editing[id] || {};
    try {
      const client = getAuthClient();
      const payload = {};
      if (local.reviewer_notes !== undefined)
        payload.reviewer_notes = local.reviewer_notes;
      if (local.published_case_id !== undefined)
        payload.published_case_id = local.published_case_id || null;
      if (Object.keys(payload).length === 0) return;
      const { error: e } = await client
        .from('user_case_submissions')
        .update(payload)
        .eq('id', id);
      if (e) throw e;
      setEditing((s) => ({ ...s, [id]: undefined }));
      await load();
    } catch (err) {
      alert(err?.message || 'Erro ao salvar.');
    }
  };

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;
  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader title="Histórias enviadas" />
        <Card className="border-coral">
          <p className="text-coral text-sm">
            Acesso restrito a administradores.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Admin"
        title="Histórias enviadas"
        subtitle="Cases compartilhados por empreendedores ao terminar 30 dias. Trate com cuidado: cada um confiou na gente."
      />

      <FilterChips
        label="Status"
        value={filter}
        onChange={setFilter}
        options={[
          { value: ALL, label: `Tudo (${stories.length})` },
          ...STATUSES.map((s) => ({
            value: s,
            label: `${STATUS_LABELS[s]} (${stories.filter((x) => x.status === s).length})`,
          })),
        ]}
      />

      {loadingData && (
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      )}

      {error && (
        <Card className="border-coral">
          <p className="text-coral text-sm">{error}</p>
        </Card>
      )}

      {!loadingData && filtered.length === 0 && (
        <Card>
          <p className="text-secondary text-sm">
            Sem histórias nessa categoria.
          </p>
        </Card>
      )}

      {filtered.map((s) => {
        const e = editing[s.id] || {};
        return (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-ink leading-snug">
                  {s.business_short || '(sem descrição)'}
                </p>
                <p className="text-xs text-secondary leading-snug mt-1">
                  {archetypeName(s.archetype_id)} ·{' '}
                  {formatDate(s.created_at)}
                </p>
              </div>
              <span className="text-xs font-semibold bg-beige border border-line rounded-full px-2 py-1 text-ink shrink-0">
                {STATUS_LABELS[s.status] || s.status}
              </span>
            </div>

            <dl className="text-sm space-y-3 mb-3">
              {s.biggest_change && (
                <div>
                  <dt className="font-semibold text-ink">O que mudou</dt>
                  <dd className="text-secondary leading-relaxed whitespace-pre-wrap">
                    {s.biggest_change}
                  </dd>
                </div>
              )}
              {s.favorite_week && (
                <div>
                  <dt className="font-semibold text-ink">
                    Missão que ensinou mais
                  </dt>
                  <dd className="text-secondary leading-relaxed whitespace-pre-wrap">
                    Semana {s.favorite_week}
                    {s.favorite_week_lesson && `: ${s.favorite_week_lesson}`}
                  </dd>
                </div>
              )}
              {s.difficulty && (
                <div>
                  <dt className="font-semibold text-ink">Maior dificuldade</dt>
                  <dd className="text-secondary leading-relaxed whitespace-pre-wrap">
                    {s.difficulty}
                  </dd>
                </div>
              )}
              {s.result_concrete && (
                <div>
                  <dt className="font-semibold text-ink">
                    Resultado concreto
                  </dt>
                  <dd className="text-secondary leading-relaxed whitespace-pre-wrap">
                    {s.result_concrete}
                  </dd>
                </div>
              )}
              {s.message_to_others && (
                <div>
                  <dt className="font-semibold text-ink">
                    Mensagem pra quem está começando
                  </dt>
                  <dd className="text-secondary leading-relaxed whitespace-pre-wrap">
                    {s.message_to_others}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-ink">Consentimentos</dt>
                <dd className="text-secondary text-xs leading-relaxed">
                  Publicar: {s.consent_publish ? 'sim' : 'não'} · Citar nome:{' '}
                  {s.include_real_name ? 'sim' : 'não'} · Citar região:{' '}
                  {s.include_region ? 'sim' : 'não'}
                </dd>
              </div>
            </dl>

            <div className="border-t border-line pt-3 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-ink mb-1 block">
                  Notas do revisor
                </span>
                <textarea
                  defaultValue={s.reviewer_notes || ''}
                  rows={2}
                  onChange={(ev) =>
                    setEditing((st) => ({
                      ...st,
                      [s.id]: { ...st[s.id], reviewer_notes: ev.target.value },
                    }))
                  }
                  className="w-full bg-paper border border-line rounded-lg p-2 text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-ink mb-1 block">
                  ID do case publicado (cases.json)
                </span>
                <input
                  type="text"
                  defaultValue={s.published_case_id || ''}
                  placeholder="ex: case_user_2026_05_aline_costureira"
                  onChange={(ev) =>
                    setEditing((st) => ({
                      ...st,
                      [s.id]: {
                        ...st[s.id],
                        published_case_id: ev.target.value,
                      },
                    }))
                  }
                  className="w-full bg-paper border border-line rounded-lg p-2 text-sm text-ink"
                />
              </label>

              {(e.reviewer_notes !== undefined ||
                e.published_case_id !== undefined) && (
                <Button
                  variant="secondary"
                  onClick={() => handleSaveNotes(s.id)}
                  className="w-full"
                >
                  Salvar notas e ID
                </Button>
              )}

              <div className="flex flex-wrap gap-2">
                {STATUSES.filter((st) => st !== s.status).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(s.id, st)}
                    className="text-xs bg-paper border border-line rounded-full px-3 py-1 hover:bg-beige"
                  >
                    → {STATUS_LABELS[st]}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        );
      })}

      <Button
        variant="ghost"
        onClick={() => navigate('/admin')}
        className="w-full"
      >
        ← Voltar para admin
      </Button>
    </div>
  );
}
