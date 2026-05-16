// PescadoresHandoff
// ----------------------------------------------------------------------------
// Convite opcional ao apoio humano do Projeto Pescadores (parceiro).
// Aparece em momentos específicos da jornada (onboarding, resultado, tarefa
// travada, fim de 30 dias, página de pedir ajuda). Nunca obrigatório,
// sempre com mensagem clara de que é gratuito e externo à Trilha.
// ----------------------------------------------------------------------------

const PESCADORES_URL = 'https://projetopescadores.com.br/contato';

const VARIANTS = {
  soft: {
    eyebrow: 'Apoio humano (parceiro)',
    title: 'Quando ler não é o suficiente',
    body: 'O Projeto Pescadores é parceiro da Trilha e atende casos por contato direto. Quando você quiser apoio humano pra olhar a sua situação, é por lá. Gratuito.',
    cta: 'Falar com o time do Pescadores →',
  },
  onboarding: {
    eyebrow: 'Onde a Trilha termina',
    title: 'Pra quando ler conteúdo não basta',
    body: 'A Trilha entrega diagnóstico, conteúdo e missões. Mas em algum momento você pode precisar de gente que olhe seu caso específico — pra destravar uma decisão, escolher um caminho, ou ouvir alguém que já passou por isso. O Projeto Pescadores é parceiro e atende casos individualmente, gratuito.',
    cta: 'Conhecer o Projeto Pescadores →',
  },
  stuck: {
    eyebrow: 'Travou de verdade?',
    title: 'Pedir ajuda humana é parte do jogo',
    body: 'Quando a tarefa não destrava com leitura nem com o caso parecido, alguém do time do Pescadores pode olhar a sua situação direto. Gratuito.',
    cta: 'Falar com o time do Pescadores →',
  },
  celebrate: {
    eyebrow: 'Terminou os 30 dias',
    title: 'Quer aprofundar com apoio humano agora?',
    body: 'A Trilha te levou até aqui. Pra próximos passos mais específicos do seu caso, o time do Projeto Pescadores recebe pedidos de apoio individual. Gratuito.',
    cta: 'Falar com o time do Pescadores →',
  },
  helprequest: {
    eyebrow: 'Outra opção de apoio',
    title: 'Falar direto com o Projeto Pescadores',
    body: 'Além da rede de voluntários da Trilha, você pode contar com o time do Projeto Pescadores, que é parceiro e atende casos de pequenos negócios diretamente. Gratuito.',
    cta: 'Abrir contato do Pescadores →',
  },
};

export default function PescadoresHandoff({ variant = 'soft' }) {
  const v = VARIANTS[variant] || VARIANTS.soft;
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="flex gap-3 items-start">
        <img
          src="/pescadores-logo.svg"
          alt="Projeto Pescadores"
          width="48"
          height="48"
          className="shrink-0 rounded-xl"
        />
        <div className="flex-1 min-w-0">
          <p className="font-hand text-secondary text-base leading-tight mb-1">
            {v.eyebrow}
          </p>
          <h3 className="font-bold text-ink leading-snug mb-2">{v.title}</h3>
          <p className="text-secondary text-sm leading-relaxed mb-3">
            {v.body}
          </p>
          <a
            href={PESCADORES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm font-semibold inline-block"
          >
            {v.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
