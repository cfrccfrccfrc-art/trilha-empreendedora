import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const RANGES = [
  { value: '24h',  label: 'Últimas 24h', hours: 24 },
  { value: '7d',   label: 'Últimos 7d',  hours: 24 * 7 },
  { value: '30d',  label: 'Últimos 30d', hours: 24 * 30 },
  { value: 'all',  label: 'Tudo',        hours: null },
];

function hoursAgoISO(hours) {
  if (hours == null) return null;
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function Row({ label, value, hint }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2 border-b border-line last:border-b-0">
      <div className="min-w-0">
        <p className="text-ink text-sm leading-snug">{label}</p>
        {hint && (
          <p className="text-xs text-secondary leading-snug mt-0.5">{hint}</p>
        )}
      </div>
      <span className="font-bold text-ink text-lg shrink-0 tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function AdminMetrics() {
  const navigate = useNavigate();
  const { loading, session, supervisor, isAdmin } = useSupervisorSession();
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const since = useMemo(() => {
    const r = RANGES.find((x) => x.value === range);
    return hoursAgoISO(r?.hours);
  }, [range]);

  const load = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const client = getAuthClient();
      const queries = [];

      // client_events: agrupar por event_type
      let evQ = client.from('client_events').select('event_type');
      if (since) evQ = evQ.gte('created_at', since);
      queries.push(evQ);

      // contagens das tabelas operacionais (com filtro de tempo via created_at)
      const opTables = [
        { key: 'users',                  table: 'users' },
        { key: 'diagnostics',            table: 'diagnostics' },
        { key: 'plans',                  table: 'plans' },
        { key: 'task_submissions',       table: 'task_submissions',       timeField: 'submitted_at' },
        { key: 'help_requests',          table: 'help_requests' },
        { key: 'user_case_submissions',  table: 'user_case_submissions' },
      ];
      for (const t of opTables) {
        let q = client.from(t.table).select('id', { count: 'exact', head: true });
        if (since) q = q.gte(t.timeField || 'created_at', since);
        queries.push(q);
      }

      const results = await Promise.all(queries);
      const [eventsRes, ...counts] = results;
      if (eventsRes.error) throw eventsRes.error;

      // Agrega event_type
      const byType = {};
      for (const row of eventsRes.data || []) {
        byType[row.event_type] = (byType[row.event_type] || 0) + 1;
      }

      const opCounts = {};
      opTables.forEach((t, i) => {
        opCounts[t.key] = counts[i].count ?? 0;
      });

      setData({ byType, opCounts });
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
  }, [loading, session, supervisor, isAdmin, range]);

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;
  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader title="Métricas" />
        <Card className="border-coral">
          <p className="text-coral text-sm">
            Acesso restrito a administradores.
          </p>
        </Card>
      </div>
    );
  }

  const ev = data?.byType || {};
  const op = data?.opCounts || {};

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Admin"
        title="Métricas de uso"
        subtitle="Telemetria leve do app: funil do diagnóstico, conversões, cliques em parceiro, share."
      />

      <FilterChips
        label="Período"
        value={range}
        onChange={setRange}
        options={RANGES.map((r) => ({ value: r.value, label: r.label }))}
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

      {!loadingData && !error && data && (
        <>
          <Card>
            <h3 className="font-bold text-ink mb-2">Funil principal</h3>
            <Row
              label="Visitas à Home"
              value={ev.home_view || 0}
            />
            <Row
              label="Diagnósticos iniciados"
              value={ev.diagnostic_started || 0}
            />
            <Row
              label="Diagnósticos terminados"
              value={ev.diagnostic_completed || 0}
              hint="quem chegou no último passo"
            />
            <Row
              label="Planos salvos"
              value={op.plans || 0}
              hint="empreendedor que virou usuária e tem trilha ativa"
            />
            <Row
              label="Tarefas submetidas"
              value={op.task_submissions || 0}
            />
            <Row
              label="Histórias contadas (30d)"
              value={op.user_case_submissions || 0}
            />
            <Row
              label="Pedidos de ajuda"
              value={op.help_requests || 0}
            />
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">Engajamento secundário</h3>
            <Row
              label="Cliques no Projeto Pescadores"
              value={ev.pescadores_clicked || 0}
              hint="quem abriu o handoff pro parceiro"
            />
            <Row
              label="Aberturas da tela de compartilhar"
              value={ev.share_opened || 0}
            />
            <Row
              label="Compartilhamentos via WhatsApp"
              value={ev.share_whatsapp || 0}
              hint="cliques no botão WhatsApp do ShareSheet"
            />
            <Row
              label="Vê seu resultado (Results)"
              value={ev.results_view || 0}
            />
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">Taxas (calculadas)</h3>
            <Row
              label="Conclusão do diagnóstico"
              value={
                ev.diagnostic_started
                  ? `${Math.round(
                      ((ev.diagnostic_completed || 0) /
                        ev.diagnostic_started) *
                        100
                    )}%`
                  : '—'
              }
              hint="terminou / iniciou"
            />
            <Row
              label="Conversão diagnóstico → salvo"
              value={
                ev.diagnostic_completed
                  ? `${Math.round(
                      ((op.plans || 0) / ev.diagnostic_completed) * 100
                    )}%`
                  : '—'
              }
              hint="planos salvos / diagnósticos terminados"
            />
            <Row
              label="Tarefas por usuário"
              value={
                op.plans
                  ? ((op.task_submissions || 0) / op.plans).toFixed(1)
                  : '—'
              }
              hint="submissões / planos ativos"
            />
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">Eventos brutos</h3>
            {Object.keys(ev).length === 0 ? (
              <p className="text-secondary text-sm">
                Nenhum evento no período. Espere a app receber tráfego ou
                ajuste o filtro.
              </p>
            ) : (
              <ul className="text-sm space-y-1">
                {Object.entries(ev)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <li
                      key={type}
                      className="flex justify-between gap-2 text-secondary"
                    >
                      <code className="text-ink text-xs">{type}</code>
                      <span className="tabular-nums font-semibold">
                        {count}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </>
      )}

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
