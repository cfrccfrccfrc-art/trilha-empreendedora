import { useState } from 'react';
import Button from './Button';
import { HeartCoin } from './Sketches';

function brl(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function DonationSheet({ open, onClose, campaign }) {
  const [picked, setPicked] = useState(null);
  const [copied, setCopied] = useState(false);
  if (!open || !campaign) return null;

  const handleCopyKey = async () => {
    if (!campaign.pix_key) return;
    try {
      await navigator.clipboard.writeText(campaign.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl p-6 shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <HeartCoin className="w-12 h-12 shrink-0" />
            <div>
              <p className="font-hand text-secondary text-base leading-tight">
                Apoiar a Trilha
              </p>
              <h2 className="font-bold text-ink text-lg leading-tight">
                {campaign.title}
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

        <p className="text-secondary text-sm leading-relaxed mb-4">
          {campaign.message}
        </p>

        {Array.isArray(campaign.amounts) && campaign.amounts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-ink mb-2">
              Valor sugerido
            </p>
            <div className="grid grid-cols-3 gap-2">
              {campaign.amounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPicked(value)}
                  className={`min-h-12 rounded-xl border text-base font-semibold transition-colors ${
                    picked === value
                      ? 'border-primary bg-primaryLight text-ink'
                      : 'border-line bg-paper text-ink hover:bg-beige'
                  }`}
                >
                  {brl(value)}
                </button>
              ))}
            </div>
            <p className="text-xs text-secondary mt-2">
              Qualquer valor ajuda. Você decide.
            </p>
          </div>
        )}

        {(campaign.pix_key || campaign.pix_qr_url) && (
          <div className="bg-beige rounded-2xl p-4 mb-4 border border-line">
            <p className="text-sm font-semibold text-ink mb-2">
              Pagar via Pix
            </p>
            {campaign.pix_qr_url && (
              <div className="flex justify-center mb-3">
                <img
                  src={campaign.pix_qr_url}
                  alt="QR code Pix"
                  className="w-44 h-44 rounded-xl border border-line bg-paper"
                />
              </div>
            )}
            {campaign.pix_key && (
              <>
                <p className="text-xs text-secondary mb-1">Chave Pix</p>
                <div className="flex items-center gap-2 bg-paper rounded-xl border border-line px-3 py-2 mb-2">
                  <code className="text-ink text-sm break-all flex-1">
                    {campaign.pix_key}
                  </code>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleCopyKey}
                  className="w-full"
                >
                  {copied ? 'Chave copiada ✓' : 'Copiar chave Pix'}
                </Button>
              </>
            )}
            {picked && (
              <p className="text-xs text-secondary mt-3 leading-relaxed">
                Você escolheu doar <strong>{brl(picked)}</strong>. Use a chave
                acima no seu app de banco e digite esse valor.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-secondary leading-relaxed">
          Doação é voluntária e não dá acesso a conteúdo extra. A Trilha
          continua a mesma pra todo mundo, com ou sem doação.
        </p>

        <Button variant="ghost" onClick={onClose} className="w-full mt-4">
          Fechar
        </Button>
      </div>
    </div>
  );
}
