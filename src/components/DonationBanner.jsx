import { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabaseClient';
import DonationSheet from './DonationSheet';
import { HeartCoin } from './Sketches';

const DISMISS_PREFIX = 'trilha_donation_dismissed_';
const DISMISS_DAYS = 14;

function isDismissed(campaignId) {
  try {
    const raw = localStorage.getItem(DISMISS_PREFIX + campaignId);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < DISMISS_DAYS * 86400 * 1000;
  } catch {
    return false;
  }
}

// `placement` matches the campaign's placements array (e.g., 'my_plan',
// 'learning_response', 'results', 'home').
export default function DonationBanner({ placement }) {
  const [campaign, setCampaign] = useState(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = getSupabase();
        const { data, error } = await client
          .from('donation_campaigns')
          .select('*')
          .eq('enabled', true)
          .order('created_at', { ascending: false })
          .limit(1);
        if (error) {
          // Quietly ignore — banner just doesn't show.
          return;
        }
        const c = data?.[0];
        if (!c) return;
        if (!Array.isArray(c.placements) || !c.placements.includes(placement))
          return;
        if (isDismissed(c.id)) {
          setDismissed(true);
          return;
        }
        if (!cancelled) setCampaign(c);
      } catch {
        // Network or table missing — silently skip.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!campaign || dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(
        DISMISS_PREFIX + campaign.id,
        String(Date.now())
      );
    } catch {}
    setDismissed(true);
  };

  return (
    <>
      <div className="relative flex items-start gap-3 rounded-2xl p-4 border border-highlight bg-highlight/30">
        <HeartCoin className="w-12 h-12 shrink-0" />
        <div className="flex-1">
          <p className="font-hand text-secondary text-base leading-tight mb-1">
            Apoie a Trilha
          </p>
          <p className="text-ink text-sm leading-snug mb-1 font-semibold">
            {campaign.title}
          </p>
          <p className="text-secondary text-sm leading-snug mb-3">
            {campaign.message}
          </p>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-primary text-sm font-semibold"
            >
              Doar →
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-secondary text-sm ml-auto"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>

      <DonationSheet
        open={open}
        onClose={() => setOpen(false)}
        campaign={campaign}
      />
    </>
  );
}
