import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import Button from '../components/Button';
import Card from '../components/Card';
import ShareBanner from '../components/ShareBanner';
import {
  HeroNotebook,
  WavyUnderline,
  Sparkle,
  StepOne,
  StepTwo,
  StepThree,
  Lightbulb,
  OpenBook,
  Pin,
  HeartCoin,
  DocumentStamp,
} from '../components/Sketches';

const ARCHETYPE_PEEK_IDS = [
  'vende_sem_lucro',
  'ainda_e_ideia',
  'operacao_travada',
  'empreendedora_sobrecarregada',
  'precisa_capital',
  'potencial_b2b_local',
];

const STEPS = [
  {
    title: 'Você responde 35 perguntas curtas',
    body: 'Em mais ou menos 5 minutos. Sem cadastro, sem cobrança.',
    Icon: StepOne,
  },
  {
    title: 'Recebe uma trilha de 30 dias',
    body: 'Quatro missões práticas — uma por semana — pensadas pro seu perfil.',
    Icon: StepTwo,
  },
  {
    title: 'Caminha junto com a rede',
    body: 'Casos curtos, companheiros de jornada e voluntários quando travar.',
    Icon: StepThree,
  },
];

const FEATURES = [
  {
    Icon: Sparkle,
    title: 'Trilha de 30 dias prática',
    body: 'Missão por semana, na linguagem da sua rotina.',
  },
  {
    Icon: OpenBook,
    title: 'Histórias de quem fez antes',
    body: 'Casos curtos e companheiros de jornada para destravar dúvida.',
  },
  {
    Icon: Pin,
    title: 'Rede de voluntários',
    body: 'Quando ler não basta, alguém da rede te responde no zap.',
  },
  {
    Icon: HeartCoin,
    title: 'Sem custo, sem lucro',
    body: 'Não vendemos crédito, não cobramos mensalidade.',
  },
];

const SECONDARY_LINKS = [
  { label: 'Já tenho uma trilha', to: '/minha-trilha' },
  { label: 'Posso ajudar', to: '/posso-ajudar' },
];

