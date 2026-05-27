import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import archetypes from '../data/archetypes.json';
import tasks from '../data/taskTemplates.json';
import resources from '../data/resources.json';
import cases from '../data/cases.json';
import opportunities from '../data/opportunities.json';
import feedback from '../data/feedbackTemplates.json';
import rubrics from '../data/rubrics.json';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import { getAuthClient } from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const ALL = '__all__';

const SOURCES = [
  { id: 'archetype',         label: 'Arquétipos',          data: archetypes,    fields: ['id', 'name', 'status'] },
  { id: 'task',              label: 'Tarefas',             data: tasks,         fields: ['id', 'title', 'archetypeId', 'reviewLevel', 'active'] },
  { id: 'resource',          label: 'Conteúdos',           data: resources,     fields: ['id', 'title', 'topic', 'source', 'status', 'sourceStatus'] },
  { id: 'case',              label: 'Casos',               data: cases,         fields: ['id', 'title', 'sector', 'status'] },
  { id: 'opportunity',       label: 'Oportunidades',       data: opportunities, fields: ['id', 'title', 'category', 'status', 'sourceStatus'] },
  { id: 'feedback_template', label: 'Modelos de retorno',  data: feedback,      fields: ['id', 'archetypeId', 'taskTemplateId', 'decision'] },
  { id: 'rubric',            label: 'Rubricas',            data: rubrics,       fields: ['id', 'name', 'appliesTo'] },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading, session, supervisor, isAdmin } = useSupervisorSession();
  const [tab, setTab] = useState(SOURCES[0].id);
  const [statusFilter, setStatusFilter] = useState(ALL);

  // Diagnóstico independente do hook: chamadas diretas ao client com timeout.
  const [probe, setProbe] = useState({ stage: 'init', err: null, raw: null, ms: null });
  const [probe2, setProbe2] = useState({ stage: 'init', err: null, ms: null });
  const [probe3, setProbe3] = useState({ stage: 'init', err: null, ms: null, status: null });
  const [swInfo, setSwInfo] = useState({ count: null });
  useEffect(() => {
    const t0 = Date.now();
    let mounted = true;

    let storageInfo;
    try {
      const raw = localStorage.getItem('trilha_supervisor_auth');
      storageInfo = raw ? `present (${raw.length} chars)` : 'MISSING';
    } catch (e) {
      storageInfo = `read-err: ${e?.message || e}`;
    }
    if (mounted) {
      setProbe((p) => ({ ...p, stage: 'storage-read', raw: storageInfo }));
    }

    let client;
    try {
      client = getAuthClient();
    } catch (e) {
      if (mounted) setProbe((p) => ({ ...p, stage: 'client-init-fail', err: e?.message || String(e) }));
      return () => { mounted = false; };
    }

    // Probe 1: getSession (path com refresh interno)
    const timeout1 = new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT 7s')), 7000));
    Promise.race([client.auth.getSession(), timeout1])
      .then((res) => {
        if (!mounted) return;
        const ms = Date.now() - t0;
        const s = res?.data?.session;
        setProbe({
          stage: s ? 'session-ok' : 'no-session',
          err: res?.error?.message || null,
          raw: storageInfo,
          ms,
          email: s?.user?.email || null,
          uid: s?.user?.id || null,
        });
      })
      .catch((e) => {
        if (!mounted) return;
        const ms = Date.now() - t0;
        setProbe({ stage: 'getSession-fail', err: e?.message || String(e), raw: storageInfo, ms });
      });

    // Probe 2: getUser (path sem auto-refresh do storage, mas hit no servidor)
    const t0b = Date.now();
    const timeout2 = new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT 5s')), 5000));
    Promise.race([client.auth.getUser(), timeout2])
      .then((res) => {
        if (!mounted) return;
        const ms = Date.now() - t0b;
        const u = res?.data?.user;
        setProbe2({
          stage: u ? 'user-ok' : 'no-user',
          err: res?.error?.message || null,
          ms,
          email: u?.email || null,
          uid: u?.id || null,
        });
      })
      .catch((e) => {
        if (!mounted) return;
        const ms = Date.now() - t0b;
        setProbe2({ stage: 'getUser-fail', err: e?.message || String(e), ms });
      });

    // Probe 3: fetch direto ao endpoint Supabase (sem usar supabase-js).
    // Isola se o travamento é da lib (supabase-js) ou da rede em si.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      const t0c = Date.now();
      const ac = new AbortController();
      const tid = setTimeout(() => ac.abort('TIMEOUT 5s'), 5000);
      fetch(`${supabaseUrl}/auth/v1/settings`, {
        method: 'GET',
        headers: { apikey: anonKey },
        signal: ac.signal,
      })
        .then((r) => {
          clearTimeout(tid);
          if (!mounted) return;
          setProbe3({ stage: 'fetch-ok', err: null, ms: Date.now() - t0c, status: r.status });
        })
        .catch((e) => {
          clearTimeout(tid);
          if (!mounted) return;
          setProbe3({ stage: 'fetch-fail', err: e?.message || String(e), ms: Date.now() - t0c, status: null });
        });
    } else {
      setProbe3({ stage: 'env-missing', err: 'VITE_SUPABASE_URL ou ANON_KEY ausente', ms: 0, status: null });
    }

    // SW registrations (pra ver se há algum interceptando)
    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (!mounted) return;
        setSwInfo({
          count: regs.length,
          scopes: regs.map((r) => r.scope),
        });
      }).catch(() => {
        if (!mounted) return;
        setSwInfo({ count: -1 });
      });
    }

    return () => { mounted = false; };
  }, []);

  const unregisterSW = async () => {
    try {
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    } catch (e) {
      console.error('unregister SW failed:', e);
    }
    window.location.reload();
  };

  const resetAuth = () => {
    try { localStorage.removeItem('trilha_supervisor_auth'); } catch {}
    try { sessionStorage.clear(); } catch {}
    window.location.href = '/supervisor/login';
  };

  const source = SOURCES.find((s) => s.id === tab);
  const filtered = useMemo(() => {
    if (!source) return [];
    if (statusFilter === ALL) return source.data;
    return source.data.filter((r) => (r.status || 'active') === statusFilter);
  }, [source, statusFilter]);

  // DEBUG BLOCK — sempre renderiza primeiro, mesmo durante loading.
  // Quando o problema for resolvido, removo este bloco.
  const debug = (
    <Card className="border-coral bg-coral/5">
      <p className="font-bold text-coral text-sm mb-2">⚠ Modo diagnóstico</p>
      <pre className="text-xs text-ink whitespace-pre-wrap font-mono leading-relaxed">
{JSON.stringify(
  {
    hook: {
      loading,
      hasSession: !!session,
      sessionEmail: session?.user?.email || null,
      hasSupervisor: !!supervisor,
      supervisorRole: supervisor?.role || null,
      supervisorActive: supervisor?.active ?? null,
      isAdmin,
    },
    probeGetSession: probe,
    probeGetUser: probe2,
    probeFetchDirect: probe3,
    serviceWorker: swInfo,
    href: typeof window !== 'undefined' ? window.location.href : null,
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    build: 'admin-debug-7-bypass-init',
  },
  null,
  2
)}
      </pre>
      <button
        type="button"
        onClick={resetAuth}
        className="mt-3 w-full min-h-10 px-4 rounded-xl bg-coral text-paper text-sm font-semibold"
      >
        Limpar sessão e voltar pro login
      </button>
      <button
        type="button"
        onClick={unregisterSW}
        className="mt-2 w-full min-h-10 px-4 rounded-xl border border-coral text-coral text-sm font-semibold"
      >
        Desregistrar Service Worker e recarregar
      </button>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <PageHeader title="Admin (carregando)" />
        {debug}
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/supervisor/login" replace />;
  }

  if (!supervisor) {
    return (
      <div className="space-y-3">
        <PageHeader title="Admin" />
        {debug}
        <Card className="border-coral">
          <p className="text-coral text-sm">
            Você está autenticada(o), mas não consta na lista de supervisores
            ativos. Peça pra alguém da equipe te cadastrar.
          </p>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-3">
        <PageHeader title="Admin" />
        {debug}
        <Card className="border-coral">
          <p className="text-coral text-sm">
            Acesso restrito a administradores. Você está como{' '}
            <strong>{supervisor.role || '(sem role)'}</strong>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Admin"
        title="Conteúdo"
        subtitle="Conteúdo seed vive no repositório (JSON). Estado do banco fica sob /supervisor."
      />

      {debug}

      <FilterChips
        label="Tabela"
        value={tab}
        onChange={setTab}
        options={SOURCES.map((s) => ({ value: s.id, label: s.label }))}
      />
      <FilterChips
        label="Status"
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: ALL, label: 'Todos' },
          { value: 'active', label: 'Ativo' },
          { value: 'draft', label: 'Rascunho' },
          { value: 'needs_review', label: 'Revisar' },
          { value: 'archived', label: 'Arquivado' },
        ]}
      />

      <p className="text-xs text-secondary px-1">
        {filtered.length} {filtered.length === 1 ? 'item' : 'itens'} ·{' '}
        edite o arquivo JSON correspondente em <code>src/data/</code> e faça
        deploy
      </p>

      <Button
        variant="secondary"
        onClick={() => navigate('/admin/preview')}
        className="w-full"
      >
        Pré-visualizar resultado para um perfil
      </Button>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/fontes')}
        className="w-full"
      >
        Atualizar fontes / revisão de conteúdo
      </Button>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/doacoes')}
        className="w-full"
      >
        Campanhas de doação (banner Pix)
      </Button>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/historias')}
        className="w-full"
      >
        Histórias enviadas pelos empreendedores
      </Button>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/metricas')}
        className="w-full"
      >
        Métricas de uso (funil + engajamento)
      </Button>

      <div className="space-y-2">
        {filtered.map((row) => (
          <Card key={row.id || row.title}>
            <p className="font-semibold text-ink leading-snug mb-2">
              {row.title || row.name || row.id}
            </p>
            <dl className="text-xs text-secondary space-y-1">
              {source.fields.map((f) => (
                <div key={f} className="flex gap-2">
                  <dt className="font-semibold text-ink min-w-24">{f}</dt>
                  <dd className="break-all">
                    {row[f] === undefined || row[f] === null
                      ? '—'
                      : String(row[f])}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
