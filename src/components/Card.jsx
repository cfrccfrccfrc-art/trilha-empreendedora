const TONE_CLASSES = {
  default: 'bg-paper border-line',
  soft: 'bg-beige/60 border-line',
  primary: 'bg-primaryLight/30 border-primary/30',
  highlight: 'bg-highlight/15 border-highlight/50',
  coral: 'bg-coral/5 border-coral/40',
  green: 'bg-green/10 border-green/40',
  ink: 'bg-ink text-paper border-ink',
};

export default function Card({
  className = '',
  tone = 'default',
  interactive = false,
  children,
  ...rest
}) {
  const toneCls = TONE_CLASSES[tone] || TONE_CLASSES.default;
  const interactiveCls = interactive
    ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
    : 'transition-shadow';
  return (
    <div
      className={`border rounded-2xl shadow-sm p-5 ${toneCls} ${interactiveCls} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
