// Apresentação institucional bilíngue (PT/EN).
// Rota fora do Layout pra ter controle total da largura (web-only).
// Texto à esquerda, visual à direita, 1 seção por viewport.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import ShareSheet from '../components/ShareSheet';
import {
  Sparkle,
  WavyUnderline,
  Lightbulb,
} from '../components/Sketches';
import { track } from '../services/telemetry';

const LANG_KEY = 'trilha_apresentacao_lang';

// Tempo de leitura de cada seção, em ms. Calibrado pra dar tempo de ler
// o texto + observar o visual. Total: ~100s pra rodar tudo automaticamente.
// Index 0 = Hero, 1-7 = Sections 1 a 7.
const SECTION_DURATIONS_MS = [
  13000, // Hero — pitch curto + tagline longa
  12000, // 1 — A dor + 5 quotes (precisa tempo pra ler os quotes)
  10000, // 2 — O que falta + antes/depois
  12000, // 3 — Khan card
  15000, // 4 — Como funciona + 3 phone mocks (mais coisa pra escanear)
   9000, // 5 — Escalabilidade (visual numérico)
  13000, // 6 — Funil Pescadores
  12000, // 7 — Visão final + CTAs
];
const TOTAL_SECTIONS = SECTION_DURATIONS_MS.length;

