import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import archetypes from '../data/archetypes.json';
import tasks from '../data/taskTemplates.json';
import resources from '../data/resources.json';
import cases from '../data/cases.json';
import opportunities from '../data/opportunities.json';
import feedback from '../data/feedbackTemplates.json';
import rubrics from '../data/rubrics.json';
import { useSupervisorSession } from '../utils/useSupervisorSession';
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

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;
  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader title="Admin" />
        <Card className="border-coral">
          <p className="text-coral text-sm">
            Acesso restrito a administradores.
          </p>
        </Card>
      </div>
    );
  }

  const source = SOURCES.find((s) => s.id === tab);
  const filtered = useMemo(() => {
    if (statusFilter === ALL) return source.data;
    return source.data.filter((r) => (r.status || 'active') === statusFilter);
  }, [source, statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Admin"
        title="Conteúdo"
        subtitle="Conteúdo seed vive no repositório (JSON). Estado do banco fica sob /supervisor."
      />

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
