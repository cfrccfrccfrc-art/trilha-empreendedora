import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import companionsData from '../data/taskCompanions.json';
import taskTemplates from '../data/taskTemplates.json';
import casesData from '../data/cases.json';
import resourcesData from '../data/resources.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { OpenBook, Lightbulb, Sparkle } from '../components/Sketches';

const AUTHENTICITY_LABELS = {
  anonymized_local_case: 'Pessoa real, anonimizada com permissão.',
  fictionalized_composite_case:
    'Personagem fictício composto a partir de várias situações reais.',
  teaching_scenario_inspired_by_multiple_sources:
    'Cenário pedagógico inspirado em várias fontes (não reproduz material protegido).',
};

export default function TaskCompanion() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const companion = useMemo(
    () => companionsData.find((c) => c.taskTemplateId === templateId),
    [templateId]
  );
  const template = useMemo(
    () => taskTemplates.find((t) => t.id === templateId),
    [templateId]
  );

  if (!companion) {
    return (
      <div className="space-y-5">
        <PageHeader title="Companheiro de tarefa" />
        <Card>
          <p className="text-secondary text-sm">
            Ainda não temos um companheiro pra essa tarefa. Estamos
            trabalhando nisso.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full mt-3"
          >
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  if (companion.status !== 'active') {
    return (
      <div className="space-y-5">
        <PageHeader
          accent="Em construção"
          title={`${companion.personaName} fazendo essa tarefa`}
        />
        <Card>
          <p className="text-secondary text-sm">
            Esse companheiro está sendo escrito. Em breve a história fica
            disponível com tropeços e aprendizados.
          </p>
        </Card>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          Voltar
        </Button>
      </div>
    );
  }

  const relatedCases = (companion.relatedCases || [])
    .map((cid) => casesData.find((c) => c.id === cid && c.status === 'active'))
    .filter(Boolean);

  const relatedResources = (companion.relatedResources || [])
    .map((rid) => resourcesData.find((r) => r.id === rid))
    .filter(Boolean);

  const personaChapters = companionsData
    .filter(
      (c) =>
        c.personaName === companion.personaName &&
        c.id !== companion.id &&
        c.status === 'active'
    )
    .map((c) => {
      const t = taskTemplates.find((t) => t.id === c.taskTemplateId);
      return { ...c, _taskTitle: t?.title, _taskWeek: t?.week };
    })
    .sort((a, b) => (a._taskWeek || 0) - (b._taskWeek || 0));

  const authenticity =
    AUTHENTICITY_LABELS[companion.caseAuthenticityType] ||
    'História pedagógica não-protegida por direito autoral.';

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Quem fez antes de você"
        title={`${companion.personaName} fazendo essa tarefa`}
        subtitle={template ? template.title : null}
      />

      <div className="flex gap-3 items-start text-xs text-secondary leading-relaxed bg-beige rounded-2xl p-3 border border-line">
        <OpenBook className="w-9 h-9 shrink-0" />
        <div>
          <p className="text-ink font-semibold mb-1">{companion.region}</p>
          <p>{authenticity}</p>
        </div>
      </div>

      <Card>
        <h3 className="font-bold text-ink mb-2">Quem é</h3>
        <p className="text-secondary text-sm leading-relaxed">
          {companion.personaContext}
        </p>
      </Card>

      <div className="space-y-3">
        <p className="font-hand text-secondary text-lg leading-tight px-1">
          O que aconteceu pelo caminho
        </p>
        {(companion.stumbles || []).map((s, idx) => (
          <Card key={idx}>
            <p className="font-hand text-primary text-base leading-tight mb-2">
              {s.moment}
            </p>
            <p className="text-ink text-sm leading-relaxed mb-3">
              <strong>O que aconteceu:</strong> {s.whatHappened}
            </p>
            <p className="text-secondary text-sm leading-relaxed">
              <strong className="text-ink">O que ajudou:</strong>{' '}
              {s.whatHelped}
            </p>
          </Card>
        ))}
      </div>

      <Card className="border-primary bg-primaryLight/40">
        <div className="flex gap-3 items-start mb-2">
          <Lightbulb className="w-10 h-10 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              A virada de chave
            </p>
            <p className="text-ink text-sm leading-relaxed">
              {companion.breakthrough}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-green">
        <div className="flex gap-2 items-start">
          <Sparkle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              O que ela fez na sequência
            </p>
            <p className="text-ink text-sm leading-relaxed">
              {companion.outcome}
            </p>
          </div>
        </div>
      </Card>

      {companion.whenToAskForHelp && (
        <Card className="border-coral">
          <h3 className="font-bold text-ink mb-2">Se ainda não destravar</h3>
          <p className="text-secondary text-sm leading-relaxed mb-3">
            {companion.whenToAskForHelp}
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/preciso-de-ajuda')}
            className="w-full"
          >
            Pedir ajuda
          </Button>
        </Card>
      )}

      {personaChapters.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-1">
            Outros capítulos da história {personaChapters[0].personaName.startsWith('Dona ') ? 'dela' : `de ${companion.personaName}`}
          </h3>
          <p className="text-xs text-secondary mb-3">
            Como {companion.personaName} encarou as outras tarefas da trilha.
          </p>
          <ul className="space-y-2">
            {personaChapters.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/companheiros/${c.taskTemplateId}`)}
                  className="text-primary text-sm font-semibold text-left"
                >
                  {c._taskWeek ? `Semana ${c._taskWeek}: ` : ''}
                  {c._taskTitle || c.taskTemplateId} →
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {relatedCases.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-1">
            Antes desse trabalho, a decisão
          </h3>
          <p className="text-xs text-secondary mb-3">
            O caso que conta como {companion.personaName} chegou até aqui.
          </p>
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

      {relatedResources.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-1">Para se aprofundar</h3>
          <ul className="space-y-2 mt-2">
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

      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="w-full"
      >
        ← Voltar para a tarefa
      </Button>
    </div>
  );
}
