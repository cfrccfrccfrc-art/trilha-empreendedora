import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import resourcesData from '../data/resources.json';
import archetypesData from '../data/archetypes.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { OpenBook, Sparkle } from '../components/Sketches';

const TYPE_LABELS = {
  guide: 'Guia',
  template: 'Modelo',
  external_guide: 'Guia externo',
  external_portal: 'Portal',
  community: 'Comunidade',
};

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = useMemo(
    () => resourcesData.find((r) => r.id === id),
    [id]
  );

  if (!resource) {
    return (
      <div className="space-y-5">
        <PageHeader title="Conteúdo" />
        <Card>
          <p className="text-secondary text-sm">
            Não encontramos esse conteúdo.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/conteudos')}
            className="w-full mt-3"
          >
            Voltar para conteúdos
          </Button>
        </Card>
      </div>
    );
  }

  const isExternal = (resource.sourceLink || '').startsWith('http');
  const isTrilhaOriginal = resource.source === 'Trilha Empreendedora';

  const recommendedArchetypes = (resource.recommendedArchetypes || [])
    .map((aid) => archetypesData.find((a) => a.id === aid))
    .filter(Boolean);

  const related = resourcesData
    .filter(
      (r) =>
        r.id !== resource.id &&
        r.status === 'active' &&
        r.topic === resource.topic
    )
    .slice(0, 4);

  const handleSourceOpen = () => {
    if (isExternal) {
      window.open(resource.sourceLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader accent={resource.source} title={resource.title} />

      {/* Top metadata strip */}
      <div className="flex gap-3 items-start text-xs text-secondary leading-relaxed bg-beige rounded-2xl p-3 border border-line">
        <OpenBook className="w-9 h-9 shrink-0" />
        <div>
          <p className="text-ink font-semibold mb-1">
            {TYPE_LABELS[resource.type] || resource.type}
            {resource.estimatedTime && ` · ${resource.estimatedTime}`}
            {resource.free ? ' · gratuito' : ' · pago'}
          </p>
          <p>
            Tema: {resource.topic}
            {resource.sector && resource.sector !== 'geral' && ` · setor: ${resource.sector}`}
            {resource.level && ` · nível: ${resource.level}`}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT — the description IS the summary */}
      <Card className="border-primary bg-primaryLight/30">
        <p className="font-hand text-secondary text-base leading-tight mb-2">
          {isTrilhaOriginal ? 'Resumo' : 'O que tem aqui'}
        </p>
        <p className="text-ink text-base leading-relaxed">
          {resource.description}
        </p>
      </Card>

      {/* External source action */}
      {!isTrilhaOriginal && resource.sourceLink && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Conteúdo completo</h3>
          <p className="text-secondary text-sm leading-relaxed mb-3">
            Material produzido por <strong>{resource.source}</strong>. A
            versão completa fica no site da fonte.
          </p>
          {isExternal ? (
            <Button
              variant="secondary"
              onClick={handleSourceOpen}
              className="w-full"
            >
              Abrir no site de {resource.source} →
            </Button>
          ) : (
            <a
              href={resource.sourceLink}
              className="inline-block text-primary text-sm font-semibold"
            >
              Abrir →
            </a>
          )}
        </Card>
      )}

      {/* How to use */}
      {resource.practicalUseCase && (
        <Card>
          <div className="flex gap-3 items-start">
            <Sparkle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-hand text-secondary text-base leading-tight mb-1">
                Como usar
              </p>
              <p className="text-ink text-sm leading-relaxed">
                {resource.practicalUseCase}
              </p>
            </div>
          </div>
        </Card>
      )}

      {recommendedArchetypes.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">
            Indicado para quem está em
          </h3>
          <ul className="text-secondary text-sm space-y-1">
            {recommendedArchetypes.map((a) => (
              <li key={a.id}>· {a.name}</li>
            ))}
          </ul>
        </Card>
      )}

      {related.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-1">Conteúdos relacionados</h3>
          <p className="text-xs text-secondary mb-3">
            Outros materiais sobre <strong>{resource.topic}</strong>.
          </p>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/conteudos/${r.id}`)}
                  className="text-primary text-sm font-semibold text-left"
                >
                  {r.title} →{' '}
                  <span className="text-secondary font-normal text-xs">
                    ({r.source})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs text-secondary px-1 leading-relaxed">
        Última revisão: {resource.lastReviewed || '—'} · próxima revisão prevista:{' '}
        {resource.nextReview || '—'}
      </p>

      <Button
        variant="ghost"
        onClick={() => navigate('/conteudos')}
        className="w-full"
      >
        ← Voltar para conteúdos
      </Button>
    </div>
  );
}
