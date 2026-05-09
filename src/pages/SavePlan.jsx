import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplates from '../data/taskTemplates.json';
import {
  getSupabase,
  setPlanToken,
  getPlanToken,
} from '../services/supabaseClient';
import { buildTasksForPlan } from '../utils/taskRouting';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const ANSWERS_KEY = 'trilha_diagnostic_answers';
const RESULT_KEY = 'trilha_diagnostic_result';
const CONTENT_VERSION = '1.0';

const BUSINESS_TYPES = [
  { value: '', label: 'Selecione (opcional)' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'beleza', label: 'Beleza' },
  { value: 'moda_revenda', label: 'Moda / revenda' },
  { value: 'artesanato', label: 'Artesanato' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'educacao', label: 'Educação' },
  { value: 'outro', label: 'Outro' },
];

const initialForm = {
  name: '',
  whatsapp: '',
  city: '',
  neighborhood: '',
  businessName: '',
  businessType: '',
  consent: false,
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Como podemos te chamar?';
  const digits = form.whatsapp.replace(/\D/g, '');
  if (!digits) errors.whatsapp = 'Coloque seu WhatsApp.';
  else if (digits.length < 10 || digits.length > 13)
    errors.whatsapp = 'Confira se o número está completo (com DDD).';
  if (!form.city.trim()) errors.city = 'Em qual cidade você está?';
  if (!form.neighborhood.trim()) errors.neighborhood = 'E o bairro?';
  return errors;
}

export default function SavePlan() {
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (getPlanToken()) {
      navigate('/minha-trilha', { replace: true });
      return;
    }
    try {
      const rawResult = sessionStorage.getItem(RESULT_KEY);
      const rawAnswers = sessionStorage.getItem(ANSWERS_KEY);
      if (!rawResult) {
        navigate('/diagnostico', { replace: true });
        return;
      }
      setDiagnostic({
        result: JSON.parse(rawResult),
        answers: rawAnswers ? JSON.parse(rawAnswers) : {},
      });
    } catch {
      navigate('/diagnostico', { replace: true });
    }
  }, [navigate]);

  const update = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const v = validate(form);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const planToken = crypto.randomUUID();
      const client = getSupabase(planToken);
      const archetype = archetypesData.find(
        (a) => a.id === diagnostic.result.archetypeId
      );

      const { data: user, error: userError } = await client
        .from('users')
        .insert({
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          city: form.city.trim(),
          neighborhood: form.neighborhood.trim(),
          business_name: form.businessName.trim() || null,
          business_type: form.businessType || null,
          consent_contact: form.consent,
          plan_token: planToken,
        })
        .select()
        .single();
      if (userError) throw userError;

      const { error: diagError } = await client.from('diagnostics').insert({
        user_id: user.id,
        answers_json: diagnostic.answers,
        archetype_id: diagnostic.result.archetypeId,
        main_pain: diagnostic.result.mainPain,
        secondary_pain: diagnostic.result.secondaryPain,
        sector: diagnostic.answers.q_sector_what || null,
        sales_channel: Array.isArray(diagnostic.answers.q_channels_clients)
          ? diagnostic.answers.q_channels_clients.join(',')
          : null,
        capital_need: diagnostic.answers.q_capital_need || null,
        content_version: CONTENT_VERSION,
      });
      if (diagError) throw diagError;

      const { data: plan, error: planError } = await client
        .from('plans')
        .insert({
          user_id: user.id,
          archetype_id: diagnostic.result.archetypeId,
          status: 'active',
          current_week: 1,
        })
        .select()
        .single();
      if (planError) throw planError;

      const taskRows = buildTasksForPlan({
        planId: plan.id,
        archetype,
        taskTemplates,
      });
      if (taskRows.length) {
        const { error: tasksError } = await client.from('tasks').insert(taskRows);
        if (tasksError) throw tasksError;
      }

      setPlanToken(planToken);
      setSuccess(true);
      setTimeout(() => navigate('/minha-trilha', { replace: true }), 600);
    } catch (err) {
      console.error('SavePlan error:', err);
      setSubmitError(
        err?.message ||
          'Não foi possível salvar agora. Tente de novo em instantes.'
      );
      setLoading(false);
    }
  };

  if (!diagnostic) return null;

  if (success) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Pronto" title="Trilha salva!" />
        <Card>
          <p className="text-secondary text-sm">
            Levando você para a sua trilha…
          </p>
        </Card>
      </div>
    );
  }

  const fieldClass = (field) =>
    `w-full min-h-12 px-4 rounded-xl border bg-paper text-ink text-base focus:outline-none focus:border-primary ${
      errors[field] ? 'border-coral' : 'border-line'
    }`;

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Quase lá"
        title="Salvar minha trilha"
        subtitle="Para você poder voltar e continuar de onde parou."
      />

      <Card>
        <p className="text-secondary text-sm leading-relaxed">
          Não pedimos CPF, senha ou documentos. Só o básico para te
          reconhecer quando você voltar.
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Nome
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={fieldClass('name')}
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-coral text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            WhatsApp
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            className={fieldClass('whatsapp')}
            placeholder="(11) 9 9999-9999"
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.whatsapp && (
            <p className="text-coral text-xs mt-1">{errors.whatsapp}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Cidade
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className={fieldClass('city')}
              autoComplete="address-level2"
            />
            {errors.city && (
              <p className="text-coral text-xs mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Bairro
            </label>
            <input
              type="text"
              value={form.neighborhood}
              onChange={(e) => update('neighborhood', e.target.value)}
              className={fieldClass('neighborhood')}
              autoComplete="address-level3"
            />
            {errors.neighborhood && (
              <p className="text-coral text-xs mt-1">{errors.neighborhood}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Nome do negócio <span className="text-secondary font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            className={fieldClass('businessName')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Tipo de negócio <span className="text-secondary font-normal">(opcional)</span>
          </label>
          <select
            value={form.businessType}
            onChange={(e) => update('businessType', e.target.value)}
            className={fieldClass('businessType')}
          >
            {BUSINESS_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-1 w-5 h-5 accent-primary"
          />
          <span className="text-sm text-ink leading-snug">
            Aceito receber mensagens sobre minha trilha.
          </span>
        </label>

        {submitError && (
          <Card className="border-coral">
            <p className="text-coral text-sm">{submitError}</p>
          </Card>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando…' : 'Salvar e ver minha trilha'}
        </Button>
      </form>
    </div>
  );
}
