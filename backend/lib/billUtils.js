// Computes derived totals/status for a bill in a backward-compatible way.
//
// Compatibility rules:
//  - If the bill has payments, paidAmount = sum(payments.amount).
//  - If the bill has NO payments but the legacy `state` field is "paid",
//    treat it as fully paid (paidAmount = billPrice).
//  - Otherwise the bill is unpaid.
//
// paymentStatus:
//   "paid"    when paidAmount >= billPrice (and billPrice > 0)
//   "partial" when 0 < paidAmount < billPrice
//   "unpaid"  when paidAmount <= 0
function computePayments(bill) {
  const total = Number(bill && bill.billPrice) || 0;
  const payments = Array.isArray(bill && bill.payments) ? bill.payments : [];
  let paid = payments.reduce((s, p) => s + (Number(p && p.amount) || 0), 0);
  if (payments.length === 0 && bill && bill.state === "paid") {
    paid = total;
  }
  // round to 2 decimals to avoid float noise
  paid = Math.round(paid * 100) / 100;
  const remaining = Math.max(total - paid, 0);
  let status = "unpaid";
  if (total > 0 && paid >= total) status = "paid";
  else if (paid > 0) status = "partial";
  return {
    totalAmount: total,
    paidAmount: paid,
    remainingAmount: Math.round(remaining * 100) / 100,
    paymentStatus: status,
  };
}

function normalizeBill(bill) {
  if (!bill) return bill;
  const obj = typeof bill.toObject === "function" ? bill.toObject() : bill;
  const populatedName = obj.userId && obj.userId.name;
  obj.displayName =
    populatedName || obj.customerNameSnapshot || obj.customerName || "";
  obj.description =
    obj.description !== undefined && obj.description !== ""
      ? obj.description
      : obj.discription || "";
  const computed = computePayments(obj);
  obj.totalAmount = computed.totalAmount;
  obj.paidAmount = computed.paidAmount;
  obj.remainingAmount = computed.remainingAmount;
  obj.paymentStatus = computed.paymentStatus;
  return obj;
}

module.exports = { computePayments, normalizeBill };
