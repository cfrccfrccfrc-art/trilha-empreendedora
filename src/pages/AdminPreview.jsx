import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplates from '../data/taskTemplates.json';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const PAINS = ['', 'financas', 'preco', 'capital', 'operacao', 'divulgacao', 'clientes', 'tempo', 'formalizacao'];
const SECTORS = ['', 'food', 'fashion_beauty', 'services', 'handcraft', 'other'];

export default function AdminPreview() {
  const { loading, session, supervisor, isAdmin } = useSupervisorSession();
  const [archetypeId, setArchetypeId] = useState('vende_sem_lucro');
  const [mainPain, setMainPain] = useState('financas');
  const [sector, setSector] = useState('');

  if (loading) return null;
  if (!session || !supervisor) return <Navigate to="/supervisor/login" replace />;
  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader title="Preview Admin" />
        <Card className="border-coral">
          <p className="text-coral text-sm">Acesso restrito.</p>
        </Card>
      </div>
    );
  }

  const archetype = useMemo(
    () => archetypesData.find((a) => a.id === archetypeId),
    [archetypeId]
  );
  const firstTask = useMemo(
    () =>
      archetype?.firstTaskId
        ? taskTemplates.find((t) => t.id === archetype.firstTaskId)
        : null,
    [archetype]
  );
  const isActive = archetype?.status === 'active';

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Admin"
        title="Pré-visualização"
        subtitle="Veja o resultado como uma pessoa veria."
      />

      <Card>
        <div className="grid gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Arquétipo</span>
            <select
              value={archetypeId}
              onChange={(e) => setArchetypeId(e.target.value)}
              className="w-full mt-1 min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-sm"
            >
              {archetypesData.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Dor principal</span>
            <select
              value={mainPain}
              onChange={(e) => setMainPain(e.target.value)}
              className="w-full mt-1 min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-sm"
            >
              {PAINS.map((p) => (
                <option key={p} value={p}>
                  {p || '—'}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Setor</span>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full mt-1 min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-sm"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s || '—'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <div className="space-y-5 pt-4 border-t border-line">
        <PageHeader
          accent="Pré-visualização"
          title={archetype?.name || archetypeId}
        />

        {!isActive && (
          <Card>
            <h3 className="font-bold text-ink mb-2">Conteúdo em construção</h3>
            <p className="text-secondary text-sm">
              Esse arquétipo está como <code>{archetype?.status}</code>. Apenas o nome aparece pra usuário final.
            </p>
          </Card>
        )}

        {isActive && (
          <>
            <Card>
              <p className="text-ink text-base leading-relaxed mb-3">
                {archetype.shortDescription}
              </p>
              <p className="text-secondary text-sm leading-relaxed">
                {archetype.commonPain}
              </p>
            </Card>

            <Card>
              <h3 className="font-bold text-ink mb-2">O que evitar agora</h3>
              <p className="text-secondary text-sm leading-relaxed">
                {archetype.avoidNow}
              </p>
            </Card>

            {firstTask && (
              <Card className="border-primary">
                <p className="font-hand text-secondary text-base leading-tight mb-1">
                  Sua primeira missão
                </p>
                <h3 className="font-bold text-ink mb-2">{firstTask.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  {firstTask.action}
                </p>
              </Card>
            )}

            {archetype.roadmap30d && (
              <Card>
                <h3 className="font-bold text-ink mb-3">Trilha de 30 dias</h3>
                <ol className="space-y-3">
                  {archetype.roadmap30d.map((week) => (
                    <li key={week.week} className="flex gap-3">
                      <span className="font-hand text-primary text-lg leading-tight shrink-0 w-20">
                        Semana {week.week}
                      </span>
                      <span className="text-ink text-sm leading-snug pt-0.5">
                        {week.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            <Card>
              <h3 className="font-bold text-ink mb-2">Diagnóstico simulado</h3>
              <dl className="text-xs text-secondary space-y-1">
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">Dor principal</dt>
                  <dd>{mainPain || '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">Setor</dt>
                  <dd>{sector || '—'}</dd>
                </div>
              </dl>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
