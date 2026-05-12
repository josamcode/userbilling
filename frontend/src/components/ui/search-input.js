import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "ابحث...",
  className = "",
}) {
  return (
    <div className={`field-icon-wrap relative ${className}`}>
      <Search size={16} className="field-icon" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="field-base"
      />
      {value ? (
        <button
          type="button"
          aria-label="مسح البحث"
          onClick={() => (onClear ? onClear() : onChange?.(""))}
          className="absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
          style={{ insetInlineEnd: "0.625rem" }}
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
