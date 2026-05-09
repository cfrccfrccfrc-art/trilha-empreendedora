import { useState } from 'react';
import Button from './Button';
import { ShareIcon } from './Sketches';

const DEFAULT_TEXT =
  'Acabei de descobrir a Trilha Empreendedora — gratuita, ajuda quem está começando ou quer dar o próximo passo no negócio. Vale a pena conhecer.';

export default function ShareSheet({ open, onClose, text = DEFAULT_TEXT }) {
  const [copied, setCopied] = useState(null);
  if (!open) return null;

  const url = typeof window !== 'undefined' ? window.location.origin : '';
  const fullText = `${text}\n\n${url}`;

  const handleNative = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: 'Trilha Empreendedora', text, url });
      onClose();
    } catch {
      // user cancelled
    }
  };

  const handleWhatsApp = () => {
    const wa = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(wa, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async (what) => {
    try {
      await navigator.clipboard.writeText(what === 'text' ? fullText : url);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShareIcon className="w-7 h-7 text-primary" />
            <div>
              <p className="font-hand text-secondary text-base leading-tight">
                Conhece alguém que vai gostar?
              </p>
              <h2 className="font-bold text-ink text-lg leading-tight">
                Compartilhar a Trilha
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full text-secondary hover:bg-line/40 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-beige rounded-2xl p-3 text-sm text-secondary leading-relaxed mb-4">
          {text}
        </div>

        <div className="space-y-2">
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button onClick={handleNative} className="w-full">
              Compartilhar
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleWhatsApp}
            className="w-full"
          >
            Mandar no WhatsApp
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleCopy('text')}
            className="w-full"
          >
            {copied === 'text' ? 'Texto copiado ✓' : 'Copiar texto + link'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleCopy('url')}
            className="w-full"
          >
            {copied === 'url' ? 'Link copiado ✓' : 'Copiar só o link'}
          </Button>
        </div>
      </div>
    </div>
  );
}
