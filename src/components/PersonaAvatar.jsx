// Avatar redondo com iniciais em Patrick Hand. Cor consistente por nome
// (hash determinístico), pra Marlene ser sempre azul, Vinícius sempre roxo
// etc. Usado nas histórias dos companheiros pra dar identidade visual.

const COLORS = [
  { bg: '#4F7CAC', text: '#FFFDF7' }, // primary
  { bg: '#F28C8C', text: '#FFFDF7' }, // coral
  { bg: '#8BC6A2', text: '#2B2B2B' }, // green
  { bg: '#B7A7E6', text: '#2B2B2B' }, // lavender
  { bg: '#F7E27C', text: '#2B2B2B' }, // highlight
  { bg: '#2B2B2B', text: '#F7E27C' }, // ink + yellow text
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return '?';
  const cleaned = name
    .replace(/^Dona\s+/i, '')
    .replace(/^Seu\s+/i, '')
    .replace(/^Sr\.?\s+/i, '')
    .replace(/^Sra\.?\s+/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PersonaAvatar({ name, size = 64, className = '' }) {
  const initials = getInitials(name || '');
  const colorIdx = hashString(name || '') % COLORS.length;
  const color = COLORS[colorIdx];

  return (
    <div
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center rounded-full shadow-md ring-2 ring-paper font-hand shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.text,
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  );
}
