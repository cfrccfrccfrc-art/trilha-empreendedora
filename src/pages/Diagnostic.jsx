import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questionsData from '../data/questions.json';
import archetypesData from '../data/archetypes.json';
import scoringRules from '../data/scoringRules.json';
import { scoreAnswers } from '../utils/scoring';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';

const ANSWERS_KEY = 'trilha_diagnostic_answers';
const INDEX_KEY = 'trilha_diagnostic_index';
const RESULT_KEY = 'trilha_diagnostic_result';

function readAnswers() {
  try {
    return JSON.parse(sessionStorage.getItem(ANSWERS_KEY)) || {};
  } catch {
    return {};
  }
}

function readIndex(max) {
  const raw = sessionStorage.getItem(INDEX_KEY);
  const parsed = raw == null ? 0 : parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), max);
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const questions = useMemo(
    () => [...questionsData].sort((a, b) => a.order - b.order),
    []
  );
  const total = questions.length;

  const [answers, setAnswers] = useState(readAnswers);
  const [index, setIndex] = useState(() => readIndex(total - 1));
  const [textInput, setTextInput] = useState('');

  const current = questions[index];

  useEffect(() => {
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    sessionStorage.setItem(INDEX_KEY, String(index));
  }, [index]);

  useEffect(() => {
    if (!current) return;
    if (current.type === 'text_short' || current.type === 'number') {
      const stored = answers[current.id];
      setTextInput(stored == null ? '' : String(stored));
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;

  const finishWith = (finalAnswers) => {
    const result = scoreAnswers(
      finalAnswers,
      questions,
      archetypesData,
      scoringRules
    );
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    navigate('/resultado');
  };

  const goNext = (latestAnswers) => {
    if (index === total - 1) {
      finishWith(latestAnswers);
    } else {
      setIndex((i) => Math.min(i + 1, total - 1));
    }
  };

  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  const selectSingle = (optId) => {
    const next = { ...answers, [current.id]: optId };
    setAnswers(next);
    setTimeout(() => goNext(next), 250);
  };

  const toggleMulti = (optId) => {
    const cur = Array.isArray(answers[current.id]) ? answers[current.id] : [];
    const next = cur.includes(optId)
      ? cur.filter((id) => id !== optId)
      : [...cur, optId];
    setAnswers({ ...answers, [current.id]: next });
  };

  const submitMulti = () => {
    const value = Array.isArray(answers[current.id])
      ? answers[current.id]
      : [];
    const final = { ...answers, [current.id]: value };
    setAnswers(final);
    goNext(final);
  };

  const submitText = () => {
    const trimmed = textInput.trim();
    const value = current.type === 'number' ? Number(trimmed) : trimmed;
    const final = { ...answers, [current.id]: value };
    setAnswers(final);
    goNext(final);
  };

  const progressValue = ((index + 1) / total) * 100;
  const isMulti = current.type === 'multi_choice';
  const isText = current.type === 'text_short' || current.type === 'number';

  const allOptions = current.options ?? [];
  const mainOptions = allOptions.filter((o) => o.id !== 'dontknow');
  const dontKnow = allOptions.find((o) => o.id === 'dontknow');

  const multiSelected = (id) =>
    Array.isArray(answers[current.id]) && answers[current.id].includes(id);
  const singleSelected = (id) => answers[current.id] === id;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      <div className="mb-6">
        <p className="text-sm text-secondary mb-2">
          {index + 1} de {total}
        </p>
        <ProgressBar value={progressValue} />
      </div>

      <div className="flex-1">
        <h2 className="font-sans font-bold text-xl text-ink leading-snug mb-2">
          {current.text}
        </h2>
        {current.helpText && (
          <p className="text-sm text-secondary mb-4">{current.helpText}</p>
        )}

        <div className="space-y-3 mb-6">
          {!isText &&
            mainOptions.map((opt) => {
              const selected = isMulti
                ? multiSelected(opt.id)
                : singleSelected(opt.id);
              const onClick = () =>
                isMulti ? toggleMulti(opt.id) : selectSingle(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={onClick}
                  className={`w-full min-h-14 px-4 py-3 rounded-xl border text-left text-base leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                    selected
                      ? 'border-primary bg-primaryLight text-ink'
                      : 'border-line bg-paper text-ink hover:bg-beige'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}

          {isMulti && (
            <Button onClick={submitMulti} className="w-full">
              Continuar
            </Button>
          )}

          {isText && (
            <>
              <input
                type={current.type === 'number' ? 'number' : 'text'}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim()) submitText();
                }}
                className="w-full min-h-14 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
                placeholder=""
                autoFocus
              />
              <Button
                onClick={submitText}
                disabled={!textInput.trim()}
                className="w-full"
              >
                Continuar
              </Button>
            </>
          )}

          {dontKnow && !isText && !isMulti && (
            <button
              type="button"
              onClick={() => selectSingle(dontKnow.id)}
              className={`w-full text-sm text-secondary underline-offset-4 hover:underline pt-2 ${
                singleSelected(dontKnow.id) ? 'text-primary underline' : ''
              }`}
            >
              {dontKnow.label}
            </button>
          )}

          {dontKnow && isMulti && (
            <button
              type="button"
              onClick={() => toggleMulti(dontKnow.id)}
              className={`w-full text-sm text-secondary underline-offset-4 hover:underline pt-2 ${
                multiSelected(dontKnow.id) ? 'text-primary underline' : ''
              }`}
            >
              {dontKnow.label}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={index === 0}
          className="px-3"
        >
          ← Voltar
        </Button>
        <span className="text-xs text-secondary">
          {isMulti ? 'Escolha uma ou mais' : isText ? '' : 'Toque para escolher'}
        </span>
      </div>
    </div>
  );
}
