const TONES = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-100",
  },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    ring: "ring-slate-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    ring: "ring-amber-100",
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "indigo",
  trail,
}) {
  const t = TONES[tone] || TONES.indigo;
  return (
    <div className="surface p-5 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular leading-none">
            {value ?? "—"}
          </p>
          {hint ? (
            <p className="mt-2 text-xs text-slate-500">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={`shrink-0 w-11 h-11 rounded-2xl ring-1 ring-inset flex items-center justify-center ${t.bg} ${t.text} ${t.ring}`}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        ) : null}
      </div>
      {trail ? <div className="mt-4">{trail}</div> : null}
    </div>
  );
}
