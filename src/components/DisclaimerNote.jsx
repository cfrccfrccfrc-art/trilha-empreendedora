import { Lightbulb, DocumentStamp } from './Sketches';

// Disclaimer leve. A Trilha dá orientação geral baseada em situações comuns.
// Não substitui consultoria de quem conhece o caso específico do empreendedor.
//
// Onde usar:
// - Results (depois do diagnóstico)
// - TaskDetail (na hora de fazer a tarefa)
// - MyPlan (rodapé da trilha)
// - Mini-trilhas (depois do resultado)
//
// variant='legal' é específico pra conteúdo com risco jurídico/tributário
// (reter bem de cliente, cobrança, contrato, formalização). Deixa claro que
// não é parecer e aponta pra apoio gratuito.
export default function DisclaimerNote({
  variant = 'default',
  className = '',
}) {
  if (variant === 'legal') {
    return (
      <div
        className={`flex gap-3 items-start bg-coral/10 border border-coral rounded-2xl p-4 ${className}`}
      >
        <DocumentStamp className="w-8 h-8 shrink-0" />
        <div>
          <p className="text-xs font-bold text-ink leading-tight mb-1">
            Isso aqui não é parecer jurídico
          </p>
          <p className="text-xs text-secondary leading-relaxed">
            A Trilha explica o caminho geral, mas regra de cobrança, contrato e
            o que você pode ou não fazer com bem de cliente dependem do seu caso
            e da lei vigente. Antes de agir numa situação que envolve dinheiro
            de terceiro, bem retido ou contrato, confirme com quem é da área.
            Você pode procurar a Defensoria Pública, o balcão gratuito da OAB,
            o Procon ou o atendimento do Sebrae - todos sem custo.
          </p>
        </div>
      </div>
    );
  }

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
