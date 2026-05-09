import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../services/supabaseClient';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FilterChips from '../components/FilterChips';

const CATEGORIES = [
  { value: 'mentoria',           label: 'Mentoria' },
  { value: 'fotografia',         label: 'Fotografia' },
  { value: 'design',             label: 'Design' },
  { value: 'contabilidade',      label: 'Contabilidade' },
  { value: 'divulgacao',         label: 'Divulgação' },
  { value: 'espaco_fisico',      label: 'Espaço físico' },
  { value: 'equipamento_usado',  label: 'Equipamento usado' },
  { value: 'indicacao_feira',    label: 'Indicação de feira' },
  { value: 'compra_coletiva',    label: 'Compra coletiva' },
  { value: 'cliente_potencial',  label: 'Cliente potencial' },
  { value: 'aula_oficina',       label: 'Aula / oficina' },
  { value: 'revisao_tarefa',     label: 'Revisão de tarefa' },
];

export default function OfferHelp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Coloque seu nome.');
      return;
    }
    if (!whatsapp.trim() && !email.trim()) {
      setError('Deixe pelo menos um contato (WhatsApp ou e-mail).');
      return;
    }
    setLoading(true);
    try {
      const client = getSupabase();
      const { error: insErr } = await client.from('volunteer_offers').insert({
        name: name.trim(),
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        category,
        description: description.trim() || null,
        availability: availability.trim() || null,
        status: 'aberto',
      });
      if (insErr) throw insErr;
      setSuccess(true);
    } catch (err) {
      console.error('OfferHelp error:', err);
      setError(err?.message || 'Não foi possível enviar agora.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5">
        <PageHeader accent="Obrigada" title="Oferta recebida" />
        <Card>
          <p className="text-secondary text-sm leading-relaxed">
            Em breve um membro da equipe entra em contato pra entender como
            sua ajuda pode ser melhor encaixada.
          </p>
        </Card>
        <Button onClick={() => navigate('/')} className="w-full">
          Voltar pro início
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        accent="Posso ajudar"
        title="Oferecer apoio"
        subtitle="Conta o que você consegue oferecer pra rede."
      />

      <FilterChips
        label="Em que você pode ajudar?"
        value={category}
        onChange={setCategory}
        options={CATEGORIES}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Conte como pode ajudar
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
            placeholder="O que você sabe, faz ou tem disponível pra emprestar à rede."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Disponibilidade
          </label>
          <input
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full min-h-12 px-4 rounded-xl border border-line bg-paper text-ink text-base focus:outline-none focus:border-primary"
            placeholder="Ex.: 2h por semana, sábados de manhã"
          />
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enviando…' : 'Oferecer ajuda'}
        </Button>
      </form>
    </div>
  );
}
