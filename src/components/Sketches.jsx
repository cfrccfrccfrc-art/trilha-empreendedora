// Inline SVG sketches in a hand-drawn notebook style.
// All shapes use stroke-only line art so they take the parent's text color
// where possible, and rely on the design palette for accents.

export function HeroNotebook({ className = 'w-32 h-32' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 140"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="22"
        y="20"
        width="86"
        height="98"
        rx="6"
        stroke="#4F7CAC"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FFFDF7"
      />
      <line
        x1="22"
        y1="34"
        x2="108"
        y2="34"
        stroke="#4F7CAC"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <line x1="34" y1="50" x2="96" y2="50" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="34" y1="62" x2="86" y2="62" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="34" y1="74" x2="92" y2="74" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="34" y1="86" x2="70" y2="86" stroke="#D9D4CC" strokeWidth="1.5" />
      <path
        d="M 30 105 Q 50 95 70 105 T 110 105"
        stroke="#F7E27C"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="110" cy="105" r="4.5" fill="#F28C8C" />
      <path
        d="M 116 22 L 122 16"
        stroke="#8BC6A2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 119 26 L 127 24"
        stroke="#8BC6A2"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OpenBook({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M4 12 L 24 16 L 24 42 L 4 38 Z"
        stroke="#4F7CAC"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="#FFFDF7"
      />
      <path
        d="M44 12 L 24 16 L 24 42 L 44 38 Z"
        stroke="#4F7CAC"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="#FFFDF7"
      />
      <line x1="10" y1="20" x2="20" y2="22" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="10" y1="26" x2="20" y2="28" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="10" y1="32" x2="18" y2="34" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="28" y1="22" x2="38" y2="20" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="28" y1="28" x2="38" y2="26" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="28" y1="34" x2="36" y2="32" stroke="#D9D4CC" strokeWidth="1.5" />
    </svg>
  );
}

export function Lightbulb({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 6 C 16 6 12 12 12 18 C 12 23 15 26 17 28 L 17 33 L 31 33 L 31 28 C 33 26 36 23 36 18 C 36 12 32 6 24 6 Z"
        fill="#F7E27C"
        stroke="#2B2B2B"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <line x1="19" y1="36" x2="29" y2="36" stroke="#2B2B2B" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="40" x2="28" y2="40" stroke="#2B2B2B" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="22" y1="44" x2="26" y2="44" stroke="#2B2B2B" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="14" x2="3" y2="11" stroke="#F7E27C" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="14" x2="45" y2="11" stroke="#F7E27C" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="22" x2="2" y2="22" stroke="#F7E27C" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="22" x2="46" y2="22" stroke="#F7E27C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ className = 'w-5 h-5', color = '#F7E27C' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 L13.2 9.8 L21 11 L13.2 12.2 L12 22 L10.8 12.2 L3 11 L10.8 9.8 Z"
        fill={color}
        stroke="#2B2B2B"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pin({ className = 'w-6 h-6', color = '#F28C8C' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="6" fill={color} stroke="#2B2B2B" strokeWidth="1.5" />
      <line
        x1="12"
        y1="15"
        x2="12"
        y2="22"
        stroke="#2B2B2B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WavyUnderline({ className = 'w-32 h-3', color = '#F7E27C' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2 6 Q 30 2 60 6 T 120 6 T 198 6"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function BackArrow({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18 L 9 12 L 15 6" />
      <path d="M9 12 L 22 12" strokeDasharray="2 3" />
    </svg>
  );
}

export function HouseIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11 L 12 3 L 21 11" />
      <path d="M5 9 L 5 21 L 19 21 L 19 9" />
      <path d="M10 21 L 10 14 L 14 14 L 14 21" />
    </svg>
  );
}

export function TrailIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="1.5" />
      <circle cx="11" cy="11" r="1.5" />
      <circle cx="16" cy="7" r="1.5" />
      <circle cx="19" cy="16" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <path d="M6 6 Q 8 9 11 11 Q 14 13 16 7" strokeDasharray="2 2" />
      <path d="M11 11 Q 13 15 9 19" strokeDasharray="2 2" />
      <path d="M16 7 Q 19 11 19 16" strokeDasharray="2 2" />
    </svg>
  );
}

export function BookIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5 C 4 4 5 3 6 3 L 12 3 L 12 20 L 6 20 C 5 20 4 19 4 18 Z" />
      <path d="M20 5 C 20 4 19 3 18 3 L 12 3 L 12 20 L 18 20 C 19 20 20 19 20 18 Z" />
      <line x1="7" y1="8" x2="10" y2="8" />
      <line x1="7" y1="12" x2="10" y2="12" />
      <line x1="14" y1="8" x2="17" y2="8" />
      <line x1="14" y1="12" x2="17" y2="12" />
    </svg>
  );
}