// ---------- Copy (PT / EN) ----------
const COPY = {
  pt: {
    appName: 'Trilha Empreendedora',
    share: 'Compartilhar',
    shareText:
      'Conheça a Trilha Empreendedora — diagnóstico em 5 minutos, trilha prática de 30 dias, gratuita. Pra quem está começando ou tentando organizar o negócio.',

    heroEyebrow: 'Apresentação',
    heroLine1: 'Pra quem empreende',
    heroLine2: 'no escuro.',
    heroBody:
      'A Trilha Empreendedora é um diagnóstico gratuito de 5 minutos que entrega uma trilha de 30 dias com missões práticas, casos reais e companheiros de jornada — pra microempreendedor que quer próximo passo claro, não outra biblioteca de PDF.',

    s1Eyebrow: 'A dor',
    s1Line1: '30 milhões de empreendedores brasileiros.',
    s1Line2: 'A maioria sozinha no escuro.',
    s1Body:
      'Vendem todo dia, mas no fim do mês não sobra. Não sabem se lucram. Não sabem onde começar a organizar. Conteúdo existe — Sebrae, BCB, YouTube têm bibliotecas inteiras. Falta TRILHA. Falta saber qual o próximo passo PRA CADA UM.',
    s1Quotes: [
      'Vendo todo dia, mas no fim do mês não sobra',
      'Tenho uma ideia, mas nunca testei com cliente',
      'Faço tudo sozinha e o dia nunca acaba',
      'Quem vê de perto adora, mas pouca gente chega',
      'Posto bonito todo dia, mas não sei se sobra lucro',
    ],

    s2Eyebrow: 'O que falta',
    s2Line1: 'Catálogo é fácil.',
    s2Line2: 'Mapa personalizado é raro.',
    s2Body:
      'Quem empreende não precisa de biblioteca. Precisa do próximo passo. Conteúdo solto não converte em ação. O que converte é diagnóstico + trilha curta + companheiro ou companheira que já passou.',
    s2BeforeLabel: 'Hoje:',
    s2BeforeQuote:
      '"Tem 800 artigos no Sebrae. Por onde eu começo?"',
    s2AfterLabel: 'Com a Trilha:',
    s2AfterQuote:
      '"Você é o perfil X. Sua primeira missão é Y. Em 7 dias volta que tem a próxima."',

    s3Eyebrow: 'A inspiração',
    s3Line1: 'E se Khan Academy fosse um',
    s3Line2: 'plano de 30 dias pro seu negócio?',
    s3Body:
      'Khan provou: educação prática, gratuita e estruturada escala. Self-service entrega qualidade sem call center. A Trilha aplica esse princípio a quem empreende no Brasil — sem mensalidade, sem cadastro pra começar, sem operadora.',
    khanEyebrow: 'De onde vem a ideia',
    khanTitle: 'Khan Academy',
    khanBody:
      'Educação prática, gratuita, no ritmo de quem precisa. Provou que self-service estruturado escala alcance educacional sem perder qualidade.',
    khanFooter:
      'A Trilha é uma adaptação livre desse princípio aplicada ao microempreendedor brasileiro.',

    s4Eyebrow: 'Como funciona',
    s4Line1: '5 minutos.',
    s4Line2: '15 perfis.',
    s4Line3: '30 dias.',
    s4Body:
      'Diagnóstico curto identifica seu perfil entre 15 caminhos possíveis. Recebe trilha de 4 missões práticas (uma por semana), com companheiros reais que já viveram a mesma fase — e casos curtos que mostram como a coisa joga no Brasil.',
    mock1Progress: 'Pergunta 4 de 35',
    mock1Question:
      'Você sabe quanto entrou e saiu do negócio no último mês?',
    mock1Options: ['Sim, com detalhes', 'Sim, mais ou menos', 'Não', 'Não sei'],
    mock2Eyebrow: 'Seu perfil',
    mock2Profile: '"Vendo todo dia, mas no fim do mês não sobra"',
    mock2FirstMissionLabel: 'Sua primeira missão',
    mock2FirstMission: 'Anotar entradas e saídas por 7 dias',
    mock2WeekLabels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    mock3Eyebrow: 'Quem fez antes de você',
    mock3PersonaTitle: 'Dona Marlene, a quitanda em Olinda',
    mock3Day1: 'Dia 1',
    mock3Day1Body:
      "Começou confiante, mas só lembrou de anotar à noite. Valor: 'mais ou menos R$ 12'.",
    mock3DaySun: 'Domingo',
    mock3DaySunBody:
      "Somou tudo: sobrou R$ 260, e ela jurava ter 'uns R$ 800'.",

    s5Eyebrow: 'Como escala',
    s5Line1: 'Self-service.',
    s5Line2: 'Sem fricção.',
    s5Body:
      'Tudo entregue por código. Nenhuma operadora atendendo zap, nenhuma mensalidade, nenhum cadastro obrigatório. Conteúdo curado pra alta densidade. Mantida por doação Pix voluntária.',
    scaleMainLabel: 'itens de conteúdo curado, no ar',
    scaleProfilesLabel: 'perfis cobertos',
    scaleCompanionsLabel: 'companheiros',
    scaleOperatorsLabel: 'atendentes',

    s6Eyebrow: 'O pulo do gato',
    s6Line1: 'Trilha é o topo do funil.',
    s6Line2: 'Pescadores fecha.',
    s6Body:
      'Quando ler conteúdo não basta, quem está fazendo a trilha é encaminhada(o) pra apoio humano direto do Projeto Pescadores — parceiro que atende casos individualmente, gratuito. A Trilha educa, qualifica e direciona quem precisa de gente. Pescadores recebe casos com base já trabalhada.',
    funnelTopLabel: 'milhares de visitas',
    funnelMidLabel: 'diagnóstico em 5 min',
    funnelMid2Label: 'trilha de 30 dias',
    funnelBottomLabel: 'quem trava pede apoio humano',
    funnelOutLabel: 'Projeto Pescadores',

    s7Eyebrow: 'A visão',
    s7TitlePre: 'Cada empreendedor ou empreendedora que termina os 30 dias é',
    s7TitleHighlight: 'um negócio menos no escuro.',
    s7Body:
      'Conhece quem precisa? Compartilha. Tem parceria possível (Sebrae regional, igreja de bairro, CRAS, programa social)? Manda mensagem. A app é gratuita e cresce com quem espalha.',
    s7CtaPrimary: 'Compartilhar a Trilha →',
    s7CtaSecondary: 'Falar com o Pescadores',
    s7Footer: 'Trilha Empreendedora · gratuita · sem fins lucrativos · ',
  },
  en: {
    appName: 'Trilha Empreendedora',
    share: 'Share',
    shareText:
      'Check out Trilha Empreendedora — a 5-minute free diagnostic and a practical 30-day journey for micro-entrepreneurs. For people just starting or trying to organize their business.',

    heroEyebrow: 'The pitch',
    heroLine1: 'For those who run a business',
    heroLine2: 'in the dark.',
    heroBody:
      'Trilha Empreendedora ("Entrepreneur Trail") is a free 5-minute diagnostic that delivers a 30-day journey with practical missions, real cases, and peer companions — for the Brazilian micro-entrepreneur who wants a clear next step, not yet another PDF library.',

    s1Eyebrow: 'The pain',
    s1Line1: '30 million Brazilian entrepreneurs.',
    s1Line2: 'Most of them alone in the dark.',
    s1Body:
      "They sell every day, but nothing's left at month-end. They don't know if they're profitable. They don't know where to start. Content exists — Sebrae, the Central Bank, YouTube are full libraries. What's missing is a JOURNEY. Knowing what the next step is FOR THEM.",
    s1Quotes: [
      "I sell every day, but nothing's left at month-end",
      'I have an idea, but never tested it with a customer',
      'I do everything alone and the day never ends',
      'Those who see it up close love it, but few find their way to me',
      "I post pretty every day, but don't know if I'm making any profit",
    ],

    s2Eyebrow: "What's missing",
    s2Line1: 'A catalog is easy.',
    s2Line2: 'A personalized map is rare.',
    s2Body:
      "Entrepreneurs don't need a library. They need the next step. Loose content doesn't convert to action. What converts is diagnostic + short journey + a companion who's been there.",
    s2BeforeLabel: 'Today:',
    s2BeforeQuote:
      "\"There are 800 articles on Sebrae. Where do I even start?\"",
    s2AfterLabel: 'With Trilha:',
    s2AfterQuote:
      "\"You're profile X. Your first mission is Y. Come back in 7 days for the next.\"",

    s3Eyebrow: 'The inspiration',
    s3Line1: 'What if Khan Academy were a',
    s3Line2: '30-day plan for your business?',
    s3Body:
      'Khan proved it: practical, free, structured education scales. Self-service delivers quality without a call center. Trilha applies that principle to the Brazilian micro-entrepreneur — no subscription, no signup to begin, no operator.',
    khanEyebrow: 'Where the idea comes from',
    khanTitle: 'Khan Academy',
    khanBody:
      'Practical, free education, at the pace of who needs it. Proved that structured self-service can scale educational reach without sacrificing quality.',
    khanFooter:
      'Trilha is a free-form adaptation of that principle, applied to the Brazilian micro-entrepreneur.',

    s4Eyebrow: 'How it works',
    s4Line1: '5 minutes.',
    s4Line2: '15 profiles.',
    s4Line3: '30 days.',
    s4Body:
      "A short diagnostic identifies your profile among 15 possible paths. You get a journey of 4 practical missions (one per week), with real companions who've lived the same stage — and short cases that show how things play out in Brazil.",
    mock1Progress: 'Question 4 of 35',
    mock1Question:
      'Do you know how much came in and went out of the business last month?',
    mock1Options: ['Yes, in detail', 'Yes, roughly', 'No', "Don't know"],
    mock2Eyebrow: 'Your profile',
    mock2Profile: '"I sell every day, but nothing\'s left at month-end"',
    mock2FirstMissionLabel: 'Your first mission',
    mock2FirstMission: 'Track income and expenses for 7 days',
    mock2WeekLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    mock3Eyebrow: 'Someone who did it before you',
    mock3PersonaTitle: 'Dona Marlene, the grocery shop in Olinda',
    mock3Day1: 'Day 1',
    mock3Day1Body:
      "Started confident, but only remembered to log at night. Amount: 'around R$ 12'.",
    mock3DaySun: 'Sunday',
    mock3DaySunBody:
      "Added it all up: R$ 260 left over — and she swore she had 'about R$ 800'.",

    s5Eyebrow: 'How it scales',
    s5Line1: 'Self-service.',
    s5Line2: 'No friction.',
    s5Body:
      'Everything delivered by code. No operators answering WhatsApp, no subscription, no required signup. Curated content for high density. Supported by voluntary Pix donations.',
    scaleMainLabel: 'curated content items, live',
    scaleProfilesLabel: 'profiles covered',
    scaleCompanionsLabel: 'companions',
    scaleOperatorsLabel: 'operators',

    s6Eyebrow: 'The twist',
    s6Line1: 'Trilha is the top of the funnel.',
    s6Line2: 'Pescadores closes it.',
    s6Body:
      "When reading content isn't enough, the entrepreneur is referred to direct human support from Projeto Pescadores — a partner that handles cases individually, free of charge. Trilha educates, qualifies, and routes those who need human help. Pescadores receives cases with the foundations already in place.",
    funnelTopLabel: 'thousands of visits',
    funnelMidLabel: '5-minute diagnostic',
    funnelMid2Label: '30-day journey',
    funnelBottomLabel: 'those stuck ask for human help',
    funnelOutLabel: 'Projeto Pescadores',

    s7Eyebrow: 'The vision',
    s7TitlePre: 'Every entrepreneur who completes the 30 days is',
    s7TitleHighlight: 'one less business in the dark.',
    s7Body:
      'Know someone who needs this? Share it. See a possible partnership (a regional business support agency, a local church, a community center, a social program)? Reach out. The app is free and grows with the people who spread the word.',
    s7CtaPrimary: 'Share Trilha →',
    s7CtaSecondary: 'Talk to Pescadores',
    s7Footer: 'Trilha Empreendedora · free · non-profit · ',
  },
};

