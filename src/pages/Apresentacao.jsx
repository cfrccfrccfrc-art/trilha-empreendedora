// Apresentação institucional — versão desktop-friendly, scroll-driven.
// Rota fora do Layout pra ter controle total da largura (web-only).
// Texto à esquerda, visual à direita, 1 seção por viewport.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import ShareSheet from '../components/ShareSheet';
import {
  HeroNotebook,
  Sparkle,
  WavyUnderline,
  Lightbulb,
  OpenBook,
  Pin,
  StepOne,
  StepTwo,
  StepThree,
} from '../components/Sketches';
import { track } from '../services/telemetry';

const SHARE_TEXT =
  'Conheça a Trilha Empreendedora — diagnóstico em 5 minutos, trilha prática de 30 dias, gratuita. Pra quem está começando ou tentando organizar o negócio.';

function Section({
  eyebrow,
  title,
  body,
  visual,
  bgClass = 'bg-paper',
  align = 'left',
}) {
  return (
    <section
      className={`${bgClass} min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24`}
    >
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div
          className={`space-y-5 ${align === 'right' ? 'lg:order-2' : ''}`}
        >
          {eyebrow && (
            <p className="font-hand text-secondary text-xl leading-tight">
              {eyebrow}
            </p>
          )}
          <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.05]">
            {title}
          </h2>
          {typeof body === 'string' ? (
            <p className="text-secondary text-lg sm:text-xl leading-relaxed max-w-xl">
              {body}
            </p>
          ) : (
            body
          )}
        </div>
        <div className={align === 'right' ? 'lg:order-1' : ''}>{visual}</div>
      </div>
    </section>
  );
}

