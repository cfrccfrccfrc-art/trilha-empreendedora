const VARIANTS = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/95 disabled:bg-primary/50',
  secondary:
    'border border-primary text-primary bg-transparent hover:bg-primaryLight active:bg-primaryLight/80 disabled:text-primary/50 disabled:border-primary/50',
  ghost:
    'text-primary bg-transparent hover:bg-primaryLight/60 active:bg-primaryLight disabled:text-primary/40',
};

export default function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl font-sans font-semibold text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
