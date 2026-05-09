export default function PageHeader({ title, subtitle, accent }) {
  return (
    <header className="mb-6">
      {accent && (
        <p className="font-hand text-secondary text-lg leading-tight mb-1">
          {accent}
        </p>
      )}
      <h1 className="font-sans font-bold text-2xl text-ink leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-secondary text-sm mt-1 leading-snug">{subtitle}</p>
      )}
    </header>
  );
}