function MiniTrilhaCard({ sketch, title, body, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-paper border border-line rounded-2xl p-4 hover:bg-beige active:bg-line/40 transition-colors"
    >
      <div className="flex gap-4 items-start">
        {sketch}
        <div className="flex-1">
          <h3 className="font-bold text-ink leading-snug mb-1">{title}</h3>
          <p className="text-secondary text-sm leading-snug mb-2">{body}</p>
          <span className="text-primary text-sm font-semibold">
            Começar →
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const peeks = ARCHETYPE_PEEK_IDS
    .map((id) => archetypesData.find((a) => a.id === id))
    .filter((a) => a && a.status === 'active');

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section>
        <div className="flex items-start gap-3 mb-3">
          <p className="font-hand text-secondary text-xl leading-tight">
            Trilha Empreendedora
          </p>
          <Sparkle className="w-5 h-5 mt-1" />
        </div>

        <h1 className="font-sans font-bold text-3xl text-ink leading-tight mb-1">
          Encontre o próximo passo certo para o seu negócio.
        </h1>
        <WavyUnderline className="w-40 h-3 mb-5" />

        <p className="text-secondary text-base leading-relaxed mb-6">
          Você responde algumas perguntas rápidas e recebe uma trilha prática
          para organizar, vender melhor, entender seus números e dar o próximo
          passo.
        </p>

        <div className="flex justify-center my-6">
          <HeroNotebook className="w-40 h-40" />
        </div>

        <Button
          onClick={() => navigate('/diagnostico')}
          className="w-full mb-3"
        >
          Começar diagnóstico
        </Button>
        <p className="text-xs text-secondary text-center">
          Grátis. Sem cadastro pra começar. Leva 5 minutos.
        </p>
      </section>

      {/* COMO FUNCIONA */}
      <section>
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          Como funciona
        </p>
        <h2 className="font-sans font-bold text-2xl text-ink leading-tight mb-4">
          Três passos simples
        </h2>
        <div className="space-y-3">
          {STEPS.map((s, idx) => (
            <Card key={idx} className="flex gap-4 items-start">
              <s.Icon className="w-12 h-12 shrink-0" />
              <div>
                <p className="font-bold text-ink leading-snug mb-1">
                  {idx + 1}. {s.title}
                </p>
                <p className="text-secondary text-sm leading-relaxed">
                  {s.body}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* PRA QUEM É */}
      <section>
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          Pra quem é
        </p>
        <h2 className="font-sans font-bold text-2xl text-ink leading-tight mb-2">
          Encontra-se em alguma dessas situações?
        </h2>
        <p className="text-secondary text-sm leading-relaxed mb-4">
          O diagnóstico identifica seu perfil entre 12 caminhos possíveis. Aqui
          alguns dos mais comuns.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {peeks.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => navigate('/diagnostico')}
              className="text-left bg-paper border border-line rounded-2xl p-4 hover:bg-beige transition-colors"
            >
              <p className="font-semibold text-ink leading-snug mb-1">
                {a.name}
              </p>
              <p className="text-secondary text-sm leading-snug">
                {a.commonPain}
              </p>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/diagnostico')}
          className="w-full mt-3"
        >
          Descobrir meu perfil →
        </Button>
      </section>

      {/* O QUE VOCÊ TEM */}
      <section>
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          O que você tem aqui
        </p>
        <h2 className="font-sans font-bold text-2xl text-ink leading-tight mb-4">
          Tudo gratuito, num só lugar
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {FEATURES.map((f, idx) => (
            <Card key={idx} className="flex gap-4 items-start">
              <div className="shrink-0">
                <f.Icon className="w-9 h-9" />
              </div>
              <div>
                <p className="font-bold text-ink leading-snug mb-1">
                  {f.title}
                </p>
                <p className="text-secondary text-sm leading-relaxed">
                  {f.body}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MINI-TRILHAS RÁPIDAS */}
      <section>
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          Mini-trilhas rápidas
        </p>
        <h2 className="font-sans font-bold text-2xl text-ink leading-tight mb-3">
          Dúvidas comuns, respostas curtas
        </h2>
        <p className="text-secondary text-sm leading-relaxed mb-4">
          Cinco perguntas, dois minutos, um norte. Pra dúvidas que aparecem em
          quase todo negócio.
        </p>

        <div className="space-y-3">
          <MiniTrilhaCard
            sketch={<DocumentStamp className="w-14 h-14 shrink-0" />}
            title="PF, MEI ou CNPJ — qual cabe agora?"
            body="Sobre formalização: quando virar MEI vale a pena, quando ainda não."
            onClick={() => navigate('/formalizacao')}
          />
          <MiniTrilhaCard
            sketch={<HeartCoin className="w-14 h-14 shrink-0" />}
            title="Como você está cobrando hoje?"
            body="Sobre preço: chute, cobertura básica, ou margem clara — onde você tá."
            onClick={() => navigate('/mini/precificacao')}
          />
          <MiniTrilhaCard
            sketch={<Lightbulb className="w-14 h-14 shrink-0" />}
            title="É hora de pegar empréstimo?"
            body="Sobre capital: ainda não, quase, ou pronta(o) com critério."
            onClick={() => navigate('/mini/capital')}
          />
          <MiniTrilhaCard
            sketch={<OpenBook className="w-14 h-14 shrink-0" />}
            title="Vale a pena vender online agora?"
            body="Sobre canais: foco presencial, híbrido pequeno, ou pronta(o) pra crescer."
            onClick={() => navigate('/mini/canais')}
          />
        </div>
      </section>

      {/* METODOLOGIA */}
      <section>
        <Card className="bg-beige border-line">
          <div className="flex gap-3 items-start">
            <Lightbulb className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-hand text-secondary text-base leading-tight mb-1">
                De onde vem
              </p>
              <h3 className="font-bold text-ink leading-snug mb-2">
                Inspirado na metodologia do Projeto Pescadores
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                Começar pequeno. Validar com cliente real. Separar finanças
                desde o dia 1. Pedir ajuda quando precisar. Os princípios são
                antigos — a Trilha só organiza eles em passos práticos.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* SHARE BANNER */}
      <section>
        <ShareBanner tone="soft" />
      </section>

      {/* FINAL CTA */}
      <section>
        <Card className="border-primary bg-primaryLight/40">
          <h2 className="font-bold text-ink text-xl leading-snug mb-2">
            Pronto para descobrir seu próximo passo?
          </h2>
          <p className="text-secondary text-sm leading-relaxed mb-4">
            5 minutos pra responder. 30 dias pra praticar.
          </p>
          <Button
            onClick={() => navigate('/diagnostico')}
            className="w-full"
          >
            Começar diagnóstico
          </Button>
        </Card>
      </section>

      {/* SECONDARY LINKS */}
      <section>
        <nav className="space-y-2">
          {SECONDARY_LINKS.map((link) => (
            <Button
              key={link.to}
              variant="ghost"
              onClick={() => navigate(link.to)}
              className="w-full justify-start"
            >
              {link.label}
            </Button>
          ))}
        </nav>
      </section>

      <p className="text-xs text-secondary text-center pt-4 pb-2">
        Inspirado na metodologia do Projeto Pescadores.
      </p>
    </div>
  );
}
