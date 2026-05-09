export default function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`bg-paper border border-line rounded-2xl shadow-sm p-5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
