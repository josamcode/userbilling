export function Card({ children, onClick, className = "", as: As = "div" }) {
  return (
    <As
      onClick={onClick}
      className={`surface ${
        onClick ? "cursor-pointer hover:shadow-[0_10px_24px_-10px_rgba(15,23,42,0.12)] transition" : ""
      } ${className}`}
    >
      {children}
    </As>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div
      className={`flex items-center justify-between px-5 pt-5 ${className}`}
    >
      <div className="min-w-0">
        {title ? (
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
        ) : null}
        {subtitle ? (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
