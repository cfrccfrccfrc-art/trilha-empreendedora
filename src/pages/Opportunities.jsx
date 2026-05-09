import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import opportunitiesData from '../data/opportunities.json';
import archetypesData from '../data/archetypes.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const ALL = '__all__';

const CATEGORY_LABELS = {
  curso_online: 'Curso online',
  mentoria: 'Mentoria',
  feira_evento: 'Feira / Evento',
  rede: 'Rede',
  educacao_financeira: 'Educação financeira',
  compra_coletiva: 'Compra coletiva',
  oficina: 'Oficina',
  apoio_juridico: 'Apoio jurídico',
};

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export default function Opportunities() {
  const navigate = useNavigate();
  const all = useMemo(
    () => opportunitiesData.filter((o) => o.status === 'active'),
    []
  );

  const categories = useMemo(() => uniq(all.map((o) => o.category)), [all]);
  const archetypeOptions = useMemo(
    () =>
      archetypesData
        .filter((a) => a.status === 'active')
        .map((a) => ({ value: a.id, label: a.name })),
    []
  );

  const [category, setCategory] = useState(ALL);
  const [mode, setMode] = useState(ALL); // online | offline | ambos
  const [freeOnly, setFreeOnly] = useState(false);
  const [archetype, setArchetype] = useState(ALL);

  const list = useMemo(() => {
    return all.filter((o) => {
      if (category !== ALL && o.category !== category) return false;
      if (mode === 'online' && !o.online) return false;
      if (mode === 'offline' && o.online && o.location !== 'ambos') return false;
      if (freeOnly && !o.free) return false;
      if (archetype !== ALL && !(o.recommendedArchetypes || []).includes(archetype)) return false;
      return true;
    });
  }, [all, category, mode, freeOnly, archetype]);

  return (
    <div className="space-y-4">
      <PageHeader
        accent="Oportunidades"
        title="Programas, cursos e mentoria"
        subtitle="Caminhos para próximos passos — sem oferta de crédito."
      />

      <FilterChips
        label="Categoria"
        value={category}
        onChange={setCategory}
        options={[
          { value: ALL, label: 'Todas' },
          ...categories.map((c) => ({
            value: c,
            label: CATEGORY_LABELS[c] || c,
          })),
        ]}
      />
      <FilterChips
        label="Formato"
        value={mode}
        onChange={setMode}
        options={[
          { value: ALL, label: 'Todos' },
          { value: 'online', label: 'Online' },
          { value: 'offline', label: 'Presencial' },
        ]}
      />
      <FilterChips
        label="Perfil"
        value={archetype}
        onChange={setArchetype}
        options={[{ value: ALL, label: 'Todos' }, ...archetypeOptions]}
      />

      <label className="flex items-center gap-3 text-sm text-ink cursor-pointer pb-2">
        <input
          type="checkbox"
          checked={freeOnly}
          onChange={(e) => setFreeOnly(e.target.checked)}
          className="w-5 h-5 accent-primary"
        />
        Só gratuitas
      </label>

      <p className="text-xs text-secondary px-1">
        {list.length} {list.length === 1 ? 'oportunidade' : 'oportunidades'}
      </p>

      <div className="space-y-3">
        {list.map((o) => {
          const isExternal = (o.sourceLink || '').startsWith('http');
          return (
            <Card key={o.id}>
              <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="font-semibold text-ink leading-snug flex-1">
                  {o.title}
                </h3>
                <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-line text-secondary">
                  {CATEGORY_LABELS[o.category] || o.category}
                </span>
              </div>
              <p className="text-secondary text-sm leading-relaxed mb-3">
                {o.description}
              </p>
              <div className="flex flex-wrap gap-2 items-center text-xs text-secondary mb-3">
                <span>{o.online ? 'Online' : 'Presencial'}</span>
                {o.estimatedTime && <span>· {o.estimatedTime}</span>}
                <span>· {o.free ? 'Gratuito' : 'Pago'}</span>
              </div>
              {o.sourceLink && (
                <a
                  href={o.sourceLink}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="text-primary text-sm font-semibold inline-block"
                >
                  Saber mais →
                </a>
              )}
            </Card>
          );
        })}
        {list.length === 0 && (
          <Card>
            <p className="text-secondary text-sm">
              Nenhuma oportunidade com esses filtros.
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
