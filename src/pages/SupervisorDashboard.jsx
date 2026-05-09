import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import { fetchPendingSubmissions } from '../services/contentService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const ALL = '__all__';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { loading, session, supervisor, signOut } = useSupervisorSession();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [archetypeFilter, setArchetypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [needsHelpFilter, setNeedsHelpFilter] = useState(false);

  useEffect(() => {
    if (loading || !session || !supervisor) return;
    let cancelled = false;
    (async () => {
      setLoadingItems(true);
      try {
        const client = getAuthClient();
        const list = await fetchPendingSubmissions(client, {
          needsHelp: needsHelpFilter || undefined,
          status: statusFilter !== ALL ? statusFilter : undefined,
        });
        if (!cancelled) setItems(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err?.message || 'Erro ao carregar fila.');
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session, supervisor, needsHelpFilter, statusFilter]);

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;

  const archetypeOptions = [
    { value: ALL, label: 'Todos' },
    ...archetypesData
      .filter((a) => a.status === 'active')
      .map((a) => ({ value: a.id, label: a.name })),
  ];

  const filteredItems = items.filter((s) => {
    if (archetypeFilter === ALL) return true;
    // Archetype lives on the plan; we don't have it joined here, so accept all
    // for now (the supervisor can refine later via the review page).
    return true;
  });

  const statusOptions = [
    { value: ALL, label: 'Todos' },
    { value: 'Fiz', label: 'Fiz' },
    { value: 'Fiz em parte', label: 'Fiz em parte' },
    { value: 'Não consegui', label: 'Não consegui' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        accent={supervisor.role === 'admin' ? 'Admin' : 'Supervisor'}
        title="Fila de revisão"
        subtitle={`${filteredItems.length} pendentes`}
      />

      <FilterChips
        label="Status reportado"
        value={statusFilter}
        onChange={setStatusFilter}
        options={statusOptions}
      />
      <FilterChips
        label="Perfil"
        value={archetypeFilter}
        onChange={setArchetypeFilter}
        options={archetypeOptions}
      />

      <label className="flex items-center gap-3 text-sm text-ink cursor-pointer pb-2">
        <input
          type="checkbox"
          checked={needsHelpFilter}
          onChange={(e) => setNeedsHelpFilter(e.target.checked)}
          className="w-5 h-5 accent-primary"
        />
        Só com pedido de ajuda
      </label>

      {loadingItems && (
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      )}

      {error && (
        <Card className="border-coral">
          <p className="text-coral text-sm">{error}</p>
        </Card>
      )}

      <div className="space-y-3">
        {filteredItems.map((s) => {
          const firstName = (s.users?.name || '').split(' ')[0] || '—';
          return (
            <Card
              key={s.id}
              className="cursor-pointer hover:bg-beige transition-colors"
              onClick={() => navigate(`/supervisor/revisar/${s.id}`)}
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <p className="font-semibold text-ink leading-snug flex-1">
                  {s.tasks?.title || 'Tarefa'}
                </p>
                <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-line text-secondary">
                  {s.status_reported}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-secondary">
                <span>{firstName}</span>
                {s.users?.city && <span>· {s.users.city}</span>}
                <span>· semana {s.tasks?.week}</span>
                <span>· {s.tasks?.review_level}</span>
                {s.needs_help && (
                  <span className="text-coral">· precisa de ajuda</span>
                )}
              </div>
            </Card>
          );
        })}
        {!loadingItems && filteredItems.length === 0 && (
          <Card>
            <p className="text-secondary text-sm">
              Fila vazia. Bom trabalho!
            </p>
          </Card>
        )}
      </div>

      <Button variant="ghost" onClick={signOut} className="w-full mt-4">
        Sair
      </Button>
    </div>
  );
}
