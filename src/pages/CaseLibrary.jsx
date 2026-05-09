import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import casesData from '../data/cases.json';
import archetypesData from '../data/archetypes.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import FilterChips from '../components/FilterChips';

const ALL = '__all__';

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export default function CaseLibrary() {
  const navigate = useNavigate();
  const all = useMemo(
    () => casesData.filter((c) => c.status === 'active'),
    []
  );

  const sectors = useMemo(() => uniq(all.map((c) => c.sector)), [all]);
  const regions = useMemo(() => uniq(all.map((c) => c.region)), [all]);
  const archetypeOptions = useMemo(
    () =>
      archetypesData
        .filter((a) => a.status === 'active')
        .map((a) => ({ value: a.id, label: a.name })),
    []
  );

  const [archetype, setArchetype] = useState(ALL);
  const [sector, setSector] = useState(ALL);
  const [region, setRegion] = useState(ALL);

  const list = useMemo(() => {
    return all.filter((c) => {
      if (archetype !== ALL && !(c.archetypes || []).includes(archetype)) return false;
      if (sector !== ALL && c.sector !== sector) return false;
      if (region !== ALL && c.region !== region) return false;
      return true;
    });
  }, [all, archetype, sector, region]);

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Casos"
        title="Histórias práticas"
        subtitle="Casos curtos pra refletir antes de decidir."
      />

      <FilterChips
        label="Perfil"
        value={archetype}
        onChange={setArchetype}
        options={[{ value: ALL, label: 'Todos' }, ...archetypeOptions]}
      />
      <FilterChips
        label="Setor"
        value={sector}
        onChange={setSector}
        options={[{ value: ALL, label: 'Todos' }, ...sectors.map((s) => ({ value: s, label: s }))]}
      />
      <FilterChips
        label="Região"
        value={region}
        onChange={setRegion}
        options={[{ value: ALL, label: 'Todas' }, ...regions.map((r) => ({ value: r, label: r }))]}
      />

      <p className="text-xs text-secondary px-1">
        {list.length} {list.length === 1 ? 'caso' : 'casos'}
      </p>

      <div className="space-y-3">
        {list.map((c) => (
          <Card
            key={c.id}
            className="cursor-pointer hover:bg-beige transition-colors"
            onClick={() => navigate(`/casos/${c.id}`)}
          >
            <div className="flex justify-between items-start gap-3 mb-2">
              <h3 className="font-semibold text-ink leading-snug flex-1">
                {c.title}
              </h3>
              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-line text-secondary">
                {c.readingTime}
              </span>
            </div>
            <p className="text-secondary text-sm leading-snug mb-2">
              {c.dilemma}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-secondary">
              <span>{c.region}</span>
              <span>· {c.sector}</span>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <Card>
            <p className="text-secondary text-sm">
              Nenhum caso com esses filtros.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
