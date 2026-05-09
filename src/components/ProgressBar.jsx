export default function ProgressBar({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={`w-full h-2 bg-line rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary rounded-full transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
