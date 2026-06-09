import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taskTemplates from '../data/taskTemplates.json';
import archetypesData from '../data/archetypes.json';
import casesData from '../data/cases.json';
import companionsData from '../data/taskCompanions.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import CopyTextButton from '../components/CopyTextButton';
import PersonaAvatar from '../components/PersonaAvatar';
import JsonLd from '../components/JsonLd';
import { formatTaskAsMarkdown } from '../utils/exports';

const REVIEW_LABELS = {
  light: 'Leve (pode autoaprovar quando o usuário marca como concluída)',
  elevated: 'Elevada (supervisor revisa antes de aprovar)',
};

export default function TaskLibraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const task = useMemo(() => taskTemplates.find((t) => t.id === id), [id]);

  const archetype = useMemo(() => {
    if (!task?.archetypeId) return null;
    return archetypesData.find((a) => a.id === task.archetypeId);
  }, [task]);

  const relatedCases = useMemo(() => {
    if (!task) return [];
    return casesData.filter(
      (c) => c.status === 'active' && c.practicalTask === task.id
    );
  }, [task]);

  const relatedCompanions = useMemo(() => {
    if (!task) return [];
    return companionsData.filter(
      (c) => c.status === 'active' && c.taskTemplateId === task.id
    );
  }, [task]);

  if (!task) {
    return (
      <div className="space-y-5 md:max-w-3xl md:mx-auto">
        <PageHeader title="Tarefa" />
        <Card>
          <p className="text-secondary text-sm">Não encontramos essa tarefa.</p>
          <Button
            variant="ghost"
            onClick={() => navigate('/biblioteca/tarefas')}
            className="w-full mt-3"
          >
            Voltar para a biblioteca
          </Button>
        </Card>
      </div>
    );
  }

  const markdownText = formatTaskAsMarkdown(task, {
    baseUrl:
      typeof window !== 'undefined' ? window.location.origin : undefined,
  });

  const howToSteps = [];
  if (task.action) {
    howToSteps.push({
      '@type': 'HowToStep',
      name: 'A ação',
      text: task.action,
    });
  }
  if (Array.isArray(task.reflectionQuestions)) {
    for (const q of task.reflectionQuestions) {
      howToSteps.push({
        '@type': 'HowToStep',
        name: 'Pergunta de reflexão',
        text: q,
      });
    }
  }
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: task.title,
    description: task.purpose || task.expectedLearning || task.action,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    url: `https://trilhaempreendedora.com.br/biblioteca/tarefas/${task.id}`,
    totalTime: 'P7D',
    audience: {
      '@type': 'Audience',
      audienceType: 'Microempreendedores brasileiros',
    },
    publisher: { '@id': 'https://trilhaempreendedora.com.br/#organization' },
    step: howToSteps,
  };

  return (
    <div className="space-y-5 md:max-w-5xl md:mx-auto">
      <JsonLd id={`task-${task.id}`} schema={schema} />

      <PageHeader
        accent={archetype ? archetype.name : 'Tarefa'}
        title={task.title}
        subtitle={`Semana ${task.week} de 4`}
      />

      <div className="md:grid md:grid-cols-3 md:gap-6 space-y-5 md:space-y-0">
        {/* Coluna principal: ação + reflexão */}
        <div className="md:col-span-2 space-y-5">
          {task.action && (
            <Card tone="primary">
              <h3 className="font-bold text-ink mb-2">A ação</h3>
              <p className="text-ink text-sm leading-relaxed">
                {task.action}
              </p>
            </Card>
          )}

          {task.purpose && (
            <Card>
              <h3 className="font-bold text-ink mb-2">Por que isso importa</h3>
              <p className="text-secondary text-sm leading-relaxed">
                {task.purpose}
              </p>
            </Card>
          )}

          {task.expectedLearning && (
            <Card>
              <h3 className="font-bold text-ink mb-2">O que se aprende</h3>
              <p className="text-secondary text-sm leading-relaxed">
                {task.expectedLearning}
              </p>
            </Card>
          )}

          {Array.isArray(task.reflectionQuestions) &&
            task.reflectionQuestions.length > 0 && (
              <Card>
                <h3 className="font-bold text-ink mb-2">
                  Perguntas pra refletir no fim
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-secondary text-sm leading-relaxed">
                  {task.reflectionQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </Card>
            )}

          {Array.isArray(task.commonMistakes) &&
            task.commonMistakes.length > 0 && (
              <Card tone="coral">
                <h3 className="font-bold text-ink mb-2">Armadilhas comuns</h3>
                <ul className="list-disc pl-5 space-y-1 text-secondary text-sm leading-relaxed">
                  {task.commonMistakes.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </Card>
            )}
        </div>

        {/* Sidebar: copy + metadados + relacionados */}
        <aside className="md:col-span-1 space-y-4 md:sticky md:top-6 md:self-start">
          <Card tone="soft">
            <p className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">
              Pra consultores e parceiros
            </p>
            <p className="text-xs text-secondary leading-relaxed mb-3">
              Copia essa tarefa em texto formatado pra Slack, Notion, Word
              ou Google Docs.
            </p>
            <CopyTextButton
              text={markdownText}
              label="Copiar tarefa em texto"
              className="w-full"
            />
          </Card>

          {relatedCompanions.length > 0 && (
            <Card>
              <h3 className="font-bold text-ink mb-3">
                Companheiros narrativos
              </h3>
              <ul className="space-y-3">
                {relatedCompanions.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/companheiros/${task.id}`)
                      }
                      className="flex items-center gap-3 w-full text-left group"
                    >
                      <PersonaAvatar name={c.personaName} size={44} />
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-semibold leading-snug group-hover:underline">
                          {c.personaName} →
                        </p>
                        <p className="text-xs text-secondary leading-tight">
                          {c.region}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {relatedCases.length > 0 && (
            <Card>
              <h3 className="font-bold text-ink mb-2">
                Casos que usam essa tarefa
              </h3>
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

          <Card tone="soft">
            <dl className="text-xs text-secondary space-y-1">
              <div className="flex gap-2">
                <dt className="font-semibold text-ink min-w-24">Revisão</dt>
                <dd>{REVIEW_LABELS[task.reviewLevel] || task.reviewLevel}</dd>
              </div>
              {task.evidenceType && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink min-w-24">
                    Evidência
                  </dt>
                  <dd>{task.evidenceType}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="font-semibold text-ink min-w-24">ID</dt>
                <dd className="break-all">{task.id}</dd>
              </div>
            </dl>
          </Card>

          <Button
            variant="ghost"
            onClick={() => navigate('/biblioteca/tarefas')}
            className="w-full"
          >
            ← Voltar para a biblioteca
          </Button>
        </aside>
      </div>
    </div>
  );
}
