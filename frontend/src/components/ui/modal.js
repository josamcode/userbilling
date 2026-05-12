"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 fade-in">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizes[size] || sizes.md} surface-lifted pop-in overflow-hidden`}
      >
        {(title || description) && (
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {title ? (
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p className="text-sm text-slate-500 mt-0.5">{description}</p>
              ) : null}
            </div>
            <button
              aria-label="إغلاق"
              className="text-slate-400 hover:text-slate-700 transition p-1 rounded-md hover:bg-slate-100"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto thin-scroll">
          {children}
        </div>
        {footer ? (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
