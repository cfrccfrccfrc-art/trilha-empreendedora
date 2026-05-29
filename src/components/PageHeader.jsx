export default function PageHeader({ title, subtitle, accent }) {
  return (
    <header className="mb-6 md:mb-8">
      {accent && (
        <p className="font-hand text-secondary text-xl md:text-2xl leading-tight mb-1">
          {accent}
        </p>
      )}
      <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink leading-[1.1] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-secondary text-base md:text-lg mt-2 leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
}
