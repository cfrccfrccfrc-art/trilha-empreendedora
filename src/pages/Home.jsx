import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import { track } from '../services/telemetry';
import Button from '../components/Button';
import Card from '../components/Card';
import ShareBanner from '../components/ShareBanner';
import PescadoresHandoff from '../components/PescadoresHandoff';
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
  PathTrail,
} from '../components/Sketches';

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
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    track('home_view');
  }, []);

  const peeks = archetypesData.filter((a) => a.status === 'active');

  const openOverview = (a) => {
    setOverview(a);
    track('archetype_overview_opened', { archetypeId: a.id });
  };

  const dismissOverview = () => {
    if (overview) {
      track('archetype_overview_dismissed', { archetypeId: overview.id });
    }
    setOverview(null);
  };

  const confirmWithDiagnostic = () => {
    if (overview) {
      track('archetype_overview_to_diagnostic', {
        archetypeId: overview.id,
      });
    }
    navigate('/diagnostico');
  };

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative -mt-2">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-highlight/20 blur-2xl pointer-events-none" />
        <div className="absolute top-20 -right-10 w-32 h-32 rounded-full bg-primaryLight/40 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkle className="w-6 h-6" />
            <p className="font-hand text-secondary text-xl leading-tight">
              Trilha Empreendedora
            </p>
          </div>

          <h1 className="font-sans font-bold text-4xl md:text-5xl text-ink leading-[1.05] tracking-tight mb-2">
            Encontre o próximo passo certo pro seu negócio.
          </h1>
          <WavyUnderline className="w-48 h-3 mb-5" />

          <p className="text-secondary text-base md:text-lg leading-relaxed mb-6">
            Você responde algumas perguntas rápidas e recebe uma trilha
            prática pra organizar, vender melhor, entender seus números e
            dar o próximo passo.
          </p>

          <div className="flex justify-center my-8">
            <div className="relative">
              <div className="absolute inset-0 bg-highlight/30 rounded-full blur-xl scale-90" />
              <HeroNotebook className="relative w-48 h-48 md:w-56 md:h-56" />
            </div>
          </div>

          <Button
            onClick={() => navigate('/diagnostico')}
            className="w-full mb-3 text-lg"
          >
            Começar diagnóstico
          </Button>
          <p className="text-xs text-secondary text-center">
            Grátis · Sem cadastro pra começar · 5 minutos
          </p>
        </div>
      </section>

      <div className="flex items-center gap-2 text-secondary/40 -my-2 px-4">
        <PathTrail className="flex-1 h-5" />
      </div>

      {/* COMO FUNCIONA */}
      <section>
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          Como funciona
        </p>
        <h2 className="font-sans font-bold text-2xl text-ink leading-tight mb-4">
          Três passos simples
        </h2>
        <div className="space-y-3">
          {STEPS.map((s, idx) => {
            const tones = ['highlight', 'primary', 'soft'];
            return (
              <Card
                key={idx}
                tone={tones[idx]}
                className="flex gap-4 items-start"
              >
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
            );
          })}
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
          <MiniTrilhaCard
            sketch={<Sparkle className="w-14 h-14 shrink-0" />}
            title="Você consegue prever o caixa do mês que vem?"
            body="Sobre projeção: vai no feeling, anota o passado, ou projeta 3 meses pra frente."
            onClick={() => navigate('/mini/projecao')}
          />
          <MiniTrilhaCard
            sketch={<Pin className="w-14 h-14 shrink-0" />}
            title="Tem sócio, esposo(a) ou família no negócio?"
            body="Sobre sociedade: já tem conflito, tem zona cinza, ou tá combinado por escrito."
            onClick={() => navigate('/mini/socio_familia')}
          />
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
          O diagnóstico identifica seu perfil entre os 15 caminhos abaixo.
          Reconheceu algum?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {peeks.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => openOverview(a)}
              className="text-left bg-paper border border-line rounded-2xl p-3 hover:bg-beige transition-colors"
            >
              <p className="font-semibold text-ink text-sm leading-snug mb-1">
                {a.name}
              </p>
              <p className="text-secondary text-xs leading-snug line-clamp-2">
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
        <button
          type="button"
          onClick={() => navigate('/perfis')}
          className="w-full text-xs text-secondary underline underline-offset-4 py-2 mt-1"
        >
          Ler sobre os 15 perfis sem fazer o diagnóstico
        </button>
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
          {FEATURES.map((f, idx) => {
            const tones = ['soft', 'primary', 'highlight', 'green'];
            return (
              <Card
                key={idx}
                tone={tones[idx % tones.length]}
                className="flex gap-4 items-start"
              >
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
            );
          })}
        </div>
      </section>

      {/* METODOLOGIA */}
      <section>
        <Card tone="soft">
          <div className="flex gap-3 items-start">
            <Lightbulb className="w-10 h-10 shrink-0" />
            <div>
              <p className="font-hand text-secondary text-base leading-tight mb-1">
                De onde vem
              </p>
              <h3 className="font-bold text-ink leading-snug mb-2">
                Adaptação livre, sem intenção de lucro
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                A Trilha é uma adaptação livre de conteúdo disponível na
                internet sobre empreendedorismo de baixa renda e de casos
                reais anonimizados. Construída sem intenção de lucro,
                inspirada indiretamente no propósito da Khan Academy:
                educação prática, gratuita, no ritmo de quem precisa. O
                conteúdo é atualizado de tempos em tempos.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* PESCADORES — apoio humano parceiro */}
      <section>
        <PescadoresHandoff variant="onboarding" />
      </section>

      {/* SHARE BANNER */}
      <section>
        <ShareBanner tone="soft" />
      </section>

      <div className="flex items-center gap-2 text-secondary/40 -my-2 px-4">
        <PathTrail className="flex-1 h-5" />
      </div>

      {/* FINAL CTA */}
      <section>
        <Card tone="ink" className="text-center">
          <Sparkle className="w-7 h-7 mx-auto mb-3" color="#F7E27C" />
          <h2 className="font-bold text-paper text-2xl leading-snug mb-2">
            Pronto pra descobrir seu próximo passo?
          </h2>
          <p className="text-paper/70 text-sm leading-relaxed mb-5">
            5 minutos pra responder. 30 dias pra praticar.
          </p>
          <Button
            onClick={() => navigate('/diagnostico')}
            className="w-full bg-highlight text-ink hover:bg-highlight/90 shadow-lg"
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
        Adaptação livre, sem fins lucrativos. Inspirada no propósito da Khan
        Academy.
      </p>

      {overview && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
          onClick={dismissOverview}
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes do perfil"
        >
          <div
            className="w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl p-6 shadow-lg max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <p className="font-hand text-secondary text-base leading-tight mb-1">
                  Esse perfil é o seu?
                </p>
                <h2 className="font-bold text-ink text-lg leading-snug">
                  {overview.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={dismissOverview}
                aria-label="Fechar"
                className="w-8 h-8 rounded-full text-secondary hover:bg-line/40 shrink-0 text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-secondary text-sm leading-relaxed mb-4">
              {overview.shortDescription}
            </p>

            <div className="bg-beige border border-line rounded-2xl p-3 mb-3">
              <p className="font-bold text-ink text-sm mb-1">
                O que costuma acontecer
              </p>
              <p className="text-secondary text-sm leading-relaxed">
                {overview.commonPain}
              </p>
            </div>

            {overview.typicalMistakes?.length > 0 && (
              <div className="bg-paper border border-line rounded-2xl p-3 mb-4">
                <p className="font-bold text-ink text-sm mb-2">
                  Sinais típicos desse perfil
                </p>
                <ul className="list-disc pl-5 space-y-1 text-secondary text-sm leading-snug">
                  {overview.typicalMistakes.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-secondary leading-relaxed mb-3 px-1">
              Reconheceu o cenário? Faz o diagnóstico pra confirmar. Se não
              bater, dá pra voltar e conhecer outros perfis.
            </p>

            <div className="space-y-2">
              <Button onClick={confirmWithDiagnostic} className="w-full">
                Testar se é mesmo esse meu perfil
              </Button>
              <Button
                variant="ghost"
                onClick={dismissOverview}
                className="w-full"
              >
                Conhecer outros perfis
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
