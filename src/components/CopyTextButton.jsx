import { useState } from 'react';

// Botão que copia texto pro clipboard com feedback visual.
// Uso típico: ao lado de cases ou tarefas, pra consultor copiar conteúdo
// formatado em Markdown e colar em Slack, Notion, Word, etc.
export default function CopyTextButton({
  text,
  label = 'Copiar texto',
  variant = 'outline',
  className = '',
}) {
  const [state, setState] = useState('idle');

  const handleCopy = async () => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setState('copied');
      setTimeout(() => setState('idle'), 2500);
    } catch (e) {
      console.error('CopyTextButton failed:', e);
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  let display = label;
  if (state === 'copied') display = 'Copiado!';
  if (state === 'error') display = 'Não foi possível copiar';

  const base =
    'inline-flex items-center justify-center min-h-10 px-4 rounded-xl text-sm font-semibold transition-colors';
  const styles = {
    outline:
      state === 'copied'
        ? 'border border-green text-green bg-green/5'
        : state === 'error'
        ? 'border border-coral text-coral bg-coral/5'
        : 'border border-primary text-primary hover:bg-primaryLight/30',
    solid:
      state === 'copied'
        ? 'bg-green text-paper'
        : state === 'error'
        ? 'bg-coral text-paper'
        : 'bg-primary text-paper hover:bg-primary/90',
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${base} ${styles[variant] || styles.outline} ${className}`}
    >
      {display}
    </button>
  );
}
