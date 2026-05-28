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

  return (
    <div className="space-y-5 md:max-w-3xl md:mx-auto">
      <PageHeader
        accent={archetype ? archetype.name : 'Tarefa'}
        title={task.title}
        subtitle={`Semana ${task.week} de 4`}
      />

      <div className="border border-line rounded-2xl p-4 bg-beige/50 space-y-3">
        <div>
          <p className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">
            Pra consultores e parceiros
          </p>
          <p className="text-xs text-secondary leading-relaxed">
            Copia essa tarefa em texto formatado pra usar em Slack, Notion,
            Word ou Google Docs no atendimento.
          </p>
        </div>
        <CopyTextButton
          text={markdownText}
          label="Copiar tarefa em texto"
          className="w-full"
        />
      </div>

      {task.action && (
        <Card>
          <h3 className="font-bold text-ink mb-2">A ação</h3>
          <p className="text-secondary text-sm leading-relaxed">
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

      {Array.isArray(task.commonMistakes) && task.commonMistakes.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Armadilhas comuns</h3>
          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm leading-relaxed">
            {task.commonMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="bg-beige/40 border-line">
        <dl className="text-xs text-secondary space-y-1">
          <div className="flex gap-2">
            <dt className="font-semibold text-ink min-w-32">Revisão</dt>
            <dd>{REVIEW_LABELS[task.reviewLevel] || task.reviewLevel}</dd>
          </div>
          {task.evidenceType && (
            <div className="flex gap-2">
              <dt className="font-semibold text-ink min-w-32">
                Tipo de evidência
              </dt>
              <dd>{task.evidenceType}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="font-semibold text-ink min-w-32">ID interno</dt>
            <dd className="break-all">{task.id}</dd>
          </div>
        </dl>
      </Card>

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

      {relatedCompanions.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">
            Companheiros narrativos pra essa tarefa
          </h3>
          <ul className="space-y-2">
            {relatedCompanions.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/companheiros/${task.id}`)}
                  className="text-primary text-sm font-semibold text-left"
                >
                  {c.personaName} ({c.region}) →
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Button
        variant="ghost"
        onClick={() => navigate('/biblioteca/tarefas')}
        className="w-full"
      >
        ← Voltar para a biblioteca
      </Button>
    </div>
  );
}