export function StoryIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5 L 18 5 C 19 5 20 6 20 7 L 20 15 C 20 16 19 17 18 17 L 11 17 L 7 20 L 7 17 L 6 17 C 5 17 4 16 4 15 Z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  );
}

export function HelpIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21 L 4 13 C 1.5 10.5 1.5 7 4 5 C 6.5 3 9.5 4 12 7 C 14.5 4 17.5 3 20 5 C 22.5 7 22.5 10.5 20 13 Z" />
    </svg>
  );
}

export function ShareIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <line x1="8.5" y1="10.5" x2="15.5" y2="7" />
      <line x1="8.5" y1="13.5" x2="15.5" y2="17" />
    </svg>
  );
}

export function HeartCoin({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#F7E27C" stroke="#2B2B2B" strokeWidth="2" />
      <path
        d="M24 33 L 16 25 C 14 23 14 20 16 18 C 18 16 20 17 24 20 C 28 17 30 16 32 18 C 34 20 34 23 32 25 Z"
        fill="#F28C8C"
        stroke="#2B2B2B"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepOne({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#DCEAF7" stroke="#4F7CAC" strokeWidth="2" />
      <path d="M16 18 L 32 18 M 16 24 L 28 24 M 16 30 L 30 30"
        stroke="#4F7CAC" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="14" r="3" fill="#F7E27C" stroke="#2B2B2B" strokeWidth="1.5" />
    </svg>
  );
}

export function StepTwo({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="10" width="32" height="32" rx="3" fill="#FFFDF7"
        stroke="#4F7CAC" strokeWidth="2" />
      <line x1="14" y1="18" x2="34" y2="18" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="14" y1="24" x2="30" y2="24" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="14" y1="30" x2="32" y2="30" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="14" y1="36" x2="26" y2="36" stroke="#D9D4CC" strokeWidth="1.5" />
      <path d="M14 24 L 16 26 L 19 22" stroke="#8BC6A2" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function StepThree({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="18" cy="22" r="6" fill="#DCEAF7" stroke="#4F7CAC" strokeWidth="2" />
      <circle cx="32" cy="22" r="6" fill="#F6F1E8" stroke="#4F7CAC" strokeWidth="2" />
      <path d="M10 38 C 10 32 14 30 18 30 C 22 30 26 32 26 38"
        stroke="#4F7CAC" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M24 38 C 24 32 28 30 32 30 C 36 30 40 32 40 38"
        stroke="#4F7CAC" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function DocumentStamp({ className = 'w-14 h-14' }) {
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" aria-hidden="true">
      {/* Sheet of paper with folded corner */}
      <path
        d="M 12 8 L 38 8 L 46 16 L 46 48 L 12 48 Z"
        stroke="#4F7CAC"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="#FFFDF7"
      />
      <path
        d="M 38 8 L 38 16 L 46 16"
        stroke="#4F7CAC"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Lines on paper */}
      <line x1="17" y1="22" x2="38" y2="22" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="17" y1="28" x2="40" y2="28" stroke="#D9D4CC" strokeWidth="1.5" />
      <line x1="17" y1="34" x2="36" y2="34" stroke="#D9D4CC" strokeWidth="1.5" />
      {/* Approval stamp */}
      <circle cx="38" cy="42" r="7" fill="#F28C8C" stroke="#2B2B2B" strokeWidth="1.5" />
      <path
        d="M 35 42 L 37.5 44.5 L 41.5 39.5"
        stroke="#FFFDF7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function PathTrail({ className = 'w-full h-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 24"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 4 12 Q 30 4 60 12 T 120 12 T 196 12"
        stroke="#4F7CAC"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="4 5"
      />
      <circle cx="196" cy="12" r="3.5" fill="#F28C8C" />
    </svg>
  );
}
