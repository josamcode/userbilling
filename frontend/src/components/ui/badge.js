const TONES = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  danger: "bg-rose-50 text-rose-700 ring-rose-100",
  info: "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

export function Badge({ tone = "neutral", children, className = "", icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset tabular ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}

export function Dot({ tone = "neutral", className = "" }) {
  const map = {
    neutral: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-indigo-500",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${map[tone]} ${className}`}
    />
  );
}
