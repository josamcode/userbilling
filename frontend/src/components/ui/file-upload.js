"use client";

import { useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";

export function FileUpload({
  onFile,
  accept = "image/*",
  initialPreview = null,
  label = "اسحب وأفلت الصورة هنا أو اضغط للاختيار",
  hint = "PNG/JPG حتى 5MB",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(initialPreview);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = (f) => {
    if (!f) return;
    onFile?.(f);
    setFileName(f.name);
    if (f.type && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    }
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    onFile?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition p-5 text-center select-none ${
        drag
          ? "border-indigo-400 bg-indigo-50/70"
          : preview
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview ? (
        <div className="flex items-center gap-4 text-right">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="معاينة"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {fileName || "صورة محددة"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              اضغط لتغيير الصورة
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label="إزالة الصورة"
            className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-rose-200 hover:text-rose-600 text-slate-500 flex items-center justify-center transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-12 h-12 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center text-indigo-600">
            <ImageUp size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
      )}
    </div>
  );
}
