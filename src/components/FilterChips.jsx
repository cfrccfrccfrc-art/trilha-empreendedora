export default function FilterChips({ label, options, value, onChange }) {
  return (
    <div className="mb-3">
      {label && (
        <p className="text-xs text-secondary mb-1 px-1">{label}</p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value ?? 'all'}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`shrink-0 px-3 min-h-9 rounded-full border text-sm transition-colors ${
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-paper text-ink hover:bg-beige'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
