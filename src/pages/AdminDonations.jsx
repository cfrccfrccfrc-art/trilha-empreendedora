import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getAuthClient } from '../services/supabaseClient';
import { useSupervisorSession } from '../utils/useSupervisorSession';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const ALL_PLACEMENTS = [
  { value: 'home',              label: 'Home (página inicial)' },
  { value: 'results',           label: 'Resultado do diagnóstico' },
  { value: 'my_plan',           label: 'Minha trilha' },
  { value: 'learning_response', label: 'Tela de aprendizado (após tarefa)' },
];

function parseAmounts(text) {
  return text
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export default function AdminDonations() {
  const navigate = useNavigate();
  const { loading, session, supervisor, isAdmin } = useSupervisorSession();

  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const load = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const client = getAuthClient();
      const { data, error: e } = await client
        .from('donation_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (e) throw e;
      setCampaigns(data || []);
      const latest = data?.[0];
      if (latest) {
        setForm({
          id: latest.id,
          enabled: latest.enabled,
          title: latest.title,
          message: latest.message,
          amountsText: (latest.amounts || []).join(', '),
          pix_key: latest.pix_key || '',
          pix_qr_url: latest.pix_qr_url || '',
          placements: latest.placements || [],
        });
      } else {
        setForm({
          id: null,
          enabled: false,
          title: 'A Trilha não cobra. E não busca lucro.',
          message:
            'Mas servidor, conteúdo e voluntários têm custo. Se a Trilha te ajudou, considere uma doação de qualquer valor.',
          amountsText: '1, 5, 10',
          pix_key: '',
          pix_qr_url: '',
          placements: ['my_plan', 'learning_response'],
        });
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Erro ao carregar.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (loading || !session || !supervisor) return;
    if (!isAdmin) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, supervisor, isAdmin]);

  const togglePlacement = (value) => {
    setForm((f) => {
      const has = f.placements.includes(value);
      return {
        ...f,
        placements: has
          ? f.placements.filter((p) => p !== value)
          : [...f.placements, value],
      };
    });
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const client = getAuthClient();
      const payload = {
        enabled: form.enabled,
        title: form.title.trim(),
        message: form.message.trim(),
        amounts: parseAmounts(form.amountsText),
        pix_key: form.pix_key.trim() || null,
        pix_qr_url: form.pix_qr_url.trim() || null,
        placements: form.placements,
        updated_at: new Date().toISOString(),
      };

      if (form.id) {
        const { error: e } = await client
          .from('donation_campaigns')
          .update(payload)
          .eq('id', form.id);
        if (e) throw e;
      } else {
        const { error: e } = await client
          .from('donation_campaigns')
          .insert(payload);
        if (e) throw e;
      }
      setSavedAt(new Date());
      await load();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleNewCampaign = () => {
    setForm({
      id: null,
      enabled: false,
      title: '',
      message: '',
      amountsText: '1, 5, 10',
      pix_key: '',
      pix_qr_url: '',
      placements: [],
    });
    setSavedAt(null);
  };

  if (loading) return null;
  if (!session || !supervisor)
    return <Navigate to="/supervisor/login" replace />;
  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader title="Doações" />
        <Card className="border-coral">
          <p className="text-coral text-sm">Acesso restrito a administradores.</p>
        </Card>
      </div>
    );
  }

  if (loadingData || !form) {
    return (
      <div className="space-y-5">
        <PageHeader title="Doações" />
        <Card>
          <p className="text-secondary text-sm">Carregando…</p>
        </Card>
      </div>
    );
  }

  const fieldClass =
    'w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary';

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Admin"
        title="Campanhas de doação"
        subtitle="Configure o banner de Pix exibido nas páginas escolhidas."
      />

      <Card className="bg-beige border-line">
        <p className="text-xs text-secondary leading-relaxed">
          <strong>Importante:</strong> a plataforma não processa Pix
          automaticamente. O banner exibe a chave (e QR opcional) pra a pessoa
          transferir manualmente. Garanta que o recebedor tem CNPJ/MEI ativo e
          contabilidade adequada antes de habilitar.
        </p>
      </Card>

      <Card>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) =>
              setForm((f) => ({ ...f, enabled: e.target.checked }))
            }
            className="w-5 h-5 accent-primary"
          />
          <span className="text-ink font-semibold">
            Banner ativo {form.enabled ? '(visível)' : '(oculto)'}
          </span>
        </label>
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-3">Texto</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Título
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className={fieldClass}
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Mensagem
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
              maxLength={400}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-3">Valores e Pix</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Valores sugeridos (em reais, separados por vírgula)
            </label>
            <input
              type="text"
              value={form.amountsText}
              onChange={(e) =>
                setForm((f) => ({ ...f, amountsText: e.target.value }))
              }
              className={fieldClass}
              placeholder="1, 5, 10"
            />
            <p className="text-xs text-secondary mt-1">
              Ex.: <code>1, 5, 10</code>. Aceita inteiros positivos.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Chave Pix
            </label>
            <input
              type="text"
              value={form.pix_key}
              onChange={(e) =>
                setForm((f) => ({ ...f, pix_key: e.target.value }))
              }
              className={fieldClass}
              placeholder="email@exemplo.com.br ou CNPJ ou chave aleatória"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              URL do QR code (opcional)
            </label>
            <input
              type="url"
              value={form.pix_qr_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, pix_qr_url: e.target.value }))
              }
              className={fieldClass}
              placeholder="https://…"
            />
            <p className="text-xs text-secondary mt-1">
              Hospede a imagem do QR em algum CDN (Supabase Storage, S3, etc.)
              e cole o URL público aqui.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-3">Onde mostrar</h3>
        <div className="space-y-2">
          {ALL_PLACEMENTS.map((p) => (
            <label
              key={p.value}
              className={`flex items-center gap-3 min-h-12 px-4 rounded-xl border cursor-pointer transition-colors ${
                form.placements.includes(p.value)
                  ? 'border-primary bg-primaryLight'
                  : 'border-line bg-paper'
              }`}
            >
              <input
                type="checkbox"
                checked={form.placements.includes(p.value)}
                onChange={() => togglePlacement(p.value)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-ink text-sm">{p.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {error && (
        <Card className="border-coral">
          <p className="text-coral text-sm">{error}</p>
        </Card>
      )}

      {savedAt && (
        <Card className="border-green">
          <p className="text-ink text-sm">
            Salvo em {savedAt.toLocaleTimeString('pt-BR')}.
          </p>
        </Card>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Salvando…' : form.id ? 'Salvar alterações' : 'Criar campanha'}
      </Button>

      {form.id && (
        <Button
          variant="ghost"
          onClick={handleNewCampaign}
          className="w-full"
        >
          Criar nova campanha (arquiva a atual)
        </Button>
      )}

      {campaigns.length > 1 && (
        <Card>
          <h3 className="font-bold text-ink mb-2">Histórico</h3>
          <ul className="space-y-2 text-sm">
            {campaigns.map((c) => (
              <li key={c.id}>
                <span className={c.enabled ? 'text-green' : 'text-secondary'}>
                  {c.enabled ? '● ativa' : '○ inativa'}
                </span>{' '}
                — {c.title} ·{' '}
                <span className="text-secondary text-xs">
                  {new Date(c.created_at).toLocaleDateString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Button
        variant="ghost"
        onClick={() => navigate('/admin')}
        className="w-full"
      >
        ← Voltar para o painel admin
      </Button>
    </div>
  );
}
