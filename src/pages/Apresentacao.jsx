// Apresentação institucional bilíngue (PT/EN).
// Rota fora do Layout pra ter controle total da largura (web-only).
// Texto à esquerda, visual à direita, 1 seção por viewport.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import taskTemplatesData from '../data/taskTemplates.json';
import taskCompanionsData from '../data/taskCompanions.json';
import casesData from '../data/cases.json';
import resourcesData from '../data/resources.json';
import opportunitiesData from '../data/opportunities.json';
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

    heroEyebrow: 'O pitch',
    heroLine1: 'Empreender',
    heroLine2: 'no escuro.',
    heroBody:
      '5 minutos de diagnóstico. 30 dias de trilha prática. Próximo passo claro. Sem cadastro, sem mensalidade, sem operador atendendo zap.',

    s1Eyebrow: 'A dor',
    s1Line1: '30 milhões.',
    s1Line2: 'Quase todos no escuro.',
    s1Body:
      'Vendem todo dia. Não sobra. Não sabem por quê. Sebrae tem 800 artigos. BCB tem cartilha. YouTube tem 14 mil vídeos. Falta TRILHA. Falta saber o próximo passo PRA ELES.',
    s1Quotes: [
      'Vendo todo dia, mas no fim do mês não sobra',
      'Tenho uma ideia, mas nunca testei com cliente',
      'Faço tudo sozinha e o dia nunca acaba',
      'Quem vê de perto adora, mas pouca gente chega',
      'Posto bonito todo dia, mas não sei se sobra lucro',
    ],

    s2Eyebrow: 'O que falta',
    s2Line1: 'Catálogo é fácil.',
    s2Line2: 'Mapa é raro.',
    s2Body:
      'Quem empreende não precisa de biblioteca. Precisa do próximo passo. O que converte: diagnóstico + trilha curta + alguém que já passou.',
    s2BeforeLabel: 'Hoje:',
    s2BeforeQuote:
      '"Tem 800 artigos no Sebrae. Por onde eu começo?"',
    s2AfterLabel: 'Com a Trilha:',
    s2AfterQuote:
      '"Você é o perfil X. Sua primeira missão é Y. Em 7 dias volta que tem a próxima."',

    s3Eyebrow: 'A inspiração',
    s3Line1: 'Khan Academy.',
    s3Line2: 'Pra empreender.',
    s3Body:
      'Khan provou que educação prática, gratuita e estruturada escala. Sem call center. Sem mensalidade. A Trilha aplica esse princípio ao microempreendedor brasileiro.',
    khanEyebrow: 'De onde vem',
    khanTitle: 'Khan Academy',
    khanBody:
      'Educação prática, gratuita, no ritmo de quem precisa. Provou que self-service estruturado escala alcance educacional sem perder qualidade.',
    khanFooter:
      'A Trilha é uma adaptação livre desse princípio aplicada ao microempreendedor brasileiro.',

    s4Eyebrow: 'Como funciona',
    s4Line1: '5 minutos.',
    s4Line2: '16 perfis.',
    s4Line3: '30 dias.',
    s4Body:
      '35 perguntas curtas identificam seu perfil. 4 missões práticas, uma por semana. Companheiros reais que viveram a mesma fase. Casos que mostram como joga no Brasil.',
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
    s5Line1: 'Sem operador.',
    s5Line2: 'Sem mensalidade.',
    s5Body:
      'Tudo por código. Ninguém atendendo zap. Sem cadastro pra começar. Conteúdo curado pra alta densidade. Mantida por doação Pix voluntária.',
    scaleMainLabel: 'itens de conteúdo curado, no ar',
    scaleProfilesLabel: 'perfis cobertos',
    scaleCompanionsLabel: 'companheiros',
    scaleOperatorsLabel: 'atendentes',

    s6Eyebrow: 'O pulo do gato',
    s6Line1: 'Trilha educa.',
    s6Line2: 'Pescadores fecha.',
    s6Body:
      'Quando ler conteúdo não basta, a pessoa é encaminhada pro apoio humano direto do Projeto Pescadores — parceiro que atende caso a caso, gratuito. A Trilha qualifica. Pescadores recebe pronto.',
    funnelTopLabel: 'milhares de visitas',
    funnelMidLabel: 'diagnóstico em 5 min',
    funnelMid2Label: 'trilha de 30 dias',
    funnelBottomLabel: 'quem trava pede apoio humano',
    funnelOutLabel: 'Projeto Pescadores',

    s7Eyebrow: 'A visão',
    s7TitlePre: 'Cada trilha terminada é',
    s7TitleHighlight: 'um negócio menos no escuro.',
    s7Body:
      'Conhece quem precisa? Compartilha. Tem parceria possível (Sebrae regional, CRAS, igreja de bairro)? Manda mensagem. A Trilha é gratuita e cresce com quem espalha.',
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
    heroLine1: 'Running a business',
    heroLine2: 'in the dark.',
    heroBody:
      '5-minute diagnostic. 30-day practical journey. Clear next step. No signup, no subscription, no operator on WhatsApp.',

    s1Eyebrow: 'The pain',
    s1Line1: '30 million.',
    s1Line2: 'Almost all in the dark.',
    s1Body:
      "They sell every day. Nothing's left. They don't know why. Sebrae has 800 articles. The Central Bank has manuals. YouTube has 14,000 videos. What's missing is a JOURNEY. Knowing the next step FOR THEM.",
    s1Quotes: [
      "I sell every day, but nothing's left at month-end",
      'I have an idea, but never tested it with a customer',
      'I do everything alone and the day never ends',
      'Those who see it up close love it, but few find their way to me',
      "I post pretty every day, but don't know if I'm making any profit",
    ],

    s2Eyebrow: "What's missing",
    s2Line1: 'A catalog is easy.',
    s2Line2: 'A map is rare.',
    s2Body:
      "Entrepreneurs don't need a library. They need the next step. What converts: diagnostic + short journey + someone who's been there.",
    s2BeforeLabel: 'Today:',
    s2BeforeQuote:
      "\"There are 800 articles on Sebrae. Where do I even start?\"",
    s2AfterLabel: 'With Trilha:',
    s2AfterQuote:
      "\"You're profile X. Your first mission is Y. Come back in 7 days for the next.\"",

    s3Eyebrow: 'The inspiration',
    s3Line1: 'Khan Academy.',
    s3Line2: 'For entrepreneurs.',
    s3Body:
      'Khan proved that practical, free, structured education scales. No call center. No subscription. Trilha applies that principle to the Brazilian micro-entrepreneur.',
    khanEyebrow: 'Where the idea comes from',
    khanTitle: 'Khan Academy',
    khanBody:
      'Practical, free education, at the pace of who needs it. Proved that structured self-service can scale educational reach without sacrificing quality.',
    khanFooter:
      'Trilha is a free-form adaptation of that principle, applied to the Brazilian micro-entrepreneur.',

    s4Eyebrow: 'How it works',
    s4Line1: '5 minutes.',
    s4Line2: '16 profiles.',
    s4Line3: '30 days.',
    s4Body:
      "35 short questions identify your profile. 4 practical missions, one per week. Real companions who've lived the same stage. Cases that show how things play out in Brazil.",
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
    s5Line1: 'No operators.',
    s5Line2: 'No subscription.',
    s5Body:
      'Everything by code. No one on WhatsApp. No signup to begin. Curated content for high density. Sustained by voluntary Pix donations.',
    scaleMainLabel: 'curated content items, live',
    scaleProfilesLabel: 'profiles covered',
    scaleCompanionsLabel: 'companions',
    scaleOperatorsLabel: 'operators',

    s6Eyebrow: 'The twist',
    s6Line1: 'Trilha educates.',
    s6Line2: 'Pescadores closes.',
    s6Body:
      "When reading isn't enough, the person is referred to direct human support from Projeto Pescadores — case-by-case, free of charge. Trilha qualifies. Pescadores receives the case prepared.",
    funnelTopLabel: 'thousands of visits',
    funnelMidLabel: '5-minute diagnostic',
    funnelMid2Label: '30-day journey',
    funnelBottomLabel: 'those stuck ask for human help',
    funnelOutLabel: 'Projeto Pescadores',

    s7Eyebrow: 'The vision',
    s7TitlePre: 'Every completed journey is',
    s7TitleHighlight: 'one less business in the dark.',
    s7Body:
      'Know someone who needs this? Share it. Possible partnership (regional business agency, community center, local church)? Reach out. The app is free and grows with people who spread the word.',
    s7CtaPrimary: 'Share Trilha →',
    s7CtaSecondary: 'Talk to Pescadores',
    s7Footer: 'Trilha Empreendedora · free · non-profit · ',
  },
};

