import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplates from '../data/taskTemplates.json';
import casesData from '../data/cases.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import DisclaimerNote from '../components/DisclaimerNote';
import JsonLd from '../components/JsonLd';
import { Lightbulb, Sparkle } from '../components/Sketches';

// Página pública e indexável de cada arquétipo. Objetivo: SEO/AEO. Cada perfil
// vira uma URL própria com Schema.org Article, otimizada pra busca tipo
// "como sair do bico", "o que é negócio consolidado", "trilha de 30 dias",
// "diagnóstico de empreendedor brasileiro".
//
// O conteúdo vem direto de archetypes.json (mesma fonte usada no Results).
// Quem chega aqui sem ter feito o diagnóstico ganha CTA pra fazer.
export default function ArchetypeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const archetype = useMemo(
    () => archetypesData.find((a) => a.id === id),
    [id]
  );

  const firstTask = useMemo(() => {
    if (!archetype?.firstTaskId) return null;
    return taskTemplates.find((t) => t.id === archetype.firstTaskId);
  }, [archetype]);

  const relatedCases = useMemo(() => {
    if (!archetype) return [];
    return casesData
      .filter(
        (c) =>
          c.status === 'active' &&
          Array.isArray(c.archetypes) &&
          c.archetypes.includes(archetype.id)
      )
      .slice(0, 4);
  }, [archetype]);

  if (!archetype || archetype.status !== 'active') {
    return (
      <div className="space-y-5">
        <PageHeader title="Perfil" />
        <Card>
          <p className="text-secondary text-sm">
            Esse perfil não está disponível.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/perfis')}
            className="w-full mt-3"
          >
            Ver todos os perfis
          </Button>
        </Card>
      </div>
    );
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: archetype.name,
    description: archetype.shortDescription,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    url: `https://trilhaempreendedora.com.br/perfis/${archetype.id}`,
    articleSection: 'Perfil de microempreendedor',
    keywords: [
      'microempreendedorismo',
      'baixa renda',
      'diagnóstico de negócio',
      archetype.name.replace(/"/g, ''),
    ].join(', '),
    audience: {
      '@type': 'Audience',
      audienceType: 'Microempreendedores brasileiros',
    },
    publisher: { '@id': 'https://trilhaempreendedora.com.br/#organization' },
    teaches: archetype.expectedLearning,
  };

  return (
    <div className="space-y-5 md:max-w-3xl md:mx-auto">
      <JsonLd id={`profile-${archetype.id}`} schema={schema} />

      <PageHeader
        accent="Perfil de empreendedor"
        title={archetype.name}
        subtitle={archetype.shortDescription}
      />

      <Card tone="primary">
        <div className="flex gap-3 items-start mb-3">
          <Lightbulb className="w-10 h-10 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              O que costuma acontecer
            </p>
            <h2 className="font-bold text-ink text-lg md:text-xl leading-snug">
              {archetype.commonPain}
            </h2>
          </div>
        </div>
      </Card>

      {Array.isArray(archetype.typicalMistakes) &&
        archetype.typicalMistakes.length > 0 && (
          <Card>
            <h3 className="font-bold text-ink mb-2">
              Sinais típicos desse perfil
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-secondary text-sm leading-relaxed">
              {archetype.typicalMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Card>
        )}

      {archetype.avoidNow && (
        <Card tone="coral">
          <h3 className="font-bold text-ink mb-2">O que evitar agora</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {archetype.avoidNow}
          </p>
        </Card>
      )}

      {archetype.expectedLearning && (
        <Card>
          <h3 className="font-bold text-ink mb-2">
            O que esse perfil precisa aprender
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            {archetype.expectedLearning}
          </p>
        </Card>
      )}

      {firstTask && (
        <Card tone="green">
          <div className="flex gap-2 items-start mb-2">
            <Sparkle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="font-hand text-secondary text-base leading-tight">
              Primeira missão de quem se identifica com esse perfil
            </p>
          </div>
          <h3 className="font-bold text-ink mb-2 leading-snug">
            {firstTask.title}
          </h3>
          {firstTask.action && (
            <p className="text-secondary text-sm leading-relaxed">
              {firstTask.action}
            </p>
          )}
        </Card>
      )}

      {Array.isArray(archetype.roadmap30d) &&
        archetype.roadmap30d.length > 0 && (
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

      {relatedCases.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-3">Histórias desse perfil</h3>
          <ul className="space-y-2">
            {relatedCases.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/casos/${c.id}`)}
                  className="text-primary text-sm font-semibold text-left"
                >
                  {c.title} →
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card tone="ink" className="text-center">
        <Sparkle className="w-6 h-6 mx-auto mb-2" color="#F7E27C" />
        <h3 className="font-bold text-paper text-lg leading-snug mb-2">
          Esse perfil bate com você?
        </h3>
        <p className="text-paper/70 text-sm leading-relaxed mb-4">
          Reconheceu o cenário? Faz o diagnóstico de 5 minutos pra confirmar
          ou descobrir o seu perfil real entre os 15 caminhos.
        </p>
        <Button
          onClick={() => navigate('/diagnostico')}
          className="w-full bg-highlight text-ink hover:bg-highlight/90 shadow-lg"
        >
          Começar diagnóstico
        </Button>
      </Card>

      <DisclaimerNote variant="compact" />

      <Button
        variant="ghost"
        onClick={() => navigate('/perfis')}
        className="w-full"
      >
        ← Ver os 15 perfis
      </Button>
    </div>
  );
}
