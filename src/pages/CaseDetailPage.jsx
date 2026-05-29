import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import casesData from '../data/cases.json';
import resourcesData from '../data/resources.json';
import taskTemplates from '../data/taskTemplates.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import CopyTextButton from '../components/CopyTextButton';
import { Lightbulb, OpenBook } from '../components/Sketches';
import { formatCaseAsMarkdown } from '../utils/exports';

const AUTHENTICITY_LABELS = {
  anonymized_local_case:
    'Caso real, anonimizado com permissão.',
  fictionalized_composite_case:
    'Caso fictício composto a partir de várias situações reais.',
  teaching_scenario_inspired_by_multiple_sources:
    'Cenário pedagógico inspirado em várias fontes (não reproduz material protegido).',
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = useMemo(() => casesData.find((c) => c.id === id), [id]);

  if (!caseItem) {
    return (
      <div className="space-y-5 md:max-w-3xl md:mx-auto">
        <PageHeader title="Caso" />
        <Card>
          <p className="text-secondary text-sm">
            Não encontramos esse caso.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/casos')}
            className="w-full mt-3"
          >
            Voltar para os casos
          </Button>
        </Card>
      </div>
    );
  }

  if (caseItem.status !== 'active') {
    return (
      <div className="space-y-5 md:max-w-3xl md:mx-auto">
        <PageHeader accent="Em construção" title={caseItem.title} />
        <Card>
          <p className="text-secondary text-sm">
            Esse caso está sendo produzido. Em breve ele aparece com a
            história completa.
          </p>
        </Card>
        <Button
          variant="ghost"
          onClick={() => navigate('/casos')}
          className="w-full"
        >
          Voltar para os casos
        </Button>
      </div>
    );
  }

  const relatedTask = taskTemplates.find((t) => t.id === caseItem.practicalTask);
  const relatedResources = (caseItem.relatedResources || [])
    .map((rid) => resourcesData.find((r) => r.id === rid))
    .filter(Boolean);

  const authenticity =
    AUTHENTICITY_LABELS[caseItem.caseAuthenticityType] ||
    'Caso pedagógico não-protegido por direito autoral.';

  return (
    <div className="space-y-5 md:max-w-5xl md:mx-auto">
      <PageHeader
        accent={`${caseItem.region} · ${caseItem.readingTime}`}
        title={caseItem.title}
      />

      <Card tone="primary">
        <div className="flex gap-3 items-start mb-3">
          <Lightbulb className="w-10 h-10 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              O que você leva desse caso
            </p>
            <h2 className="font-bold text-ink text-lg md:text-xl leading-snug">
              {caseItem.lessonLearned}
            </h2>
          </div>
        </div>
        <p className="text-secondary text-sm leading-relaxed pl-1">
          <strong className="text-ink">No Brasil:</strong>{' '}
          {caseItem.tropicalizedLesson}
        </p>
      </Card>

      <div className="md:grid md:grid-cols-3 md:gap-6 space-y-5 md:space-y-0">
        {/* Coluna principal: a história */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex gap-3 items-start text-xs text-secondary leading-relaxed bg-beige/60 rounded-2xl p-3 border border-line">
            <OpenBook className="w-9 h-9 shrink-0" />
            <div>
              <p className="text-ink font-semibold mb-1">Sobre este caso</p>
              <p>{authenticity}</p>
            </div>
          </div>

          <Card>
            <h3 className="font-bold text-ink mb-2">Situação</h3>
            <p className="text-secondary text-sm leading-relaxed">
              {caseItem.situation}
            </p>
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">O dilema</h3>
            <p className="text-secondary text-sm leading-relaxed">
              {caseItem.dilemma}
            </p>
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">Opções</h3>
            <ol className="list-decimal pl-5 space-y-2 text-secondary text-sm">
              {(caseItem.options || []).map((opt) => (
                <li key={opt}>{opt}</li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="font-bold text-ink mb-2">
              O que pesa em cada caminho
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              {caseItem.tradeoffs}
            </p>
          </Card>
        </div>

        {/* Sidebar: ações + relacionados (sticky em desktop) */}
        <aside className="md:col-span-1 space-y-4 md:sticky md:top-6 md:self-start">
          {relatedTask && (
            <Card tone="green">
              <p className="font-hand text-secondary text-base leading-tight mb-1">
                Tarefa prática
              </p>
              <h3 className="font-bold text-ink mb-2 leading-snug">
                {relatedTask.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                {relatedTask.action}
              </p>
            </Card>
          )}

          {relatedResources.length > 0 && (
            <Card tone="soft">
              <h3 className="font-bold text-ink mb-1">Pra se aprofundar</h3>
              <p className="text-xs text-secondary mb-3">
                Materiais que detalham os temas do caso.
              </p>
              <ul className="space-y-2">
                {relatedResources.map((r) => {
                  const isExternal = (r.sourceLink || '').startsWith('http');
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isExternal) {
                            window.open(
                              r.sourceLink,
                              '_blank',
                              'noopener,noreferrer'
                            );
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
            </Card>
          )}

          {caseItem.helpTrigger && (
            <Card tone="coral">
              <h3 className="font-bold text-ink mb-2">Quando pedir ajuda</h3>
              <p className="text-secondary text-sm leading-relaxed">
                {caseItem.helpTrigger}
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate('/preciso-de-ajuda')}
                className="w-full mt-3"
              >
                Pedir ajuda
              </Button>
            </Card>
          )}

          <Card tone="soft">
            <p className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">
              Pra consultores e parceiros
            </p>
            <p className="text-xs text-secondary leading-relaxed mb-3">
              Copia esse caso em texto formatado pra Slack, Notion, Word ou
              Google Docs.
            </p>
            <CopyTextButton
              text={formatCaseAsMarkdown(caseItem, {
                baseUrl:
                  typeof window !== 'undefined'
                    ? window.location.origin
                    : undefined,
              })}
              label="Copiar caso em texto"
              className="w-full"
            />
          </Card>

          <Button
            variant="ghost"
            onClick={() => navigate('/casos')}
            className="w-full"
          >
            ← Voltar para os casos
          </Button>
        </aside>
      </div>
    </div>
  );
}