function PhoneFrame({ children, className = '' }) {
  return (
    <div
      className={`mx-auto bg-ink rounded-[2.5rem] p-2 shadow-2xl max-w-[280px] ${className}`}
    >
      <div className="bg-paper rounded-[2rem] overflow-hidden">
        <div className="px-5 py-6 min-h-[420px] relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-ink rounded-full opacity-20" />
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FunnelVisual() {
  return (
    <div className="relative mx-auto max-w-md">
      <svg viewBox="0 0 400 360" className="w-full">
        <defs>
          <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF4D6" />
            <stop offset="1" stopColor="#4F7CAC" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          d="M 30 30 L 370 30 L 270 230 L 130 230 Z"
          fill="url(#funnelGrad)"
          stroke="#2B2A28"
          strokeWidth="3"
        />
        <text
          x="200"
          y="80"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="22"
          fontWeight="700"
          fill="#2B2A28"
        >
          milhares de visitas
        </text>
        <text
          x="200"
          y="135"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="18"
          fontWeight="600"
          fill="#5A574F"
        >
          diagnóstico em 5 min
        </text>
        <text
          x="200"
          y="180"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="16"
          fill="#5A574F"
        >
          trilha de 30 dias
        </text>
        <text
          x="200"
          y="215"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="14"
          fill="#5A574F"
        >
          quem trava pede apoio humano
        </text>
        <path
          d="M 200 240 L 200 290"
          stroke="#2B2A28"
          strokeWidth="3"
          strokeDasharray="4 4"
          fill="none"
        />
        <polygon points="200,300 195,290 205,290" fill="#2B2A28" />
        <rect
          x="120"
          y="305"
          width="160"
          height="50"
          rx="12"
          fill="#0B1F3A"
        />
        <text
          x="200"
          y="335"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="18"
          fontWeight="700"
          fill="#D8EEF5"
        >
          Projeto Pescadores
        </text>
      </svg>
    </div>
  );
}

function NetworkVisual() {
  return (
    <svg viewBox="0 0 400 320" className="w-full max-w-md mx-auto">
      <g fill="#4F7CAC" opacity="0.8">
        <circle cx="200" cy="160" r="18" />
        <circle cx="120" cy="100" r="10" />
        <circle cx="280" cy="100" r="10" />
        <circle cx="80" cy="180" r="10" />
        <circle cx="320" cy="180" r="10" />
        <circle cx="150" cy="240" r="10" />
        <circle cx="250" cy="240" r="10" />
        <circle cx="60" cy="80" r="6" opacity="0.55" />
        <circle cx="340" cy="80" r="6" opacity="0.55" />
        <circle cx="50" cy="240" r="6" opacity="0.55" />
        <circle cx="350" cy="240" r="6" opacity="0.55" />
        <circle cx="100" cy="280" r="6" opacity="0.55" />
        <circle cx="300" cy="280" r="6" opacity="0.55" />
      </g>
      <g stroke="#4F7CAC" strokeWidth="1.5" fill="none" opacity="0.55">
        <line x1="200" y1="160" x2="120" y2="100" />
        <line x1="200" y1="160" x2="280" y2="100" />
        <line x1="200" y1="160" x2="80" y2="180" />
        <line x1="200" y1="160" x2="320" y2="180" />
        <line x1="200" y1="160" x2="150" y2="240" />
        <line x1="200" y1="160" x2="250" y2="240" />
        <line x1="120" y1="100" x2="60" y2="80" />
        <line x1="280" y1="100" x2="340" y2="80" />
        <line x1="80" y1="180" x2="50" y2="240" />
        <line x1="320" y1="180" x2="350" y2="240" />
        <line x1="150" y1="240" x2="100" y2="280" />
        <line x1="250" y1="240" x2="300" y2="280" />
      </g>
    </svg>
  );
}

function PainQuotes() {
  const sampled = [
    'Vendo todo dia, mas no fim do mês não sobra',
    'Tenho uma ideia, mas nunca testei com cliente',
    'Faço tudo sozinha e o dia nunca acaba',
    'Quem vê de perto adora, mas pouca gente chega',
    'Posto bonito todo dia, mas não sei se sobra lucro',
  ];
  return (
    <div className="space-y-3 max-w-md mx-auto">
      {sampled.map((q, i) => (
        <div
          key={q}
          className="bg-paper border border-line rounded-2xl p-4 shadow-sm transform"
          style={{
            transform: `rotate(${i % 2 === 0 ? -0.8 : 0.8}deg) translateX(${
              i * 4
            }px)`,
          }}
        >
          <p className="text-ink text-lg leading-snug">
            <span className="font-hand text-secondary mr-2">"</span>
            {q}
            <span className="font-hand text-secondary ml-1">"</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function KhanCitationVisual() {
  return (
    <div className="bg-beige border border-line rounded-3xl p-8 max-w-md mx-auto shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <Lightbulb className="w-12 h-12 shrink-0" />
        <p className="font-hand text-secondary text-lg leading-tight">
          De onde vem a ideia
        </p>
      </div>
      <p className="font-sans font-bold text-2xl text-ink leading-snug mb-3">
        Khan Academy
      </p>
      <p className="text-secondary text-base leading-relaxed">
        Educação prática, gratuita, no ritmo de quem precisa. Provou que
        self-service estruturado escala alcance educacional sem perder
        qualidade.
      </p>
      <div className="border-t border-line pt-3 mt-4">
        <p className="text-xs text-secondary italic leading-snug">
          A Trilha é uma adaptação livre desse princípio aplicada ao
          microempreendedor brasileiro.
        </p>
      </div>
    </div>
  );
}

function ProductMocks() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <PhoneFrame className="rotate-[-3deg]">
        <p className="font-hand text-secondary text-sm mb-2">Pergunta 4 de 35</p>
        <div className="w-full h-1.5 bg-line rounded-full mb-5 overflow-hidden">
          <div className="h-full bg-primary w-[11%]" />
        </div>
        <h3 className="font-bold text-ink text-lg leading-tight mb-4">
          Você sabe quanto entrou e saiu do negócio no último mês?
        </h3>
        <div className="space-y-2">
          {[
            'Sim, com detalhes',
            'Sim, mais ou menos',
            'Não',
            'Não sei',
          ].map((label, i) => (
            <div
              key={label}
              className={`text-sm rounded-xl border px-3 py-2 ${
                i === 1
                  ? 'border-primary bg-primaryLight text-ink'
                  : 'border-line bg-paper text-ink'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </PhoneFrame>

      <PhoneFrame className="sm:translate-y-6">
        <p className="font-hand text-secondary text-sm">Seu perfil</p>
        <h3 className="font-bold text-ink text-base leading-snug mb-3">
          "Vendo todo dia, mas no fim do mês não sobra"
        </h3>
        <div className="bg-primaryLight/40 border border-primary rounded-xl p-3 mb-3">
          <p className="font-hand text-secondary text-xs mb-1">
            Sua primeira missão
          </p>
          <p className="text-ink text-sm font-semibold">
            Anotar entradas e saídas por 7 dias
          </p>
        </div>
        <div className="space-y-1.5">
          {['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'].map((w) => (
            <div
              key={w}
              className="flex gap-2 items-center text-xs text-secondary"
            >
              <span className="font-hand text-primary">{w}</span>
              <span className="flex-1 h-px bg-line" />
            </div>
          ))}
        </div>
      </PhoneFrame>

      <PhoneFrame className="rotate-[2deg]">
        <p className="font-hand text-secondary text-sm mb-1">
          Quem fez antes de você
        </p>
        <h3 className="font-bold text-ink text-base leading-snug mb-3">
          Dona Marlene, a quitanda em Olinda
        </h3>
        <div className="space-y-2">
          <div className="bg-paper border border-line rounded-xl p-2">
            <p className="font-hand text-primary text-xs">Dia 1</p>
            <p className="text-ink text-xs leading-snug">
              Começou confiante, mas só lembrou de anotar à noite. Valor:
              'mais ou menos R$ 12'.
            </p>
          </div>
          <div className="bg-paper border border-line rounded-xl p-2">
            <p className="font-hand text-primary text-xs">Domingo</p>
            <p className="text-ink text-xs leading-snug">
              Somou tudo: sobrou R$ 260, e ela jurava ter 'uns R$ 800'.
            </p>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}

function ScaleNumbers() {
  return (
    <div className="space-y-8 max-w-md mx-auto text-center">
      <div>
        <p className="font-sans font-bold text-[8rem] sm:text-[9rem] text-primary leading-none">
          184
        </p>
        <p className="text-secondary text-lg mt-2">
          itens de conteúdo curado, no ar
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div>
          <p className="font-sans font-bold text-3xl text-ink">13</p>
          <p className="text-xs text-secondary">perfis cobertos</p>
        </div>
        <div>
          <p className="font-sans font-bold text-3xl text-ink">28</p>
          <p className="text-xs text-secondary">companheiros</p>
        </div>
        <div>
          <p className="font-sans font-bold text-3xl text-ink">0</p>
          <p className="text-xs text-secondary">atendentes</p>
        </div>
      </div>
    </div>
  );
}

export default function Apresentacao() {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    track('apresentacao_view');
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  const activeCount = archetypesData.filter((a) => a.status === 'active')
    .length;

  return (
    <div className="bg-paper min-h-screen overflow-x-hidden">
      {/* Top bar minimal */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-paper/85 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Sparkle className="w-5 h-5" />
            <span className="font-hand text-secondary text-base">
              Trilha Empreendedora
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              track('apresentacao_share_clicked');
              setShareOpen(true);
            }}
            className="text-primary text-sm font-semibold"
          >
            Compartilhar →
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="min-h-screen flex items-center px-6 sm:px-10 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto w-full">
          <p className="font-hand text-secondary text-xl mb-6">
            Apresentação
          </p>
          <h1 className="font-sans font-bold text-5xl sm:text-7xl lg:text-[6.5rem] text-ink leading-[0.95] mb-8">
            Pra quem empreende
            <br />
            no escuro.
          </h1>
          <WavyUnderline className="w-64 h-4 mb-8" />
          <p className="text-secondary text-xl sm:text-2xl leading-relaxed max-w-3xl">
            A Trilha Empreendedora é um diagnóstico gratuito de 5 minutos
            que entrega uma trilha de 30 dias com missões práticas, casos
            reais e companheiros de jornada — pra microempreendedor que
            quer próximo passo claro, não outra biblioteca de PDF.
          </p>
        </div>
      </section>

      {/* 1 — A DOR */}
      <Section
        bgClass="bg-beige"
        eyebrow="A dor"
        title={
          <>
            30 milhões de empreendedores brasileiros.
            <br />
            <span className="text-primary">A maioria sozinha no escuro.</span>
          </>
        }
        body="Vendem todo dia, mas no fim do mês não sobra. Não sabem se lucram. Não sabem onde começar a organizar. Conteúdo existe — Sebrae, BCB, YouTube têm bibliotecas inteiras. Falta TRILHA. Falta saber qual o próximo passo PRA ELE."
        visual={<PainQuotes />}
      />

      {/* 2 — O QUE FALTA */}
      <Section
        eyebrow="O que falta"
        title={
          <>
            Catálogo é fácil.
            <br />
            <span className="text-primary">Mapa personalizado é raro.</span>
          </>
        }
        body="O empreendedor não precisa de biblioteca. Precisa do próximo passo. Conteúdo solto não converte em ação. O que converte é diagnóstico + trilha curta + companheiro que já passou."
        align="right"
        visual={
          <div className="bg-paper border border-line rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <p className="text-secondary text-sm mb-3">Hoje:</p>
            <p className="text-ink text-lg mb-6 leading-snug">
              "Tem 800 artigos no Sebrae. Por onde eu começo?"
            </p>
            <p className="text-secondary text-sm mb-3">Com a Trilha:</p>
            <p className="text-ink text-lg leading-snug">
              "Você é o perfil X. Sua primeira missão é Y. Em 7 dias volta
              que tem a próxima."
            </p>
          </div>
        }
      />

      {/* 3 — INSPIRAÇÃO */}
      <Section
        bgClass="bg-beige"
        eyebrow="A inspiração"
        title={
          <>
            E se Khan Academy fosse um
            <br />
            <span className="text-primary">plano de 30 dias pro seu negócio?</span>
          </>
        }
        body="Khan provou: educação prática, gratuita e estruturada escala. Self-service entrega qualidade sem call center. A Trilha aplica esse princípio ao microempreendedor brasileiro — sem mensalidade, sem cadastro pra começar, sem operadora."
        visual={<KhanCitationVisual />}
      />

      {/* 4 — COMO FUNCIONA */}
      <Section
        eyebrow="Como funciona"
        title={
          <>
            5 minutos.
            <br />
            {activeCount} perfis.
            <br />
            <span className="text-primary">30 dias.</span>
          </>
        }
        body="Diagnóstico curto identifica seu perfil entre 13 caminhos possíveis. Recebe trilha de 4 missões práticas (uma por semana), com companheiros reais que já viveram a mesma fase — e casos curtos que mostram como a coisa joga no Brasil."
        align="right"
        visual={<ProductMocks />}
      />

      {/* 5 — ESCALABILIDADE */}
      <Section
        bgClass="bg-beige"
        eyebrow="Como escala"
        title={
          <>
            Self-service.
            <br />
            <span className="text-primary">Sem fricção.</span>
          </>
        }
        body="Tudo entregue por código. Nenhuma operadora atendendo zap, nenhuma mensalidade, nenhum cadastro obrigatório. Conteúdo curado pra alta densidade. Mantida por doação Pix voluntária."
        visual={<ScaleNumbers />}
      />

      {/* 6 — PESCADORES FUNIL */}
      <Section
        eyebrow="O pulo do gato"
        title={
          <>
            Trilha é o topo do funil.
            <br />
            <span className="text-primary">Pescadores fecha.</span>
          </>
        }
        body="Quando ler conteúdo não basta, o empreendedor é encaminhado pra apoio humano direto do Projeto Pescadores — parceiro que atende casos individualmente, gratuito. A Trilha educa, qualifica e direciona quem precisa de gente. Pescadores recebe casos com base já trabalhada."
        align="right"
        visual={<FunnelVisual />}
      />

      {/* 7 — VISÃO + CTA */}
      <section className="bg-ink text-paper min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <p className="font-hand text-paper/70 text-xl">A visão</p>
            <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Cada empreendedora que termina os 30 dias é{' '}
              <span className="text-highlight">um negócio menos no escuro</span>.
            </h2>
            <p className="text-paper/80 text-lg sm:text-xl leading-relaxed">
              Conhece quem precisa? Compartilha. Tem parceria possível
              (Sebrae regional, igreja de bairro, CRAS, programa social)?
              Manda mensagem. A app é gratuita e cresce com quem espalha.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  track('apresentacao_share_clicked', { placement: 'final' });
                  setShareOpen(true);
                }}
                className="bg-highlight text-ink font-bold px-6 py-3 rounded-2xl hover:bg-highlight/90 transition-colors"
              >
                Compartilhar a Trilha →
              </button>
              <a
                href="https://projetopescadores.com.br/contato"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('apresentacao_pescadores_clicked', {
                    placement: 'final',
                  })
                }
                className="border border-paper/40 text-paper px-6 py-3 rounded-2xl hover:bg-paper/10 transition-colors"
              >
                Falar com o Pescadores
              </a>
            </div>
            <p className="text-paper/50 text-sm pt-4">
              Trilha Empreendedora · gratuita · sem fins lucrativos ·{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="underline hover:text-paper"
              >
                trilhaempreendedora.com.br
              </button>
            </p>
          </div>
          <NetworkVisual />
        </div>
      </section>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        text={SHARE_TEXT}
      />
    </div>
  );
}
