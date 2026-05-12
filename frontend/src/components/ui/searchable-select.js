"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "اختر...",
  searchPlaceholder = "ابحث...",
  emptyMessage = "لا توجد نتائج",
  disabled = false,
  error = false,
  clearable = false,
  searchable = true,
  size = "md",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!searchable || !q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter((o) =>
      [o.label, o.sublabel, o.searchText]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [options, q, searchable]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // When opened: reset and focus
  useEffect(() => {
    if (open) {
      setQ("");
      setHighlight(
        Math.max(
          options.findIndex((o) => o.value === value),
          0
        )
      );
      const t = setTimeout(() => {
        if (searchable) inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(t);
    }
  }, [open, value, options, searchable]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${highlight}"]`);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlight, open]);

  const close = () => setOpen(false);

  const choose = (opt) => {
    onChange?.(opt.value);
    close();
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) choose(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  const sizeCls =
    size === "sm"
      ? "min-h-9 py-1.5 text-xs"
      : size === "lg"
      ? "min-h-12 py-3 text-base"
      : "min-h-10 py-2 text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full bg-white rounded-[10px] border ${
          error
            ? "border-rose-300"
            : open
            ? "border-indigo-500 shadow-[0_0_0_3px_var(--ring)]"
            : "border-[color:var(--border-strong)] hover:border-slate-300"
        } px-3 ${sizeCls} flex items-center justify-between gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-right`}
      >
        <span
          className={`min-w-0 truncate ${
            selected ? "text-slate-800" : "text-slate-400"
          }`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {clearable && selected && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="مسح"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.("");
              }}
              className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded"
            >
              <X size={14} />
            </span>
          ) : null}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        <div
          className="absolute z-50 inset-inline-start-0 inset-inline-end-0 mt-1.5 pop-in"
          style={{ left: 0, right: 0 }}
        >
          <div className="surface-lifted overflow-hidden bg-white">
            {searchable ? (
              <div className="p-2 border-b border-slate-100">
                <div className="field-icon-wrap">
                  <Search size={14} className="field-icon" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setHighlight(0);
                    }}
                    onKeyDown={onKey}
                    placeholder={searchPlaceholder}
                    className="field-base text-sm"
                  />
                </div>
              </div>
            ) : null}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-64 overflow-y-auto thin-scroll p-1"
              onKeyDown={onKey}
              tabIndex={-1}
            >
              {filtered.length === 0 ? (
                <li className="text-center text-sm text-slate-500 py-6 px-3">
                  {emptyMessage}
                </li>
              ) : (
                filtered.map((opt, i) => {
                  const isSel = opt.value === value;
                  const isHl = i === highlight;
                  return (
                    <li key={opt.value} data-idx={i}>
                      <button
                        type="button"
                        onClick={() => choose(opt)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`w-full text-right px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition ${
                          isHl ? "bg-indigo-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {opt.icon ? (
                            <span className="shrink-0">{opt.icon}</span>
                          ) : null}
                          <div className="min-w-0 text-right">
                            <p
                              className={`text-sm truncate ${
                                isSel
                                  ? "text-indigo-700 font-bold"
                                  : "text-slate-800 font-semibold"
                              }`}
                            >
                              {opt.label}
                            </p>
                            {opt.sublabel ? (
                              <p className="text-[11px] text-slate-500 truncate">
                                {opt.sublabel}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {isSel ? (
                          <Check
                            size={14}
                            className="text-indigo-600 shrink-0"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
