import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taskTemplates from '../data/taskTemplates.json';
import companionsData from '../data/taskCompanions.json';
import { getSupabase, getPlanToken } from '../services/supabaseClient';
import { submitTask } from '../utils/taskRouting';
import { compressImage } from '../utils/imageCompress';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { OpenBook } from '../components/Sketches';

const MAX_PHOTOS = 3;

const STATUS_OPTIONS = [
  { value: 'Fiz',           label: 'Fiz' },
  { value: 'Fiz em parte',  label: 'Fiz em parte' },
  { value: 'Não consegui',  label: 'Não consegui' },
];

const OBSTACLE_OPTIONS = [
  { value: '',                       label: 'Selecione (opcional)' },
  { value: 'faltou_tempo',           label: 'Faltou tempo' },
  { value: 'nao_entendi',            label: 'Não entendi' },
  { value: 'faltou_dinheiro',        label: 'Faltou dinheiro' },
  { value: 'tentei_nao_funcionou',   label: 'Tentei e não funcionou' },
  { value: 'tive_duvida',            label: 'Tive dúvida' },
  { value: 'esqueci',                label: 'Esqueci' },
  { value: 'problema_pessoal',       label: 'Tive problema pessoal' },
  { value: 'outro',                  label: 'Outro' },
];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [showForm, setShowForm] = useState(false);
  const [statusReported, setStatusReported] = useState('Fiz');
  const [textResponse, setTextResponse] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [showLinkField, setShowLinkField] = useState(false);
  const [obstacle, setObstacle] = useState('');
  const [needsHelp, setNeedsHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const token = getPlanToken();
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      const client = getSupabase(token);
      try {
        const { data: task, error: te } = await client
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();
        if (te) throw te;

        const { data: users, error: ue } = await client
          .from('users')
          .select('id, name')
          .limit(1);
        if (ue) throw ue;

        const { data: latest } = await client
          .from('task_submissions')
          .select('*')
          .eq('task_id', id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              task,
              user: users?.[0],
              template: taskTemplates.find((t) => t.id === task.task_template_id),
              latestSubmission: latest?.[0] || null,
            },
          });
        }
      } catch (err) {
        console.error('TaskDetail load error:', err);
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message || 'Não conseguimos carregar essa tarefa.',
            data: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (evidenceUrls.length >= MAX_PHOTOS) {
      setSubmitError(`Máximo de ${MAX_PHOTOS} fotos por envio.`);
      return;
    }
    setSubmitError(null);
    setUploading(true);
    try {
      const compressed = await compressImage(file).catch(() => file);
      const token = getPlanToken();
      const client = getSupabase(token);
      const path = `${token}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.jpg`;
      const { error: uploadErr } = await client.storage
        .from('task-evidence')
        .upload(path, compressed, {
          upsert: false,
          contentType: 'image/jpeg',
        });
      if (uploadErr) throw uploadErr;
      const { data: pub } = client.storage
        .from('task-evidence')
        .getPublicUrl(path);
      setEvidenceUrls((prev) => [...prev, pub.publicUrl]);
    } catch (err) {
      console.error('Upload error:', err);
      setSubmitError(
        'Não conseguimos enviar a foto. Tente outra ou cole um link.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    if (evidenceUrls.length >= MAX_PHOTOS) {
      setSubmitError(`Máximo de ${MAX_PHOTOS} evidências por envio.`);
      return;
    }
    setEvidenceUrls((prev) => [...prev, url]);
    setLinkInput('');
    setShowLinkField(false);
  };

  const removeEvidence = (idx) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (statusReported !== 'Fiz' && !obstacle) {
      setSubmitError('Conte rapidinho o que atrapalhou.');
      return;
    }
    setSubmitting(true);
    try {
      const token = getPlanToken();
      const client = getSupabase(token);
      await submitTask(client, {
        task: state.data.task,
        userId: state.data.user.id,
        statusReported,
        textResponse,
        evidenceUrls,
        obstacle: statusReported === 'Fiz' ? null : obstacle,
        needsHelp,
      });
      navigate(`/tarefa/${id}/aprendizado`);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(
        err?.message || 'Não foi possível enviar agora. Tente de novo.'
      );
      setSubmitting(false);
    }
  };

  if (state.loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Tarefa" />
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Tarefa" />
        <Card className="border-coral">
          <p className="text-coral text-sm">{state.error}</p>
          <Button
            variant="ghost"
            onClick={() => navigate('/minha-trilha')}
            className="w-full mt-4"
          >
            Voltar para minha trilha
          </Button>
        </Card>
      </div>
    );
  }

  const { task, template } = state.data;
  const obstacleNeeded = statusReported !== 'Fiz';
  const alreadyConcluded = task.status === 'concluida';
  const companion = companionsData.find(
    (c) =>
      c.taskTemplateId === task.task_template_id && c.status === 'active'
  );

  return (
    <div className="space-y-5">
      <PageHeader
        accent={`Missão da semana ${task.week}`}
        title={task.title}
      />

      {companion && !alreadyConcluded && (
        <button
          type="button"
          onClick={() => navigate(`/companheiros/${task.task_template_id}`)}
          className="w-full flex gap-3 items-start text-left bg-beige rounded-2xl p-3 border border-line hover:bg-line/40 transition-colors"
        >
          <OpenBook className="w-9 h-9 shrink-0" />
          <div>
            <p className="font-hand text-secondary text-base leading-tight mb-1">
              Quem fez antes de você
            </p>
            <p className="text-ink text-sm leading-snug">
              Como <strong>{companion.personaName}</strong> encarou essa
              mesma tarefa →
            </p>
          </div>
        </button>
      )}

      {alreadyConcluded && (
        <Card className="border-green">
          <p className="text-ink text-sm">
            Você já concluiu essa tarefa.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate(`/tarefa/${id}/aprendizado`)}
            className="w-full mt-3"
          >
            Ver o aprendizado
          </Button>
        </Card>
      )}

      {template?.action && (
        <Card>
          <h3 className="font-bold text-ink mb-2">O que fazer</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {template.action}
          </p>
        </Card>
      )}

      {template?.purpose && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Por que importa</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {template.purpose}
          </p>
        </Card>
      )}

      {template?.expectedLearning && (
        <Card>
          <h3 className="font-bold text-ink mb-2">O que você vai aprender</h3>
          <p className="text-secondary text-sm leading-relaxed">
            {template.expectedLearning}
          </p>
        </Card>
      )}

      {template?.reflectionQuestions?.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Perguntas para refletir</h3>
          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
            {template.reflectionQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Card>
      )}

      {template?.commonMistakes?.length > 0 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Armadilhas comuns</h3>
          <ul className="list-disc pl-5 space-y-1 text-secondary text-sm">
            {template.commonMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>
      )}

      {!alreadyConcluded && !showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          Reportar tarefa
        </Button>
      )}

      {!alreadyConcluded && showForm && (
        <Card className="border-primary">
          <h3 className="font-bold text-ink mb-3">Como foi?</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink mb-2">Status</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 min-h-12 px-4 rounded-xl border cursor-pointer transition-colors ${
                      statusReported === opt.value
                        ? 'border-primary bg-primaryLight'
                        : 'border-line bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={statusReported === opt.value}
                      onChange={() => setStatusReported(opt.value)}
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-ink">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                Conte como foi
              </label>
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
                placeholder="Pode ser um resumo do que você anotou, o que deu certo ou o que travou."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                Foto (opcional, até {MAX_PHOTOS})
              </label>
              <p className="text-xs text-secondary mb-3">
                Pode ser foto do caderno, da planilha, do produto, do cliente
                feliz — o que ajuda a contar como foi.
              </p>

              {evidenceUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {evidenceUrls.map((url, idx) => {
                    const isImage = /\.(jpe?g|png|webp|gif)$/i.test(url);
                    return (
                      <div
                        key={`${url}-${idx}`}
                        className="relative w-20 h-20 rounded-xl border border-line overflow-hidden bg-beige"
                      >
                        {isImage ? (
                          <img
                            src={url}
                            alt={`Evidência ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-secondary p-1 text-center break-all">
                            link
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeEvidence(idx)}
                          aria-label={`Remover evidência ${idx + 1}`}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-coral text-white text-xs font-bold shadow-sm"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />

              {evidenceUrls.length < MAX_PHOTOS && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? 'Enviando…' : '📷 Tirar foto'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    Escolher do celular
                  </Button>
                  {!showLinkField ? (
                    <button
                      type="button"
                      onClick={() => setShowLinkField(true)}
                      className="w-full text-sm text-secondary underline-offset-4 hover:underline pt-1"
                    >
                      ou colar um link
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="https://…"
                        className="flex-1 min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-sm focus:outline-none focus:border-primary"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddLink}
                        disabled={!linkInput.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {evidenceUrls.length >= MAX_PHOTOS && (
                <p className="text-xs text-secondary">
                  Máximo de {MAX_PHOTOS} evidências atingido. Remova alguma
                  pra adicionar outra.
                </p>
              )}
            </div>

            {obstacleNeeded && companion && (
              <Card className="border-primary bg-primaryLight/30 -mx-1">
                <p className="font-hand text-secondary text-base leading-tight mb-1">
                  Antes de pedir ajuda
                </p>
                <p className="text-ink text-sm leading-relaxed mb-3">
                  Vê como <strong>{companion.personaName}</strong> encarou
                  essa mesma tarefa, com os tropeços e o que ajudou em cada
                  um. Costuma destravar.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    navigate(`/companheiros/${task.task_template_id}`)
                  }
                  className="w-full"
                >
                  Ver como {companion.personaName} fez →
                </Button>
              </Card>
            )}

            {obstacleNeeded && (
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">
                  O que mais atrapalhou?
                </label>
                <select
                  value={obstacle}
                  onChange={(e) => setObstacle(e.target.value)}
                  className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
                >
                  {OBSTACLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={needsHelp}
                onChange={(e) => setNeedsHelp(e.target.checked)}
                className="mt-1 w-5 h-5 accent-primary"
              />
              <span className="text-sm text-ink leading-snug">
                Preciso de ajuda com isso
              </span>
            </label>

            {submitError && (
              <p className="text-coral text-sm">{submitError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1"
              >
                {submitting ? 'Enviando…' : 'Enviar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Button
        variant="ghost"
        onClick={() => navigate('/minha-trilha')}
        className="w-full"
      >
        ← Voltar para minha trilha
      </Button>
    </div>
  );
}
