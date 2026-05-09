import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resourcesData from '../data/resources.json';
import archetypesData from '../data/archetypes.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const ALL = '__all__';

const TYPE_LABELS = {
  guide: 'Guia',
  template: 'Modelo',
  external_guide: 'Guia externo',
  external_portal: 'Portal',
  community: 'Comunidade',
};

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export default function Resources() {
  const navigate = useNavigate();
  const all = useMemo(
    () => resourcesData.filter((r) => r.status === 'active'),
    []
  );

  const topics = useMemo(
    () => uniq(all.map((r) => r.topic)),
    [all]
  );
  const sectors = useMemo(
    () => uniq(all.map((r) => r.sector)),
    [all]
  );
  const archetypeOptions = useMemo(
    () =>
      archetypesData
        .filter((a) => a.status === 'active')
        .map((a) => ({ value: a.id, label: a.name })),
    []
  );
  const typeOptions = useMemo(
    () =>
      uniq(all.map((r) => r.type)).map((t) => ({
        value: t,
        label: TYPE_LABELS[t] || t,
      })),
    [all]
  );

  const [topic, setTopic] = useState(ALL);
  const [sector, setSector] = useState(ALL);
  const [archetype, setArchetype] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [freeOnly, setFreeOnly] = useState(false);

  const list = useMemo(() => {
    return all.filter((r) => {
      if (topic !== ALL && r.topic !== topic) return false;
      if (sector !== ALL && r.sector !== sector && r.sector !== 'geral') return false;
      if (archetype !== ALL && !(r.recommendedArchetypes || []).includes(archetype)) return false;
      if (type !== ALL && r.type !== type) return false;
      if (freeOnly && !r.free) return false;
      return true;
    });
  }, [all, topic, sector, archetype, type, freeOnly]);

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Conteúdos"
        title="Materiais práticos"
        subtitle="Guias rápidos, modelos e portais para apoiar suas tarefas."
      />

      <FilterChips
        label="Tema"
        value={topic}
        onChange={setTopic}
        options={[{ value: ALL, label: 'Todos' }, ...topics.map((t) => ({ value: t, label: t }))]}
      />
      <FilterChips
        label="Setor"
        value={sector}
        onChange={setSector}
        options={[{ value: ALL, label: 'Todos' }, ...sectors.map((s) => ({ value: s, label: s }))]}
      />
      <FilterChips
        label="Perfil"
        value={archetype}
        onChange={setArchetype}
        options={[{ value: ALL, label: 'Todos' }, ...archetypeOptions]}
      />
      <FilterChips
        label="Tipo"
        value={type}
        onChange={setType}
        options={[{ value: ALL, label: 'Todos' }, ...typeOptions]}
      />

      <label className="flex items-center gap-3 text-sm text-ink cursor-pointer pb-2">
        <input
          type="checkbox"
          checked={freeOnly}
          onChange={(e) => setFreeOnly(e.target.checked)}
          className="w-5 h-5 accent-primary"
        />
        Só gratuitos
      </label>

      <p className="text-xs text-secondary px-1">
        {list.length} {list.length === 1 ? 'material' : 'materiais'}
      </p>

      <div className="space-y-3">
        {list.map((r) => (
          <Card
            key={r.id}
            className="cursor-pointer hover:bg-beige transition-colors"
            onClick={() => navigate(`/conteudos/${r.id}`)}
          >
            <div className="flex justify-between items-start gap-3 mb-2">
              <h3 className="font-semibold text-ink leading-snug flex-1">
                {r.title}
              </h3>
              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-line text-secondary">
                {TYPE_LABELS[r.type] || r.type}
              </span>
            </div>
            <p className="text-secondary text-sm leading-relaxed mb-3">
              {r.description}
            </p>
            <div className="flex flex-wrap gap-2 items-center text-xs text-secondary">
              <span>Fonte: <strong>{r.source}</strong></span>
              {r.estimatedTime && <span>· {r.estimatedTime}</span>}
              <span>· {r.topic}</span>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <Card>
            <p className="text-secondary text-sm">
              Nenhum material com esses filtros. Tente afrouxar a seleção.
            </p>
          </Card>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="w-full mt-4"
      >
        ← Voltar para o início
      </Button>
    </div>
  );
}