// ---------- Layout primitive ----------
function Section({ children, bgClass = 'bg-paper', idx }) {
  return (
    <section
      data-tour-section={idx}
      className={`${bgClass} min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24`}
    >
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {children}
      </div>
    </section>
  );
}

function TextBlock({ eyebrow, titleLines, body, align = 'left' }) {
  return (
    <div className={`space-y-5 ${align === 'right' ? 'lg:order-2' : ''}`}>
      {eyebrow && (
        <p className="font-hand text-secondary text-xl leading-tight">
          {eyebrow}
        </p>
      )}
      <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.05]">
        {titleLines.map((line, i) => (
          <span key={i}>
            {line.highlight ? (
              <span className="text-primary">{line.text}</span>
            ) : (
              line.text
            )}
            {i < titleLines.length - 1 && <br />}
          </span>
        ))}
      </h2>
      {body && (
        <p className="text-secondary text-lg sm:text-xl leading-relaxed max-w-xl">
          {body}
        </p>
      )}
    </div>
  );
}

function VisualBlock({ children, align = 'left' }) {
  return <div className={align === 'right' ? 'lg:order-1' : ''}>{children}</div>;
}

// ---------- Visuals ----------
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

function FunnelVisual({ t }) {
  return (
    <div className="relative mx-auto max-w-md">
      <svg viewBox="0 0 400 360" className="w-full">
        <defs>
          <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF4D6" />
            <stop offset="1" stopColor="#4F7CAC" stopOpacity="0.18" />
          </linearGradient>
          <clipPath id="pescadoresLogoClip">
            <circle cx="115" cy="333" r="18" />
          </clipPath>
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
          fontSize="20"
          fontWeight="700"
          fill="#2B2A28"
        >
          {t.funnelTopLabel}
        </text>
        <text
          x="200"
          y="135"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="17"
          fontWeight="600"
          fill="#5A574F"
        >
          {t.funnelMidLabel}
        </text>
        <text
          x="200"
          y="180"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="15"
          fill="#5A574F"
        >
          {t.funnelMid2Label}
        </text>
        <text
          x="200"
          y="215"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="13"
          fill="#5A574F"
        >
          {t.funnelBottomLabel}
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
          x="95"
          y="305"
          width="210"
          height="55"
          rx="12"
          fill="#0B1F3A"
        />
        <circle
          cx="115"
          cy="333"
          r="19"
          fill="#FFFDF7"
          stroke="#D8EEF5"
          strokeWidth="1.5"
        />
        <image
          href="/pescadores-logo.jpg"
          x="97"
          y="315"
          width="36"
          height="36"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#pescadoresLogoClip)"
        />
        <text
          x="225"
          y="338"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="16"
          fontWeight="700"
          fill="#D8EEF5"
        >
          {t.funnelOutLabel}
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

function PainQuotes({ quotes }) {
  return (
    <div className="space-y-3 max-w-md mx-auto">
      {quotes.map((q, i) => (
        <div
          key={q}
          className="bg-paper border border-line rounded-2xl p-4 shadow-sm"
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

function KhanCitationVisual({ t }) {
  return (
    <div className="bg-beige border border-line rounded-3xl p-8 max-w-md mx-auto shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <Lightbulb className="w-12 h-12 shrink-0" />
        <p className="font-hand text-secondary text-lg leading-tight">
          {t.khanEyebrow}
        </p>
      </div>
      <p className="font-sans font-bold text-2xl text-ink leading-snug mb-3">
        {t.khanTitle}
      </p>
      <p className="text-secondary text-base leading-relaxed">{t.khanBody}</p>
      <div className="border-t border-line pt-3 mt-4">
        <p className="text-xs text-secondary italic leading-snug">
          {t.khanFooter}
        </p>
      </div>
    </div>
  );
}

function ProductMocks({ t }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <PhoneFrame className="rotate-[-3deg]">
        <p className="font-hand text-secondary text-sm mb-2">
          {t.mock1Progress}
        </p>
        <div className="w-full h-1.5 bg-line rounded-full mb-5 overflow-hidden">
          <div className="h-full bg-primary w-[11%]" />
        </div>
        <h3 className="font-bold text-ink text-lg leading-tight mb-4">
          {t.mock1Question}
        </h3>
        <div className="space-y-2">
          {t.mock1Options.map((label, i) => (
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
        <p className="font-hand text-secondary text-sm">{t.mock2Eyebrow}</p>
        <h3 className="font-bold text-ink text-base leading-snug mb-3">
          {t.mock2Profile}
        </h3>
        <div className="bg-primaryLight/40 border border-primary rounded-xl p-3 mb-3">
          <p className="font-hand text-secondary text-xs mb-1">
            {t.mock2FirstMissionLabel}
          </p>
          <p className="text-ink text-sm font-semibold">
            {t.mock2FirstMission}
          </p>
        </div>
        <div className="space-y-1.5">
          {t.mock2WeekLabels.map((w) => (
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
          {t.mock3Eyebrow}
        </p>
        <h3 className="font-bold text-ink text-base leading-snug mb-3">
          {t.mock3PersonaTitle}
        </h3>
        <div className="space-y-2">
          <div className="bg-paper border border-line rounded-xl p-2">
            <p className="font-hand text-primary text-xs">{t.mock3Day1}</p>
            <p className="text-ink text-xs leading-snug">
              {t.mock3Day1Body}
            </p>
          </div>
          <div className="bg-paper border border-line rounded-xl p-2">
            <p className="font-hand text-primary text-xs">{t.mock3DaySun}</p>
            <p className="text-ink text-xs leading-snug">
              {t.mock3DaySunBody}
            </p>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}

function ScaleNumbers({ t }) {
  return (
    <div className="space-y-8 max-w-md mx-auto text-center">
      <div>
        <p className="font-sans font-bold text-[8rem] sm:text-[9rem] text-primary leading-none">
          184
        </p>
        <p className="text-secondary text-lg mt-2">{t.scaleMainLabel}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div>
          <p className="font-sans font-bold text-3xl text-ink">13</p>
          <p className="text-xs text-secondary">{t.scaleProfilesLabel}</p>
        </div>
        <div>
          <p className="font-sans font-bold text-3xl text-ink">28</p>
          <p className="text-xs text-secondary">{t.scaleCompanionsLabel}</p>
        </div>
        <div>
          <p className="font-sans font-bold text-3xl text-ink">0</p>
          <p className="text-xs text-secondary">{t.scaleOperatorsLabel}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function Apresentacao() {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'pt' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'pt';
  });
  const t = COPY[lang];

  // Auto-scroll state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef(null);
  const manualScrollIgnoreUntil = useRef(0);

  // Audio (trilha sonora opcional — public/bailey.mp3).
  // Browsers só permitem play após user gesture. Como o tour só toca quando
  // o usuário clica em ▶, isso conta como gesture e o áudio pode tocar junto.
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  useEffect(() => {
    const audio = new Audio('/bailey.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';
    const onCanPlay = () => setAudioAvailable(true);
    const onError = () => setAudioAvailable(false);
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Sincroniza áudio com auto-scroll: toca quando play está ativo e som não
  // está mutado. Pausa quando o tour pausa, quando muta, ou no fim.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && !muted) {
      audio.play().catch(() => {
        // Browser bloqueou (autoplay policy ou erro do arquivo).
        // Não atrapalha o tour, só sem som.
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, muted]);

  useEffect(() => {
    track('apresentacao_view', { lang });
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');
    return () => {
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.setAttribute('lang', 'pt-BR');
    };
  }, [lang]);

  // Tracker: qual seção está visível agora (via IntersectionObserver).
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll('[data-tour-section]')
    );
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pega a seção com maior interseção visível.
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
        if (best) {
          const idx = parseInt(best.target.dataset.tourSection, 10);
          if (!Number.isNaN(idx)) setCurrentIdx(idx);
        }
      },
      {
        threshold: [0.3, 0.5, 0.7],
      }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Engine do auto-scroll: quando isPlaying=true, agenda próximo scroll
  // baseado no tempo de leitura da seção atual.
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const duration = SECTION_DURATIONS_MS[currentIdx] || 11000;
    const nextIdx = currentIdx + 1;

    timerRef.current = setTimeout(() => {
      if (nextIdx >= TOTAL_SECTIONS) {
        setIsPlaying(false);
        track('apresentacao_autoplay_finished', { lang });
        return;
      }
      const nextEl = document.querySelector(
        `[data-tour-section="${nextIdx}"]`
      );
      if (nextEl) {
        // Marca janela curta pra ignorar a próxima detecção de scroll manual.
        manualScrollIgnoreUntil.current = Date.now() + 1200;
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentIdx, lang]);

  // Pausa auto-scroll quando usuário rolar manualmente (wheel/touch/keys).
  useEffect(() => {
    if (!isPlaying) return;
    const onManualScroll = () => {
      if (Date.now() < manualScrollIgnoreUntil.current) return;
      setIsPlaying(false);
      track('apresentacao_autoplay_paused', {
        reason: 'manual_scroll',
        atSection: currentIdx,
      });
    };
    window.addEventListener('wheel', onManualScroll, { passive: true });
    window.addEventListener('touchmove', onManualScroll, { passive: true });
    const onKey = (e) => {
      if (
        [' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(
          e.key
        )
      ) {
        onManualScroll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onManualScroll);
      window.removeEventListener('touchmove', onManualScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [isPlaying, currentIdx]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    track(next ? 'apresentacao_autoplay_started' : 'apresentacao_autoplay_paused', {
      reason: 'button',
      atSection: currentIdx,
      lang,
    });
  };

  const switchLang = (next) => {
    if (next === lang) return;
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
    track('apresentacao_lang_switched', { to: next });
  };

  const activeCount = archetypesData.filter((a) => a.status === 'active')
    .length;

  return (
    <div className="bg-paper min-h-screen overflow-x-hidden">
      {/* Top bar minimal */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-paper/85 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Sparkle className="w-5 h-5" />
            <span className="font-hand text-secondary text-base">
              {t.appName}
            </span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Play / pause auto-scroll */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={
                isPlaying
                  ? lang === 'en'
                    ? 'Pause auto-scroll'
                    : 'Pausar auto-scroll'
                  : lang === 'en'
                  ? 'Play tour'
                  : 'Tocar tour'
              }
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isPlaying
                  ? 'bg-primary text-paper'
                  : 'border border-line text-ink hover:bg-line/40'
              }`}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="1" width="3" height="12" rx="1" />
                  <rect x="9" y="1" width="3" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 1.5 L3 12.5 L12 7 Z" />
                </svg>
              )}
            </button>

            {/* Mute / unmute audio (só aparece quando o tour está tocando) */}
            {isPlaying && (
              <button
                type="button"
                onClick={() => {
                  setMuted((m) => {
                    track('apresentacao_audio_toggled', {
                      to: !m ? 'muted' : 'unmuted',
                      audioAvailable,
                    });
                    return !m;
                  });
                }}
                aria-label={
                  muted
                    ? lang === 'en'
                      ? 'Unmute soundtrack'
                      : 'Ativar trilha sonora'
                    : lang === 'en'
                    ? 'Mute soundtrack'
                    : 'Silenciar trilha sonora'
                }
                className="w-9 h-9 rounded-full border border-line text-ink hover:bg-line/40 flex items-center justify-center transition-colors"
              >
                {muted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 6h2l3-2.5v9L5 10H3V6z" />
                    <path
                      d="M11 6l3 3M14 6l-3 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 6h2l3-2.5v9L5 10H3V6z" />
                    <path
                      d="M11 5.5c1 0.7 1 4.3 0 5M12.8 4c1.7 1.4 1.7 6.6 0 8"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Progress dots */}
            <div
              className="hidden sm:flex items-center gap-1.5"
              aria-label={`${currentIdx + 1} / ${TOTAL_SECTIONS}`}
            >
              {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
                <span
                  key={i}
                  className={`block rounded-full transition-all ${
                    i === currentIdx
                      ? 'w-4 h-1.5 bg-primary'
                      : i < currentIdx
                      ? 'w-1.5 h-1.5 bg-primary/40'
                      : 'w-1.5 h-1.5 bg-line'
                  }`}
                />
              ))}
            </div>

            {/* Lang toggle */}
            <div
              role="group"
              aria-label="Idioma / Language"
              className="flex items-center text-sm border border-line rounded-full overflow-hidden"
            >
              <button
                type="button"
                onClick={() => switchLang('pt')}
                aria-pressed={lang === 'pt'}
                className={`px-3 py-1 font-semibold transition-colors ${
                  lang === 'pt'
                    ? 'bg-ink text-paper'
                    : 'text-secondary hover:bg-line/40'
                }`}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => switchLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-3 py-1 font-semibold transition-colors ${
                  lang === 'en'
                    ? 'bg-ink text-paper'
                    : 'text-secondary hover:bg-line/40'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                track('apresentacao_share_clicked', {
                  placement: 'topbar',
                  lang,
                });
                setShareOpen(true);
              }}
              className="hidden sm:inline-block text-primary text-sm font-semibold"
            >
              {t.share} →
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section
        data-tour-section="0"
        className="min-h-screen flex items-center px-6 sm:px-10 py-24 sm:py-32"
      >
        <div className="max-w-6xl mx-auto w-full">
          <p className="font-hand text-secondary text-xl mb-6">
            {t.heroEyebrow}
          </p>
          <h1 className="font-sans font-bold text-5xl sm:text-7xl lg:text-[6.5rem] text-ink leading-[0.95] mb-8">
            {t.heroLine1}
            <br />
            {t.heroLine2}
          </h1>
          <WavyUnderline className="w-64 h-4 mb-8" />
          <p className="text-secondary text-xl sm:text-2xl leading-relaxed max-w-3xl">
            {t.heroBody}
          </p>
        </div>
      </section>

      {/* 1 — A DOR */}
      <Section bgClass="bg-beige" idx={1}>
        <TextBlock
          eyebrow={t.s1Eyebrow}
          titleLines={[
            { text: t.s1Line1, highlight: false },
            { text: t.s1Line2, highlight: true },
          ]}
          body={t.s1Body}
        />
        <VisualBlock>
          <PainQuotes quotes={t.s1Quotes} />
        </VisualBlock>
      </Section>

      {/* 2 — O QUE FALTA */}
      <Section idx={2}>
        <TextBlock
          eyebrow={t.s2Eyebrow}
          titleLines={[
            { text: t.s2Line1, highlight: false },
            { text: t.s2Line2, highlight: true },
          ]}
          body={t.s2Body}
          align="right"
        />
        <VisualBlock align="right">
          <div className="bg-paper border border-line rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <p className="text-secondary text-sm mb-3">{t.s2BeforeLabel}</p>
            <p className="text-ink text-lg mb-6 leading-snug">
              {t.s2BeforeQuote}
            </p>
            <p className="text-secondary text-sm mb-3">{t.s2AfterLabel}</p>
            <p className="text-ink text-lg leading-snug">{t.s2AfterQuote}</p>
          </div>
        </VisualBlock>
      </Section>

      {/* 3 — INSPIRAÇÃO */}
      <Section bgClass="bg-beige" idx={3}>
        <TextBlock
          eyebrow={t.s3Eyebrow}
          titleLines={[
            { text: t.s3Line1, highlight: false },
            { text: t.s3Line2, highlight: true },
          ]}
          body={t.s3Body}
        />
        <VisualBlock>
          <KhanCitationVisual t={t} />
        </VisualBlock>
      </Section>

      {/* 4 — COMO FUNCIONA */}
      <Section idx={4}>
        <TextBlock
          eyebrow={t.s4Eyebrow}
          titleLines={[
            { text: t.s4Line1, highlight: false },
            {
              text: `${activeCount}${t.s4Line2.replace('13', '')}`,
              highlight: false,
            },
            { text: t.s4Line3, highlight: true },
          ]}
          body={t.s4Body}
          align="right"
        />
        <VisualBlock align="right">
          <ProductMocks t={t} />
        </VisualBlock>
      </Section>

      {/* 5 — ESCALABILIDADE */}
      <Section bgClass="bg-beige" idx={5}>
        <TextBlock
          eyebrow={t.s5Eyebrow}
          titleLines={[
            { text: t.s5Line1, highlight: false },
            { text: t.s5Line2, highlight: true },
          ]}
          body={t.s5Body}
        />
        <VisualBlock>
          <ScaleNumbers t={t} />
        </VisualBlock>
      </Section>

      {/* 6 — PESCADORES FUNIL */}
      <Section idx={6}>
        <TextBlock
          eyebrow={t.s6Eyebrow}
          titleLines={[
            { text: t.s6Line1, highlight: false },
            { text: t.s6Line2, highlight: true },
          ]}
          body={t.s6Body}
          align="right"
        />
        <VisualBlock align="right">
          <FunnelVisual t={t} />
        </VisualBlock>
      </Section>

      {/* 7 — VISÃO + CTA */}
      <section
        data-tour-section="7"
        className="bg-ink text-paper min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24"
      >
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <p className="font-hand text-paper/70 text-xl">{t.s7Eyebrow}</p>
            <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              {t.s7TitlePre}{' '}
              <span className="text-highlight">{t.s7TitleHighlight}</span>
            </h2>
            <p className="text-paper/80 text-lg sm:text-xl leading-relaxed">
              {t.s7Body}
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  track('apresentacao_share_clicked', {
                    placement: 'final',
                    lang,
                  });
                  setShareOpen(true);
                }}
                className="bg-highlight text-ink font-bold px-6 py-3 rounded-2xl hover:bg-highlight/90 transition-colors"
              >
                {t.s7CtaPrimary}
              </button>
              <a
                href="https://projetopescadores.com.br/contato"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('apresentacao_pescadores_clicked', {
                    placement: 'final',
                    lang,
                  })
                }
                className="border border-paper/40 text-paper px-6 py-3 rounded-2xl hover:bg-paper/10 transition-colors"
              >
                {t.s7CtaSecondary}
              </a>
            </div>
            <p className="text-paper/50 text-sm pt-4">
              {t.s7Footer}
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
        text={t.shareText}
      />
    </div>
  );
}
