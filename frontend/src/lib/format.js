export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  try {
    return d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return d.toLocaleTimeString();
  }
}

export function formatDateTime(value) {
  const date = formatDate(value);
  if (date === "—") return "—";
  const time = formatTime(value);
  return time ? `${date} • ${time}` : date;
}

// Convert a Date/ISO into the value format expected by <input type="datetime-local">
// which is "YYYY-MM-DDTHH:mm" in the user's local timezone.
export function toDateTimeLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("ar-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function billDisplayName(bill) {
  if (!bill) return "";
  if (bill.displayName) return bill.displayName;
  if (bill.userId && typeof bill.userId === "object" && bill.userId.name)
    return bill.userId.name;
  return bill.customerNameSnapshot || bill.customerName || "";
}

export function billDescription(bill) {
  if (!bill) return "";
  return bill.description || bill.discription || "";
}

// Legacy state label (paid / pending). Kept for backward compatibility.
export function stateLabel(state) {
  if (state === "paid") return "مدفوع";
  if (state === "pending") return "معلق";
  return state || "";
}

// New payment status label, derived on the server.
export function paymentStatusLabel(status) {
  if (status === "paid") return "مدفوعة بالكامل";
  if (status === "partial") return "مدفوعة جزئيًا";
  if (status === "unpaid") return "غير مدفوعة";
  return status || "—";
}

export const PAYMENT_STATUS_TONE = {
  paid: "success",
  partial: "info",
  unpaid: "warning",
};

export function paymentMethodLabel(method) {
  if (method === "cash") return "نقدًا";
  if (method === "bank_transfer") return "تحويل بنكي";
  if (method === "other") return "أخرى";
  return method || "—";
}

export const PAYMENT_METHODS = [
  { value: "cash", label: "نقدًا" },
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "other", label: "أخرى" },
];
