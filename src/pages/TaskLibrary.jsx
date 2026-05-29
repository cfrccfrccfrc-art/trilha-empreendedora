import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import taskTemplates from '../data/taskTemplates.json';
import archetypesData from '../data/archetypes.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const ALL = '__all__';

export default function TaskLibrary() {
  const navigate = useNavigate();

  const archetypeOptions = useMemo(
    () =>
      archetypesData
        .filter((a) => a.status === 'active')
        .map((a) => ({ value: a.id, label: a.name })),
    []
  );

  const weekOptions = [
    { value: ALL, label: 'Todas as semanas' },
    { value: '1', label: 'Semana 1' },
    { value: '2', label: 'Semana 2' },
    { value: '3', label: 'Semana 3' },
    { value: '4', label: 'Semana 4' },
  ];

  const [archetypeId, setArchetypeId] = useState(ALL);
  const [week, setWeek] = useState(ALL);

  const filtered = useMemo(() => {
    return taskTemplates
      .filter((t) => t.active !== false)
      .filter((t) => (archetypeId === ALL ? true : t.archetypeId === archetypeId))
      .filter((t) => (week === ALL ? true : String(t.week) === week));
  }, [archetypeId, week]);

  const byArchetype = useMemo(() => {
    const groups = new Map();
    for (const t of filtered) {
      const key = t.archetypeId || 'sem_arquetipo';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    }
    for (const [, list] of groups) {
      list.sort((a, b) => (a.week || 0) - (b.week || 0));
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Biblioteca"
        title="Tarefas avulsas"
        subtitle="Para consultores e parceiros: tarefas prontas pra adaptar no atendimento."
      />

      <Card className="bg-beige/60 border-line">
        <p className="text-secondary text-xs leading-relaxed">
          Cada tarefa tem ação, propósito, perguntas de reflexão e armadilhas
          comuns. Você pode abrir uma tarefa e copiar o texto formatado pra
          colar em Slack, Notion, Word ou Google Docs.
        </p>
      </Card>

      <FilterChips
        label="Arquétipo"
        value={archetypeId}
        onChange={setArchetypeId}
        options={[
          { value: ALL, label: 'Todos' },
          ...archetypeOptions,
        ]}
      />
      <FilterChips
        label="Semana"
        value={week}
        onChange={setWeek}
        options={weekOptions}
      />

      <p className="text-xs text-secondary px-1">
        {filtered.length} {filtered.length === 1 ? 'tarefa' : 'tarefas'}
      </p>

      {byArchetype.length === 0 && (
        <Card>
          <p className="text-secondary text-sm">
            Nenhuma tarefa com esses filtros.
          </p>
        </Card>
      )}

      {byArchetype.map(([archId, list]) => {
        const arch = archetypesData.find((a) => a.id === archId);
        return (
          <div key={archId} className="space-y-2">
            <p className="font-hand text-secondary text-lg leading-tight px-1">
              {arch?.name || archId}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((t) => (
                <Card
                  key={t.id}
                  interactive
                  tone="soft"
                  className="h-full"
                  onClick={() => navigate(`/biblioteca/tarefas/${t.id}`)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-ink leading-snug mb-1">
                        {t.title}
                      </p>
                      {t.action && (
                        <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                          {t.action}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-secondary font-semibold shrink-0">
                      S{t.week}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      <Button
        variant="ghost"
        onClick={() => navigate('/casos')}
        className="w-full"
      >
        Ver também: biblioteca de casos
      </Button>
    </div>
  );
}
