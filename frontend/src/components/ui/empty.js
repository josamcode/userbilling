import { Inbox, AlertTriangle } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title = "لا توجد بيانات بعد",
  description,
  action,
}) {
  return (
    <div className="surface p-10 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-indigo-500">
        <Icon size={24} />
      </div>
      <p className="mt-4 text-base font-bold text-slate-800">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-slate-500 max-w-sm leading-6">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "حدث خطأ أثناء تحميل البيانات",
  message,
  onRetry,
}) {
  return (
    <div className="surface p-8 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center text-rose-500">
        <AlertTriangle size={24} />
      </div>
      <p className="mt-4 text-base font-bold text-slate-800">{title}</p>
      {message ? (
        <p className="mt-1 text-sm text-rose-600 max-w-sm">{message}</p>
      ) : null}
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center justify-center h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
        >
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}

export function Loading({ label = "جاري التحميل..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500">
      <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin ml-2" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
