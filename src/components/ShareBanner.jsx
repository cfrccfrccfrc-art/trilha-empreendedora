import { useEffect, useState } from 'react';
import ShareSheet from './ShareSheet';
import { ShareIcon } from './Sketches';

const DISMISS_KEY = 'trilha_share_banner_dismissed_at';
const DISMISS_DAYS = 7;

function isDismissed() {
  try {
    const ts = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_DAYS * 86400 * 1000;
  } catch {
    return false;
  }
}

export default function ShareBanner({ tone = 'soft' }) {
  const [hidden, setHidden] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHidden(isDismissed());
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setHidden(true);
  };

  if (hidden) return null;

  const baseClasses =
    tone === 'strong'
      ? 'bg-highlight/40 border-highlight'
      : 'bg-beige border-line';

  return (
    <>
      <div
        className={`relative flex items-start gap-3 rounded-2xl p-4 border ${baseClasses}`}
      >
        <ShareIcon className="w-7 h-7 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-hand text-secondary text-base leading-tight mb-1">
            Conhece alguém começando?
          </p>
          <p className="text-ink text-sm leading-snug mb-3">
            A Trilha é gratuita. Quanto mais gente conhecer, maior a rede de
            apoio.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-primary text-sm font-semibold"
            >
              Compartilhar →
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-secondary text-sm ml-auto"
            >
              Dispensar
            </button>
          </div>
        </div>
      </div>

      <ShareSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
