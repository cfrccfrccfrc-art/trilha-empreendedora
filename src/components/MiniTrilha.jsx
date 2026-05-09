import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreMiniTrilha } from '../utils/miniTrilhaScoring';
import PageHeader from './PageHeader';
import Card from './Card';
import Button from './Button';
import { Lightbulb, Sparkle, OpenBook, WavyUnderline } from './Sketches';

const STEP_INTRO = 'intro';
const STEP_QUIZ = 'quiz';
const STEP_RESULT = 'result';

// Generic mini-trilha component. Receives a data object with this shape:
// { slug, accent, title, subtitle, introBody, warning, tieBreakOrder,
//   tabLabels, questions, guides }
// Each guide: { id, name, shortDescription, whatItIs, whenItMakesSense[],
//   whenItDoesnt[], whatChanges, nextStep, relatedSources[] }
export default function MiniTrilha({ data }) {
  const navigate = useNavigate();
  const questions = useMemo(
    () => [...data.questions].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [data]
  );

  const [step, setStep] = useState(STEP_INTRO);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [openGuideId, setOpenGuideId] = useState(null);

  const current = questions[index];

  const selectAnswer = (optId) => {
    const next = { ...answers, [current.id]: optId };
    setAnswers(next);
    setTimeout(() => {
      if (index === questions.length - 1) {
        const res = scoreMiniTrilha(next, data);
        setResult(res);
        setOpenGuideId(res.recommendedId);
        setStep(STEP_RESULT);
      } else {
        setIndex((i) => i + 1);
      }
    }, 200);
  };

  const restart = () => {
    setStep(STEP_INTRO);
    setIndex(0);
    setAnswers({});
    setResult(null);
    setOpenGuideId(null);
  };

  const openGuide = openGuideId
    ? data.guides.find((g) => g.id === openGuideId)
    : null;

  const recommendedGuide =
    result && data.guides.find((g) => g.id === result.recommendedId);

  // ---------- INTRO ----------
  if (step === STEP_INTRO) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 mb-1">
          <p className="font-hand text-secondary text-xl leading-tight">
            {data.accent}
          </p>
          <Sparkle className="w-5 h-5 mt-1" />
        </div>
        <h1 className="font-sans font-bold text-2xl text-ink leading-tight">
          {data.title}
        </h1>
        <WavyUnderline className="w-40 h-3" />

        <p className="text-secondary text-base leading-relaxed">
          {data.subtitle}
        </p>

        {data.introBody && (
          <p className="text-xs text-secondary">{data.introBody}</p>
        )}

        {data.warning && (
          <Card className="bg-beige border-line">
            <div className="flex gap-3 items-start">
              <Lightbulb className="w-9 h-9 shrink-0" />
              <div>
                <p className="text-ink text-sm leading-relaxed mb-1">
                  <strong>{data.warning.title}:</strong>
                </p>
                <p className="text-secondary text-sm leading-relaxed">
                  {data.warning.body}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Button onClick={() => setStep(STEP_QUIZ)} className="w-full">
          Começar ({questions.length} perguntas, 2 min)
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            setStep(STEP_RESULT);
            setOpenGuideId(data.guides[Math.floor(data.guides.length / 2)]?.id);
          }}
          className="w-full"
        >
          Pular o quiz e ver os {data.guides.length} caminhos
        </Button>
      </div>
    );
  }

  // ---------- QUIZ ----------
  if (step === STEP_QUIZ && current) {
    const progress = ((index + 1) / questions.length) * 100;
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm text-secondary mb-2">
            Pergunta {index + 1} de {questions.length}
          </p>
          <div className="w-full h-2 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="font-bold text-xl text-ink leading-snug">
          {current.text}
        </h2>
        {current.helpText && (
          <p className="text-sm text-secondary leading-relaxed">
            {current.helpText}
          </p>
        )}

        <div className="space-y-3">
          {current.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => selectAnswer(opt.id)}
              className={`w-full min-h-14 px-4 py-3 rounded-xl border text-left text-base leading-snug transition-colors ${
                answers[current.id] === opt.id
                  ? 'border-primary bg-primaryLight text-ink'
                  : 'border-line bg-paper text-ink hover:bg-beige'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {index > 0 && (
          <Button
            variant="ghost"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            className="px-3"
          >
            ← Voltar
          </Button>
        )}
      </div>
    );
  }

  // ---------- RESULT ----------
  return (
    <div className="space-y-5">
      <p className="font-hand text-secondary text-xl leading-tight">
        Resultado
      </p>
      {recommendedGuide && (
        <h1 className="font-sans font-bold text-2xl text-ink leading-tight">
          {recommendedGuide.name}
        </h1>
      )}
      {result && (
        <p className="text-secondary text-sm leading-relaxed">
          Com base nas suas respostas, esse é o caminho mais provável.
          Confira os outros nas abas abaixo.
        </p>
      )}

      <div className="flex gap-2 border-b border-line overflow-x-auto -mx-1 px-1">
        {data.guides.map((g) => {
          const isOpen = openGuideId === g.id;
          const isRec = result?.recommendedId === g.id;
          const tabLabel = data.tabLabels?.[g.id] || g.name;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setOpenGuideId(g.id)}
              className={`shrink-0 px-3 pb-2 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                isOpen
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary'
              }`}
            >
              {tabLabel}
              {isRec && <Sparkle className="w-3 h-3 inline-block ml-1" />}
            </button>
          );
        })}
      </div>

      {openGuide && <GuideBlock guide={openGuide} />}

      <div className="space-y-3 pt-2">
        <Button onClick={restart} variant="secondary" className="w-full">
          Refazer o quiz
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full"
        >
          Voltar pro início
        </Button>
      </div>

      {data.warning && (
        <Card className="bg-beige border-line">
          <div className="flex gap-3 items-start">
            <OpenBook className="w-9 h-9 shrink-0" />
            <div>
              <p className="text-ink text-sm font-semibold mb-1">
                {data.warning.title}
              </p>
              <p className="text-secondary text-xs leading-relaxed">
                {data.warning.body}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function GuideBlock({ guide }) {
  return (
    <div className="space-y-4">
      <Card className="border-primary bg-primaryLight/30">
        <p className="text-ink text-base leading-relaxed">
          {guide.shortDescription}
        </p>
      </Card>

      {guide.whatItIs && (
        <Card>
          <h3 className="font-bold text-ink mb-2">O que é</h3>
          <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
            {guide.whatItIs}
          </p>
        </Card>
      )}

      {guide.whenItMakesSense?.length > 0 && (
        <Card className="border-green">
          <h3 className="font-bold text-ink mb-2">Quando faz sentido</h3>
          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
            {guide.whenItMakesSense.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
      )}

      {guide.whenItDoesnt?.length > 0 && (
        <Card className="border-coral">
          <h3 className="font-bold text-ink mb-2">Quando NÃO cabe</h3>
          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
            {guide.whenItDoesnt.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
      )}

      {guide.whatChanges && (
        <Card>
          <h3 className="font-bold text-ink mb-2">O que muda na prática</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {guide.whatChanges}
          </p>
        </Card>
      )}

      {guide.nextStep && (
        <Card className="border-primary">
          <h3 className="font-bold text-ink mb-2">Próximo passo</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {guide.nextStep}
          </p>
        </Card>
      )}

      {guide.relatedSources?.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Onde se aprofundar</h3>
          <ul className="space-y-2">
            {guide.relatedSources.map((s) => {
              const isExternal = s.url?.startsWith('http');
              return (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="text-primary text-sm font-semibold"
                  >
                    {s.label} →
                  </a>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
