const VARIANTS = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.55)] focus-visible:ring-indigo-300",
  secondary:
    "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-200",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200",
  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-200",
  danger:
    "bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-200",
  soft: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-200",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-9 w-9 p-0",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  startIcon,
  endIcon,
  ...props
}) {
  return (
    <button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      className={`btn-base ${SIZES[size] || SIZES.md} ${
        VARIANTS[variant] || VARIANTS.primary
      } focus:outline-none focus-visible:ring-4 active:scale-[0.98] ${className}`}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : startIcon ? (
        <span className="shrink-0">{startIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && endIcon ? <span className="shrink-0">{endIcon}</span> : null}
    </button>
  );
}
