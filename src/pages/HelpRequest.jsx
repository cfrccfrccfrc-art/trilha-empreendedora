import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSupabase,
  getPlanToken,
} from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const CATEGORIES = [
  { value: 'fotos_design',     label: 'Fotos / design' },
  { value: 'planilha_financas',label: 'Planilha / finanças' },
  { value: 'equipamento',      label: 'Equipamento' },
  { value: 'fornecedor',       label: 'Fornecedor' },
  { value: 'feira_evento',     label: 'Feira / evento' },
  { value: 'cliente_parceria', label: 'Cliente / parceria' },
  { value: 'divulgacao',       label: 'Divulgação' },
  { value: 'credito',          label: 'Crédito consciente' },
  { value: 'formalizacao',     label: 'Formalização' },
  { value: 'precificacao',     label: 'Precificação' },
  { value: 'operacao',         label: 'Operação' },
  { value: 'compra_coletiva',  label: 'Compra coletiva' },
];

export default function HelpRequest() {
  const navigate = useNavigate();
  const [hasPlan, setHasPlan] = useState(false);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = getPlanToken();
    if (!token) return;
    setHasPlan(true);
    (async () => {
      const client = getSupabase(token);
      const { data: users } = await client.from('users').select('id, name, whatsapp').limit(1);
      if (users?.[0]) {
        setUser(users[0]);
        setName(users[0].name);
        setWhatsapp(users[0].whatsapp);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!message.trim()) {
      setError('Conte rapidinho o que você precisa.');
      return;
    }
    if (!hasPlan && (!name.trim() || !whatsapp.trim())) {
      setError('Coloque seu nome e WhatsApp pra gente conseguir te responder.');
      return;
    }
    setLoading(true);
    try {
      if (hasPlan) {
        const token = getPlanToken();
        const client = getSupabase(token);
        const { error: insErr } = await client.from('help_requests').insert({
          user_id: user.id,
          topic: category,
          message: message.trim(),
          status: 'aberto',
        });
        if (insErr) throw insErr;
      } else {
        // No plan yet — create a lightweight user (no plan) so we have a record
        const planToken = crypto.randomUUID();
        const client = getSupabase(planToken);
        const { data: u, error: ue } = await client
          .from('users')
          .insert({
            name: name.trim(),
            whatsapp: whatsapp.trim(),
            consent_contact: true,
            plan_token: planToken,
          })
          .select()
          .single();
        if (ue) throw ue;
        const { error: insErr } = await client.from('help_requests').insert({
          user_id: u.id,
          topic: category,
          message: message.trim(),
          status: 'aberto',
        });
        if (insErr) throw insErr;
      }
      setSuccess(true);
    } catch (err) {
      console.error('HelpRequest error:', err);
      setError(err?.message || 'Não foi possível enviar agora.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Recebemos" title="Pedido enviado" />
        <Card>
          <p className="text-secondary text-sm leading-relaxed">
            Em breve um voluntário vai entrar em contato pelo WhatsApp.
            Pedidos costumam ser respondidos em até 3 dias úteis.
          </p>
        </Card>
        <Button
          onClick={() => navigate(hasPlan ? '/minha-trilha' : '/')}
          className="w-full"
        >
          {hasPlan ? 'Voltar para minha trilha' : 'Voltar pro início'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Preciso de ajuda"
        title="Pedir ajuda"
        subtitle="Voluntários da rede ajudam de graça em temas específicos."
      />

      <FilterChips
        label="Em que você precisa de ajuda?"
        value={category}
        onChange={setCategory}
        options={CATEGORIES}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Conte rapidinho
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
            placeholder="O que está acontecendo, o que você já tentou e o que gostaria de resolver."
          />
        </div>

        {!hasPlan && (
          <>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
                placeholder="(11) 9 9999-9999"
              />
            </div>
          </>
        )}

        {error && <p className="text-coral text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enviando…' : 'Pedir ajuda'}
        </Button>
      </form>
    </div>
  );
}
