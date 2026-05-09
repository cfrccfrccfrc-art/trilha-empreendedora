import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import casesData from '../data/cases.json';
import resourcesData from '../data/resources.json';
import taskTemplates from '../data/taskTemplates.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Lightbulb, OpenBook } from '../components/Sketches';

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
      <div className="space-y-5">
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
      <div className="space-y-5">
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
    <div className="space-y-5">
      <PageHeader
        accent={`${caseItem.region} · ${caseItem.readingTime}`}
        title={caseItem.title}
      />

      <div className="flex gap-3 items-start text-xs text-secondary leading-relaxed bg-beige rounded-2xl p-3 border border-line">
        <OpenBook className="w-9 h-9 shrink-0" />
        <div>
          <p className="text-ink font-semibold mb-1">Sobre este caso</p>
          <p>{authenticity}</p>
        </div>
      </div>

      <Card className="border-primary bg-primaryLight/40">
        <div className="flex gap-3 items-start mb-3">
          <Lightbulb className="w-10 h-10 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              O que você leva desse caso
            </p>
            <h2 className="font-bold text-ink leading-snug">
              {caseItem.lessonLearned}
            </h2>
          </div>
        </div>
        <p className="text-secondary text-sm leading-relaxed pl-1">
          <strong className="text-ink">No Brasil:</strong>{' '}
          {caseItem.tropicalizedLesson}
        </p>
      </Card>

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
        <h3 className="font-bold text-ink mb-2">O que pesa em cada caminho</h3>
        <p className="text-secondary text-sm leading-relaxed">
          {caseItem.tradeoffs}
        </p>
      </Card>

      {relatedTask && (
        <Card className="border-green">
          <p className="font-hand text-secondary text-base leading-tight mb-1">
            Tarefa prática
          </p>
          <h3 className="font-bold text-ink mb-2">{relatedTask.title}</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {relatedTask.action}
          </p>
        </Card>
      )}

      {relatedResources.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-1">Para se aprofundar</h3>
          <p className="text-xs text-secondary mb-3">
            Materiais que detalham os temas tocados nesse caso.
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
        </Card>
      )}

      {caseItem.helpTrigger && (
        <Card className="border-coral">
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

      <Button
        variant="ghost"
        onClick={() => navigate('/casos')}
        className="w-full"
      >
        ← Voltar para os casos
      </Button>
    </div>
  );
}
