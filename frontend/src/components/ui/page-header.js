export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-[0.18em] text-indigo-600 uppercase mb-1">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[26px] md:text-[30px] font-extrabold text-slate-900 leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-slate-500 mt-1 leading-6">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