// ---------- Animation helpers ----------

// Reveal: fade-in + slide-up quando o elemento entra em viewport. Roda 1x.
// Honra prefers-reduced-motion (mostra imediato sem animação).
function Reveal({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const id = setTimeout(() => setVisible(true), delay);
          observer.disconnect();
          return () => clearTimeout(id);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// CounterUp: conta 0 → to em duration ms quando entra em viewport, easing
// ease-out cubic. Pra números grandes, formata com separador de milhar pt-BR.
function CounterUp({ to, duration = 1600, className = '', format = (n) => n }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVal(to);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(to * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);
  return (
    <span ref={ref} className={className}>
      {format(val)}
    </span>
  );
}

// ---------- Layout primitive ----------
// Dot pattern sutil pra dar identidade "papel pautado" sem virar ruído.
// SVG inline pra não depender de asset externo.
const DOT_PATTERN_STYLE = {
  backgroundImage:
    'radial-gradient(circle, rgba(43,43,43,0.08) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

function Section({ children, bgClass = 'bg-paper', idx, pattern = true }) {
  return (
    <section
      data-tour-section={idx}
      className={`${bgClass} relative min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24 overflow-hidden`}
    >
      {pattern && (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={DOT_PATTERN_STYLE}
        />
      )}
      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {children}
      </div>
    </section>
  );
}

function TextBlock({ eyebrow, titleLines, body, align = 'left', dark = false }) {
  const subColor = dark ? 'text-paper/60' : 'text-secondary';
  const titleColor = dark ? 'text-paper' : 'text-ink';
  return (
    <div className={`space-y-6 ${align === 'right' ? 'lg:order-2' : ''}`}>
      {eyebrow && (
        <Reveal>
          <p className={`font-hand ${subColor} text-xl sm:text-2xl leading-tight`}>
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={150}>
        <h2
          className={`font-sans font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl ${titleColor} leading-[1.02] tracking-tight`}
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {line.highlight ? (
                <span className={dark ? 'text-highlight' : 'text-primary'}>
                  {line.text}
                </span>
              ) : (
                line.text
              )}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={350}>
          <p className={`${subColor} text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-xl`}>
            {body}
          </p>
        </Reveal>
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
      className={`mx-auto bg-ink rounded-[2.5rem] p-2 shadow-2xl max-w-[280px] ring-1 ring-ink/10 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] transition-shadow duration-300 ${className}`}
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
    <Reveal>
    <div className="relative mx-auto max-w-md">
      <div className="absolute inset-0 -m-8 rounded-full bg-highlight/25 blur-3xl pointer-events-none" />
      <svg viewBox="0 0 400 360" className="relative w-full drop-shadow-2xl">
        <defs>
          {/* Gradient luminoso (paper → highlight) pra contrastar com bg-ink */}
          <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFDF7" />
            <stop offset="1" stopColor="#F7E27C" />
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
        {/* Todos os textos do funil em ink escuro sobre o gradient claro */}
        <text
          x="200"
          y="78"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="22"
          fontWeight="800"
          fill="#2B2A28"
        >
          {t.funnelTopLabel}
        </text>
        <text
          x="200"
          y="135"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="18"
          fontWeight="700"
          fill="#2B2A28"
        >
          {t.funnelMidLabel}
        </text>
        <text
          x="200"
          y="178"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="16"
          fontWeight="700"
          fill="#2B2A28"
        >
          {t.funnelMid2Label}
        </text>
        <text
          x="200"
          y="215"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="14"
          fontWeight="600"
          fill="#2B2A28"
        >
          {t.funnelBottomLabel}
        </text>
        {/* Seta entre funil e Pescadores: amarelo highlight pra brilhar no fundo dark */}
        <path
          d="M 200 240 L 200 290"
          stroke="#F7E27C"
          strokeWidth="3.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="200,302 193,290 207,290" fill="#F7E27C" />
        {/* Retângulo final do Pescadores com fundo bem escuro e texto claro */}
        <rect
          x="80"
          y="305"
          width="240"
          height="55"
          rx="12"
          fill="#0B1F3A"
          stroke="#F7E27C"
          strokeWidth="1.5"
        />
        <circle
          cx="115"
          cy="333"
          r="19"
          fill="#FFFDF7"
          stroke="#F7E27C"
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
          fontSize="17"
          fontWeight="800"
          fill="#FFFDF7"
        >
          {t.funnelOutLabel}
        </text>
      </svg>
    </div>
    </Reveal>
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
        <Reveal key={q} delay={i * 180}>
          <div
            className="bg-paper border border-line rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow"
            style={{
              transform: `rotate(${i % 2 === 0 ? -1.2 : 1.2}deg) translateX(${
                i * 6
              }px)`,
            }}
          >
            <p className="text-ink text-lg sm:text-xl leading-snug">
              <span className="font-hand text-secondary mr-2">"</span>
              {q}
              <span className="font-hand text-secondary ml-1">"</span>
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function KhanCitationVisual({ t }) {
  return (
    <Reveal>
      <div className="relative bg-paper border border-line rounded-3xl p-8 max-w-md mx-auto shadow-xl ring-1 ring-ink/5">
        <div className="absolute -top-3 -left-3 w-16 h-16 rounded-full bg-highlight/40 blur-2xl pointer-events-none" />
        <div className="relative flex items-start gap-4 mb-4">
          <Lightbulb className="w-12 h-12 shrink-0" />
          <p className="font-hand text-secondary text-lg leading-tight">
            {t.khanEyebrow}
          </p>
        </div>
        <p className="font-sans font-bold text-3xl text-ink leading-snug mb-3 tracking-tight">
          {t.khanTitle}
        </p>
        <p className="text-secondary text-base leading-relaxed">{t.khanBody}</p>
        <div className="border-t border-line pt-3 mt-4">
          <p className="text-xs text-secondary italic leading-snug">
            {t.khanFooter}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function ProductMocks({ t }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Reveal delay={0}>
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
      </Reveal>

      <Reveal delay={200}>
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
      </Reveal>

      <Reveal delay={400}>
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
      </Reveal>
    </div>
  );
}

function ScaleNumbers({ t }) {
  // Contagens dinâmicas: a partir dos dados curados, pra nunca defasar quando
  // adicionamos arquétipo/tarefa/case/etc. "Itens no ar" = soma dos 6 acervos.
  const activeProfiles = archetypesData.filter((a) => a.status === 'active').length;
  const activeCompanions = taskCompanionsData.length;
  const curatedItems =
    taskTemplatesData.filter((x) => x.active !== false).length +
    activeCompanions +
    activeProfiles +
    casesData.filter((x) => x.status === 'active').length +
    resourcesData.filter((x) => x.status !== 'draft').length +
    opportunitiesData.filter((x) => x.status === 'active').length;
  return (
    <div className="space-y-10 max-w-md mx-auto text-center">
      <div>
        <Reveal>
          <p className="font-sans font-bold text-[9rem] sm:text-[11rem] lg:text-[13rem] text-primary leading-none tracking-tight">
            <CounterUp to={curatedItems} duration={2200} />
          </p>
        </Reveal>
        <Reveal delay={250}>
          <p className="text-secondary text-lg sm:text-xl mt-3">{t.scaleMainLabel}</p>
        </Reveal>
      </div>
      <Reveal delay={500}>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div>
            <p className="font-sans font-bold text-4xl sm:text-5xl text-ink">
              <CounterUp to={activeProfiles} duration={1500} />
            </p>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              {t.scaleProfilesLabel}
            </p>
          </div>
          <div>
            <p className="font-sans font-bold text-4xl sm:text-5xl text-ink">
              <CounterUp to={activeCompanions} duration={1700} />
            </p>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              {t.scaleCompanionsLabel}
            </p>
          </div>
          <div>
            <p className="font-sans font-bold text-4xl sm:text-5xl text-ink">
              <CounterUp to={0} duration={800} />
            </p>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              {t.scaleOperatorsLabel}
            </p>
          </div>
        </div>
      </Reveal>
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
        className="relative min-h-screen flex items-center px-6 sm:px-10 py-24 sm:py-32 overflow-hidden"
      >
        {/* Blobs decorativos no fundo */}
        <div className="absolute -top-20 -left-32 w-[28rem] h-[28rem] rounded-full bg-highlight/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-32 w-[32rem] h-[32rem] rounded-full bg-primaryLight/60 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full">
          <Reveal>
            <p className="font-hand text-secondary text-xl sm:text-2xl mb-6">
              {t.heroEyebrow}
            </p>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="font-sans font-bold text-6xl sm:text-8xl lg:text-[9rem] xl:text-[11rem] text-ink leading-[0.92] mb-6 tracking-tight">
              {t.heroLine1}
              <br />
              <span className="text-primary">{t.heroLine2}</span>
            </h1>
          </Reveal>
          <Reveal delay={400}>
            <WavyUnderline className="w-64 sm:w-80 h-4 mb-8" />
          </Reveal>
          <Reveal delay={550}>
            <p className="text-secondary text-xl sm:text-2xl lg:text-3xl leading-relaxed max-w-3xl">
              {t.heroBody}
            </p>
          </Reveal>
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
              // Substitui qualquer dígito inicial pelo activeCount dinâmico,
              // garantindo coerência se o número de arquétipos mudar.
              text: t.s4Line2.replace(/^\d+/, String(activeCount)),
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
      <section
        data-tour-section={6}
        className="relative bg-ink text-paper min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24 overflow-hidden"
      >
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/30 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <TextBlock
            eyebrow={t.s6Eyebrow}
            titleLines={[
              { text: t.s6Line1, highlight: false },
              { text: t.s6Line2, highlight: true },
            ]}
            body={t.s6Body}
            align="right"
            dark
          />
          <VisualBlock align="right">
            <FunnelVisual t={t} />
          </VisualBlock>
        </div>
      </section>

      {/* 7 — VISÃO + CTA */}
      <section
        data-tour-section="7"
        className="relative bg-ink text-paper min-h-screen flex items-center px-6 sm:px-10 py-20 sm:py-24 overflow-hidden"
      >
        {/* Blobs decorativos sutis no fundo escuro */}
        <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-highlight/15 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-primary/25 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <Reveal>
              <p className="font-hand text-paper/70 text-xl sm:text-2xl">{t.s7Eyebrow}</p>
            </Reveal>
            <Reveal delay={150}>
              <h2 className="font-sans font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.02] tracking-tight">
                {t.s7TitlePre}{' '}
                <span className="text-highlight">{t.s7TitleHighlight}</span>
              </h2>
            </Reveal>
            <Reveal delay={350}>
              <p className="text-paper/80 text-lg sm:text-xl lg:text-2xl leading-relaxed">
                {t.s7Body}
              </p>
            </Reveal>
            <Reveal delay={500}>
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
                  className="bg-highlight text-ink font-bold text-lg px-8 py-4 rounded-2xl hover:bg-highlight/90 hover:-translate-y-0.5 shadow-lg hover:shadow-xl transition-all"
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
                  className="border border-paper/40 text-paper text-lg px-8 py-4 rounded-2xl hover:bg-paper/10 transition-colors"
                >
                  {t.s7CtaSecondary}
                </a>
              </div>
            </Reveal>
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
