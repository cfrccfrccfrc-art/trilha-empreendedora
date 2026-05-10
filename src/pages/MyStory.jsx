import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import { getSupabase, getPlanToken } from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { OpenBook, Sparkle } from '../components/Sketches';

const initialForm = {
  business_short: '',
  biggest_change: '',
  favorite_week: '',
  favorite_week_lesson: '',
  difficulty: '',
  result_concrete: '',
  message_to_others: '',
  include_real_name: false,
  include_region: false,
  consent_publish: false,
};

function validate(form) {
  const errors = {};
  if (!form.business_short.trim()) {
    errors.business_short = 'Conta em 1 frase como você descreveria seu negócio.';
  }
  if (!form.biggest_change.trim()) {
    errors.biggest_change = 'Conta o que mais mudou em 30 dias.';
  }
  if (!form.favorite_week) {
    errors.favorite_week = 'Escolha qual missão ensinou mais.';
  }
  if (!form.message_to_others.trim()) {
    errors.message_to_others = 'Sua mensagem ajuda quem está começando.';
  }
  if (!form.consent_publish) {
    errors.consent_publish =
      'Pra publicar a história, precisamos do seu consentimento.';
  }
  return errors;
}

export default function MyStory() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
        const { data: users } = await client.from('users').select('*').limit(1);
        const user = users?.[0];
        if (!user) {
          navigate('/', { replace: true });
          return;
        }
        const { data: plans } = await client
          .from('plans')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        const plan = plans?.[0] || null;
        if (!plan) {
          navigate('/', { replace: true });
          return;
        }
        const { data: existing } = await client
          .from('user_case_submissions')
          .select('id, status')
          .eq('plan_token', token)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: { user, plan, token, existing: existing?.[0] || null },
          });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message || 'Erro ao carregar.',
            data: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const archetype = useMemo(() => {
    if (!state.data?.plan) return null;
    return archetypesData.find((a) => a.id === state.data.plan.archetype_id);
  }, [state.data]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setSubmitting(true);
    try {
      const client = getSupabase(state.data.token);
      const payload = {
        plan_token: state.data.token,
        user_id: state.data.user.id,
        archetype_id: state.data.plan.archetype_id,
        business_short: form.business_short.trim(),
        biggest_change: form.biggest_change.trim(),
        favorite_week: parseInt(form.favorite_week, 10),
        favorite_week_lesson: form.favorite_week_lesson.trim() || null,
        difficulty: form.difficulty.trim() || null,
        result_concrete: form.result_concrete.trim() || null,
        message_to_others: form.message_to_others.trim(),
        include_real_name: form.include_real_name,
        include_region: form.include_region,
        consent_publish: form.consent_publish,
        consent_anonymize: true,
        status: 'submitted',
      };
      const { error } = await client
        .from('user_case_submissions')
        .insert(payload);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrors({
        _submit:
          err?.message ||
          'Não conseguimos enviar agora. Tenta de novo em alguns segundos.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Sua história" />
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Sua história" />
        <Card className="border-coral">
          <p className="text-coral text-sm">{state.error}</p>
        </Card>
      </div>
    );
  }

  if (state.data?.existing && !success) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Sua história" title="Já recebemos. Obrigado." />
        <Card className="border-primary bg-primaryLight/30">
          <div className="flex gap-3 items-start">
            <Sparkle className="w-6 h-6 mt-1 shrink-0" />
            <div>
              <p className="text-ink leading-relaxed mb-3">
                Sua história já foi enviada. Vamos editar com cuidado e, se
                tudo bater, ela vai virar um caso publicado pra ajudar quem
                está começando.
              </p>
              <p className="text-secondary text-sm leading-relaxed">
                Se quiser corrigir alguma coisa antes de a gente revisar,
                fala com a gente em <strong>preciso de ajuda</strong>.
              </p>
            </div>
          </div>
        </Card>
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

  if (success) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Recebido" title="Sua história foi enviada." />
        <Card className="border-green bg-green/10">
          <div className="flex gap-3 items-start">
            <OpenBook className="w-10 h-10 shrink-0" />
            <div>
              <p className="text-ink leading-relaxed mb-3">
                Obrigado por contar. A gente vai ler com cuidado, editar
                pra ficar fácil de ler e, se tudo bater, publicar como caso
                anonimizado pra ajudar quem está começando agora.
              </p>
              <p className="text-secondary text-sm leading-relaxed">
                Se a gente decidir não publicar (acontece), te avisa antes.
                Sua história fica sempre sua.
              </p>
            </div>
          </div>
        </Card>
        <Button
          onClick={() => navigate('/minha-trilha')}
          className="w-full"
        >
          Voltar para minha trilha
        </Button>
      </div>
    );
  }

  const roadmap = archetype?.roadmap30d || [];

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Conta sua história"
        title="O que aconteceu nesses 30 dias?"
      />

      <Card className="border-primary bg-primaryLight/30">
        <div className="flex gap-3 items-start">
          <OpenBook className="w-9 h-9 shrink-0" />
          <div>
            <p className="text-ink text-sm leading-relaxed mb-2">
              Sua história pode ajudar muita gente que está começando agora.
              A gente edita com cuidado, anonimiza no nível que você
              autorizar, e publica como caso pra inspirar quem cair no
              mesmo perfil que o seu.
            </p>
            <p className="text-secondary text-xs leading-relaxed">
              Leva uns 5 a 10 minutos. Você pode pular qualquer pergunta
              que não for obrigatória.
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <label className="block">
            <span className="font-bold text-ink mb-1 block">
              Como você descreveria seu negócio em 1 frase?
            </span>
            <span className="text-secondary text-xs leading-relaxed mb-2 block">
              Ex: "Faço bolo de pote em casa em Belo Horizonte" ou "Atendo
              manicure em domicílio na zona sul".
            </span>
            <input
              type="text"
              value={form.business_short}
              onChange={handleChange('business_short')}
              maxLength={140}
              className="w-full bg-paper border border-line rounded-xl p-3 text-ink"
            />
            {errors.business_short && (
              <p className="text-coral text-xs mt-1">
                {errors.business_short}
              </p>
            )}
          </label>
        </Card>

        <Card>
          <label className="block">
            <span className="font-bold text-ink mb-1 block">
              O que mais mudou nesses 30 dias?
            </span>
            <span className="text-secondary text-xs leading-relaxed mb-2 block">
              Pode ser na forma de cobrar, de atender, de organizar, ou
              dentro de você. 2 ou 3 frases já valem.
            </span>
            <textarea
              value={form.biggest_change}
              onChange={handleChange('biggest_change')}
              rows={4}
              maxLength={1000}
              className="w-full bg-paper border border-line rounded-xl p-3 text-ink"
            />
            {errors.biggest_change && (
              <p className="text-coral text-xs mt-1">
                {errors.biggest_change}
              </p>
            )}
          </label>
        </Card>

        <Card>
          <p className="font-bold text-ink mb-1">
            Qual missão te ensinou mais?
          </p>
          <p className="text-secondary text-xs leading-relaxed mb-3">
            Escolha a semana e, se quiser, conta o que aprendeu.
          </p>
          <div className="space-y-2">
            {roadmap.map((week) => (
              <label
                key={week.week}
                className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.favorite_week === String(week.week)
                    ? 'border-primary bg-primaryLight/30'
                    : 'border-line bg-paper hover:bg-beige'
                }`}
              >
                <input
                  type="radio"
                  name="favorite_week"
                  value={week.week}
                  checked={form.favorite_week === String(week.week)}
                  onChange={handleChange('favorite_week')}
                  className="mr-2"
                />
                <strong>Semana {week.week}:</strong> {week.title}
              </label>
            ))}
          </div>
          {errors.favorite_week && (
            <p className="text-coral text-xs mt-1">{errors.favorite_week}</p>
          )}
          <textarea
            placeholder="O que essa missão te ensinou? (opcional)"
            value={form.favorite_week_lesson}
            onChange={handleChange('favorite_week_lesson')}
            rows={3}
            maxLength={1000}
            className="w-full mt-3 bg-paper border border-line rounded-xl p-3 text-ink text-sm"
          />
        </Card>

        <Card>
          <label className="block">
            <span className="font-bold text-ink mb-1 block">
              Qual foi sua maior dificuldade? (opcional)
            </span>
            <span className="text-secondary text-xs leading-relaxed mb-2 block">
              Saber onde travamos ajuda a próxima pessoa a não travar do
              mesmo jeito.
            </span>
            <textarea
              value={form.difficulty}
              onChange={handleChange('difficulty')}
              rows={3}
              maxLength={1000}
              className="w-full bg-paper border border-line rounded-xl p-3 text-ink"
            />
          </label>
        </Card>

        <Card>
          <label className="block">
            <span className="font-bold text-ink mb-1 block">
              Tem um resultado concreto pra contar? (opcional)
            </span>
            <span className="text-secondary text-xs leading-relaxed mb-2 block">
              Ex: "vendi 12 potes pra mais por semana", "fechei a primeira
              proposta paga", "passei a separar dinheiro de casa do dinheiro
              do negócio".
            </span>
            <textarea
              value={form.result_concrete}
              onChange={handleChange('result_concrete')}
              rows={3}
              maxLength={1000}
              className="w-full bg-paper border border-line rounded-xl p-3 text-ink"
            />
          </label>
        </Card>

        <Card>
          <label className="block">
            <span className="font-bold text-ink mb-1 block">
              Mensagem pra quem está começando agora.
            </span>
            <span className="text-secondary text-xs leading-relaxed mb-2 block">
              1 ou 2 frases. O que você diria pra alguém que está exatamente
              onde você estava 30 dias atrás?
            </span>
            <textarea
              value={form.message_to_others}
              onChange={handleChange('message_to_others')}
              rows={3}
              maxLength={500}
              className="w-full bg-paper border border-line rounded-xl p-3 text-ink"
            />
            {errors.message_to_others && (
              <p className="text-coral text-xs mt-1">
                {errors.message_to_others}
              </p>
            )}
          </label>
        </Card>

        <Card>
          <p className="font-bold text-ink mb-2">
            O que pode aparecer na publicação
          </p>
          <p className="text-secondary text-xs leading-relaxed mb-3">
            Por padrão a gente anonimiza tudo. Marque abaixo só o que você
            autoriza expressamente.
          </p>
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm leading-snug">
              <input
                type="checkbox"
                checked={form.include_real_name}
                onChange={handleChange('include_real_name')}
                className="mt-1"
              />
              <span>
                Pode citar meu primeiro nome real (em vez de um nome
                inventado).
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm leading-snug">
              <input
                type="checkbox"
                checked={form.include_region}
                onChange={handleChange('include_region')}
                className="mt-1"
              />
              <span>
                Pode citar minha região (cidade ou estado, sem endereço).
              </span>
            </label>
          </div>
        </Card>

        <Card className="border-coral/40 bg-coral/5">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={form.consent_publish}
              onChange={handleChange('consent_publish')}
              className="mt-1"
            />
            <span className="text-ink text-sm leading-relaxed">
              Concordo que a Trilha Empreendedora edite e publique minha
              história como caso anonimizado, podendo cortar, ajustar ou
              decidir não publicar. Sei que posso retirar o consentimento
              entrando em contato com a Trilha.
            </span>
          </label>
          {errors.consent_publish && (
            <p className="text-coral text-xs mt-2">{errors.consent_publish}</p>
          )}
        </Card>

        {errors._submit && (
          <Card className="border-coral">
            <p className="text-coral text-sm">{errors._submit}</p>
          </Card>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? 'Enviando…' : 'Enviar minha história'}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          Voltar
        </Button>
      </form>
    </div>
  );
}
