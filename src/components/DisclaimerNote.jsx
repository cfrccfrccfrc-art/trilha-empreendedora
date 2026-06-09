import { Lightbulb } from './Sketches';

// Disclaimer leve. A Trilha dá orientação geral baseada em situações comuns.
// Não substitui consultoria de quem conhece o caso específico do empreendedor.
//
// Onde usar:
// - Results (depois do diagnóstico)
// - TaskDetail (na hora de fazer a tarefa)
// - MyPlan (rodapé da trilha)
// - Mini-trilhas (depois do resultado)
export default function DisclaimerNote({
  variant = 'default',
  className = '',
}) {
  if (variant === 'compact') {
    return (
      <p
        className={`text-xs text-secondary leading-relaxed text-center px-3 ${className}`}
      >
        Orientação geral. Em dúvida importante, busca outras fontes ou pede
        apoio do{' '}
        <a
          href="https://projetopescadores.com.br/contato"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline"
        >
          Projeto Pescadores
        </a>
        .
      </p>
    );
  }

  return (
    <div
      className={`flex gap-3 items-start bg-beige/60 border border-line rounded-2xl p-4 ${className}`}
    >
      <Lightbulb className="w-8 h-8 shrink-0" />
      <div>
        <p className="text-xs font-bold text-ink leading-tight mb-1">
          Sobre os conselhos da Trilha
        </p>
        <p className="text-xs text-secondary leading-relaxed">
          A Trilha dá orientação geral baseada em situações comuns de
          microempreendedores. Não substitui consultoria de quem conhece o
          seu caso específico, e pode errar mesmo com a melhor intenção.
          Em dúvida importante, busca outras fontes confiáveis ou pede
          apoio humano do{' '}
          <a
            href="https://projetopescadores.com.br/contato"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            Projeto Pescadores
          </a>{' '}
          (gratuito, parceiro).
        </p>
      </div>
    </div>
  );
}
