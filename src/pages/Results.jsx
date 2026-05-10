import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplates from '../data/taskTemplates.json';
import resourcesData from '../data/resources.json';
import casesData from '../data/cases.json';
import opportunitiesData from '../data/opportunities.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Sparkle } from '../components/Sketches';
import DonationBanner from '../components/DonationBanner';

const RESULT_KEY = 'trilha_diagnostic_result';

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (!raw) {
        navigate('/', { replace: true });
        return;
      }
      setResult(JSON.parse(raw));
    } catch {
      navigate('/', { replace: true });
      return;
    }
    setReady(true);
  }, [navigate]);

  const archetype = useMemo(() => {
    if (!result) return null;
    return archetypesData.find((a) => a.id === result.archetypeId);
  }, [result]);

  const firstTask = useMemo(() => {
    if (!result?.recommendedTaskId) return null;
    return taskTemplates.find((t) => t.id === result.recommendedTaskId);
  }, [result]);

  const recommendedResources = useMemo(() => {
    if (!archetype?.recommendedResources) return [];
    return archetype.recommendedResources
      .map((id) => resourcesData.find((r) => r.id === id && r.status === 'active'))
      .filter(Boolean);
  }, [archetype]);

  const recommendedCases = useMemo(() => {
    if (!archetype?.recommendedCases) return [];
    return archetype.recommendedCases
      .map((id) => casesData.find((c) => c.id === id && c.status === 'active'))
      .filter(Boolean);
  }, [archetype]);

  const recommendedOpportunities = useMemo(() => {
    if (!archetype?.recommendedOpportunities) return [];
    return archetype.recommendedOpportunities
      .map((id) => opportunitiesData.find((o) => o.id === id && o.status === 'active'))
      .filter(Boolean);
  }, [archetype]);

  if (!ready || !result || !archetype) return null;

  const hasFullContent = archetype.status === 'active';

  return (
    <div className="space-y-5">
      <PageHeader accent="Seu perfil" title={archetype.name} />

      {hasFullContent && (
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
            <Card className="border-primary bg-primaryLight/30">
              <div className="flex gap-2 items-start">
                <Sparkle className="w-5 h-5 mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="font-hand text-secondary text-base leading-tight mb-1">
                    Sua primeira missão
                  </p>
                  <h3 className="font-bold text-ink mb-2">{firstTask.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">
                    {firstTask.action}
                  </p>

                  {taskOpen && (
                    <div className="mt-4 space-y-3 border-t border-line pt-3">
                      {firstTask.purpose && (
                        <div>
                          <p className="font-bold text-ink text-sm mb-1">
                            Por que isso importa
                          </p>
                          <p className="text-secondary text-sm leading-relaxed">
                            {firstTask.purpose}
                          </p>
                        </div>
                      )}
                      {firstTask.expectedLearning && (
                        <div>
                          <p className="font-bold text-ink text-sm mb-1">
                            O que você vai aprender
                          </p>
                          <p className="text-secondary text-sm leading-relaxed">
                            {firstTask.expectedLearning}
                          </p>
                        </div>
                      )}
                      {firstTask.reflectionQuestions?.length > 0 && (
                        <div>
                          <p className="font-bold text-ink text-sm mb-1">
                            Perguntas pra refletir no fim
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
                            {firstTask.reflectionQuestions.map((q) => (
                              <li key={q}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {firstTask.commonMistakes?.length > 0 && (
                        <div>
                          <p className="font-bold text-ink text-sm mb-1">
                            Armadilhas comuns
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
                            {firstTask.commonMistakes.map((m) => (
                              <li key={m}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-secondary text-xs italic leading-relaxed pt-1">
                        Pra começar de verdade essa missão e marcar quando
                        terminar, salve sua trilha abaixo.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setTaskOpen((v) => !v)}
                    className="text-primary text-sm font-semibold mt-3"
                  >
                    {taskOpen
                      ? 'Esconder detalhes'
                      : 'Ver detalhes da missão →'}
                  </button>
                </div>
              </div>
            </Card>
          )}

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

          <Card>
            <h3 className="font-bold text-ink mb-2">Conteúdos recomendados</h3>
            {recommendedResources.length > 0 ? (
              <ul className="space-y-2">
                {recommendedResources.map((r) => {
                  const isExternal = (r.sourceLink || '').startsWith('http');
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isExternal) {
                            window.open(r.sourceLink, '_blank', 'noopener,noreferrer');
                          } else {
                            navigate(`/conteudos/${r.id}`);
                          }
                        }}
                        className="text-primary text-sm font-semibold text-left"
                      >
                        {r.title} →{' '}
                        <span className="text-secondary font-normal text-xs">
                          ({r.source})
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-secondary text-sm">Em breve.</p>
            )}
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">Casos parecidos</h3>
            {recommendedCases.length > 0 ? (
              <ul className="space-y-2">
                {recommendedCases.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/casos/${c.id}`)}
                      className="text-primary text-sm font-semibold text-left"
                    >
                      {c.title} →{' '}
                      <span className="text-secondary font-normal text-xs">
                        ({c.readingTime})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary text-sm">Em breve.</p>
            )}
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">Oportunidades</h3>
            {recommendedOpportunities.length > 0 ? (
              <ul className="space-y-2">
                {recommendedOpportunities.map((o) => {
                  const isExternal = (o.sourceLink || '').startsWith('http');
                  return (
                    <li key={o.id}>
                      <a
                        href={o.sourceLink}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="text-primary text-sm font-semibold"
                      >
                        {o.title} →{' '}
                        <span className="text-secondary font-normal text-xs">
                          ({o.source})
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-secondary text-sm">Em breve.</p>
            )}
          </Card>
        </>
      )}

      {!hasFullContent && (
        <Card>
          <h3 className="font-bold text-ink mb-2">
            Conteúdo em construção
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            Identificamos seu perfil como <strong>{archetype.name}</strong>,
            mas a trilha completa para esse perfil ainda está sendo
            preparada. Em breve você poderá ver missões e roteiro de 30 dias
            personalizados.
          </p>
        </Card>
      )}

      <DonationBanner placement="results" />

      <div className="space-y-3 pt-2">
        <p className="text-secondary text-sm leading-relaxed text-center px-2">
          Pra começar as missões e marcar seu progresso, salve a trilha. A
          gente guarda só ela, sem cadastro, sem cobrança, e você volta
          quando quiser.
        </p>
        <Button onClick={() => navigate('/salvar')} className="w-full">
          Salvar e começar
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full"
        >
          Agora não, só quero ver o plano
        </Button>
      </div>
    </div>
  );
}
