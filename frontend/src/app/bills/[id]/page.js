"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Printer,
  Pencil,
  Trash2,
  Wallet,
  ArrowDownToLine,
  Receipt,
  CalendarDays,
  PhoneCall,
  StickyNote,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  paymentStatusLabel,
  PAYMENT_STATUS_TONE,
  paymentMethodLabel,
  PAYMENT_METHODS,
  toDateTimeLocalInput,
  billDisplayName,
  billDescription,
} from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ErrorState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

function StatTile({ label, value, tone = "slate" }) {
  const tones = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    indigo: "text-indigo-700",
  };
  return (
    <div className="surface p-3">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tabular ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}

export default function BillDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [bill, setBill] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    userId: "",
    customerName: "",
    amount: "",
    billPrice: "",
    billDate: "",
    dateOfCall: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [payment, setPayment] = useState({
    amount: "",
    paidAt: "",
    method: "cash",
    note: "",
  });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/bills/${id}`);
      setBill(data);
    } catch (err) {
      setError(err.message || "تعذر تحميل الفاتورة");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    document.title = "تفاصيل الفاتورة";
    load();
  }, [load]);

  // Lazy-load users only when edit modal opens.
  useEffect(() => {
    if (!editing || users.length > 0) return;
    api
      .get("/api/users")
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [editing, users.length]);

  const openEdit = () => {
    if (!bill) return;
    setEditForm({
      userId: (bill.userId && (bill.userId._id || bill.userId)) || "",
      customerName: billDisplayName(bill) || "",
      amount: bill.amount ?? "",
      billPrice: bill.totalAmount ?? bill.billPrice ?? "",
      billDate: toDateTimeLocalInput(bill.billDate),
      dateOfCall: toDateTimeLocalInput(bill.dateOfCall),
      description: billDescription(bill) || "",
    });
    setEditing(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const payload = {
        amount: Number(editForm.amount),
        billPrice: Number(editForm.billPrice),
        description: editForm.description,
      };
      if (editForm.billDate) payload.billDate = editForm.billDate;
      if (editForm.dateOfCall) payload.dateOfCall = editForm.dateOfCall;
      if (bill.userId) {
        if (editForm.userId) payload.userId = editForm.userId;
      } else if (editForm.customerName) {
        payload.customerName = editForm.customerName;
      }
      const updated = await api.put(`/api/bills/${id}`, payload);
      setBill(updated);
      setEditing(false);
      toast.success("تم حفظ التغييرات");
    } catch (err) {
      toast.error(err.message || "تعذر التحديث");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/api/bills/${id}`);
      toast.success("تم حذف الفاتورة");
      router.push("/bills");
    } catch (err) {
      toast.error(err.message || "تعذر الحذف");
      setDeleting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPayError("");
    const amount = Number(payment.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPayError("أدخل مبلغاً موجباً");
      return;
    }
    if (amount > bill.remainingAmount + 0.001) {
      setPayError(
        `المبلغ يتجاوز المتبقي على الفاتورة (${formatPrice(
          bill.remainingAmount
        )})`
      );
      return;
    }
    setPaying(true);
    try {
      const payload = {
        amount,
        method: payment.method,
        note: payment.note || undefined,
      };
      if (payment.paidAt) payload.paidAt = payment.paidAt;
      const updated = await api.post(`/api/bills/${id}/payments`, payload);
      setBill(updated);
      setPayment({ amount: "", paidAt: "", method: "cash", note: "" });
      toast.success("تم تسجيل الدفعة");
    } catch (err) {
      setPayError(err.message || "تعذر تسجيل الدفعة");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title=" " subtitle=" " />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div>
        <PageHeader
          eyebrow="فاتورة"
          title="تفاصيل الفاتورة"
          actions={
            <Link href="/bills">
              <Button variant="secondary" endIcon={<ArrowRight size={16} />}>
                العودة
              </Button>
            </Link>
          }
        />
        <ErrorState message={error || "الفاتورة غير موجودة"} onRetry={load} />
      </div>
    );
  }

  const clientName = billDisplayName(bill);
  const clientUser = bill.userId && typeof bill.userId === "object" ? bill.userId : null;
  const userOptions = users.map((u) => ({
    value: u._id,
    label: u.name,
    sublabel: `${u.email} • ${u.country}`,
    searchText: `${u.name} ${u.email} ${u.country}`,
  }));
  const methodOptions = PAYMENT_METHODS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const total = bill.totalAmount ?? bill.billPrice ?? 0;
  const paid = bill.paidAmount ?? 0;
  const remaining = bill.remainingAmount ?? Math.max(total - paid, 0);
  const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const fullyPaid = bill.paymentStatus === "paid";

  return (
    <div className="print-page">
      <div className="no-print">
        <PageHeader
          eyebrow={`فاتورة #${String(bill._id).slice(-6)}`}
          title={clientName || "فاتورة"}
          subtitle={`أُنشئت في ${formatDateTime(bill.createdAt)}`}
          actions={
            <>
              <Link href="/bills">
                <Button variant="secondary" endIcon={<ArrowRight size={16} />}>
                  العودة
                </Button>
              </Link>
              <Button
                variant="secondary"
                startIcon={<Printer size={16} />}
                onClick={() => window.print()}
              >
                طباعة
              </Button>
              <Button
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                startIcon={<Trash2 size={16} />}
                onClick={() => setConfirmDel(true)}
              >
                حذف
              </Button>
              <Button startIcon={<Pencil size={16} />} onClick={openEdit}>
                تعديل
              </Button>
            </>
          }
        />
      </div>

      {/* Print-only header */}
      <div className="print-only mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500">
              UserBilling
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              فاتورة #{String(bill._id).slice(-6)}
            </h1>
          </div>
          <div className="text-left text-xs text-slate-600 tabular">
            <p>تاريخ الفاتورة: {formatDateTime(bill.billDate)}</p>
            <p>تاريخ الطباعة: {formatDateTime(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Status / financial hero */}
      <Card className="p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-4 lg:w-1/3">
            <Avatar name={clientName} className="w-14 h-14 text-base" />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">العميل</p>
              {clientUser ? (
                <Link
                  href={`/users/${clientUser._id}`}
                  className="text-lg font-bold text-slate-900 hover:text-indigo-700 transition truncate block"
                >
                  {clientName}
                </Link>
              ) : (
                <p className="text-lg font-bold text-slate-900 truncate">
                  {clientName || "—"}
                </p>
              )}
              {clientUser ? (
                <p className="text-xs text-slate-500 truncate">
                  {clientUser.email}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  فاتورة قديمة بدون عميل مرتبط
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1">
            <StatTile label="الإجمالي" value={formatPrice(total)} tone="indigo" />
            <StatTile label="المدفوع" value={formatPrice(paid)} tone="emerald" />
            <StatTile label="المتبقي" value={formatPrice(remaining)} tone="amber" />
          </div>

          <div className="lg:w-48 flex flex-col items-end gap-2">
            <Badge tone={PAYMENT_STATUS_TONE[bill.paymentStatus] || "neutral"}>
              {paymentStatusLabel(bill.paymentStatus)}
            </Badge>
            <div className="w-full">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    fullyPaid ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 tabular mt-1 text-end">
                {paidPct}% مدفوع
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bill information */}
        <Card className="lg:col-span-2">
          <CardHeader title="تفاصيل الفاتورة" />
          <div className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Receipt size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-500">الكمية</p>
                <p className="font-bold text-slate-800 tabular">
                  {bill.amount ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Wallet size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-500">السعر الإجمالي</p>
                <p className="font-bold text-slate-800 tabular">
                  {formatPrice(total)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-500">تاريخ الفاتورة</p>
                <p className="font-bold text-slate-800 tabular">
                  {formatDateTime(bill.billDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <PhoneCall size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-500">تاريخ المكالمة</p>
                <p className="font-bold text-slate-800 tabular">
                  {formatDateTime(bill.dateOfCall)}
                </p>
              </div>
            </div>
            {billDescription(bill) ? (
              <div className="sm:col-span-2 flex items-start gap-2">
                <StickyNote size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500">الوصف</p>
                  <p className="text-slate-700 leading-7">
                    {billDescription(bill)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Register payment */}
        <Card className="lg:col-span-1 no-print">
          <CardHeader
            title="تسجيل دفعة"
            subtitle={
              fullyPaid
                ? "الفاتورة مدفوعة بالكامل"
                : `المتبقي: ${formatPrice(remaining)}`
            }
          />
          <form onSubmit={handlePayment} className="px-5 pb-5 pt-3 space-y-3">
            <fieldset disabled={fullyPaid || paying} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  المبلغ
                </label>
                <Input
                  type="number"
                  step="any"
                  value={payment.amount}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder={`حتى ${formatPrice(remaining)}`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  تاريخ الدفع
                </label>
                <Input
                  type="datetime-local"
                  value={payment.paidAt}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, paidAt: e.target.value }))
                  }
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  اتركه فارغًا للوقت الحالي
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  طريقة الدفع
                </label>
                <SearchableSelect
                  value={payment.method}
                  onChange={(v) => setPayment((p) => ({ ...p, method: v }))}
                  options={methodOptions}
                  searchable={false}
                  placeholder="اختر طريقة الدفع"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ملاحظة (اختياري)
                </label>
                <Textarea
                  value={payment.note}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, note: e.target.value }))
                  }
                  rows={2}
                  placeholder="رقم إيصال، تفاصيل التحويل..."
                />
              </div>
              {payError ? (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {payError}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                loading={paying}
                startIcon={<Plus size={16} />}
              >
                {fullyPaid ? "الفاتورة مدفوعة بالكامل" : "تسجيل الدفعة"}
              </Button>
            </fieldset>
          </form>
        </Card>
      </div>

      {/* Payment history */}
      <Card className="mt-4">
        <CardHeader
          title="سجل الدفعات"
          subtitle={
            bill.payments && bill.payments.length
              ? `${bill.payments.length} دفعة مسجلة`
              : "لا توجد دفعات بعد"
          }
        />
        <div className="p-3">
          {!bill.payments || bill.payments.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-8">
              <ArrowDownToLine size={20} className="inline-block mb-2 text-slate-300" />
              <p>لم يتم تسجيل أي دفعة على هذه الفاتورة بعد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-100">
                    <th className="text-right px-4 py-2 text-[11px] font-bold tracking-wider uppercase">
                      #
                    </th>
                    <th className="text-right px-4 py-2 text-[11px] font-bold tracking-wider uppercase">
                      التاريخ
                    </th>
                    <th className="text-right px-4 py-2 text-[11px] font-bold tracking-wider uppercase">
                      المبلغ
                    </th>
                    <th className="text-right px-4 py-2 text-[11px] font-bold tracking-wider uppercase">
                      الطريقة
                    </th>
                    <th className="text-right px-4 py-2 text-[11px] font-bold tracking-wider uppercase">
                      ملاحظة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bill.payments.map((p, i) => (
                    <tr
                      key={p._id || i}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-2.5 text-slate-500 tabular">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 tabular">
                        {formatDateTime(p.paidAt || p.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-emerald-700 tabular">
                        {formatPrice(p.amount)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone="neutral">
                          {paymentMethodLabel(p.method)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-[18rem] truncate">
                        {p.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/60">
                    <td colSpan={2} className="px-4 py-2.5 text-slate-500 text-xs">
                      الإجمالي
                    </td>
                    <td className="px-4 py-2.5 font-extrabold text-slate-900 tabular">
                      {formatPrice(paid)}
                    </td>
                    <td colSpan={2} className="px-4 py-2.5 text-slate-500 text-xs text-end">
                      المتبقي: {formatPrice(remaining)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Print-only footer */}
      <div className="print-only mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>UserBilling</span>
        <span>فاتورة #{String(bill._id).slice(-6)}</span>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="تعديل الفاتورة"
        description="حدّث البيانات. حالة الدفع تُحدَّد تلقائيًا من سجل الدفعات."
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button onClick={handleEditSave} loading={saving}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {bill.userId ? (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                العميل
              </label>
              <SearchableSelect
                value={editForm.userId}
                onChange={(v) => setEditForm((f) => ({ ...f, userId: v }))}
                options={userOptions}
                placeholder="اختر عميلاً"
                searchPlaceholder="ابحث بالاسم أو البريد أو الدولة..."
                emptyMessage="لا يوجد عملاء مطابقون"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                اسم العميل
                <span className="text-slate-400 font-normal">
                  {" "}
                  (فاتورة قديمة)
                </span>
              </label>
              <Input
                value={editForm.customerName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, customerName: e.target.value }))
                }
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                السعر الإجمالي
              </label>
              <Input
                type="number"
                step="any"
                value={editForm.billPrice}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, billPrice: e.target.value }))
                }
              />
              {paid > 0 ? (
                <p className="text-[11px] text-slate-500 mt-1">
                  لا يمكن أن يقل عن المبلغ المدفوع ({formatPrice(paid)}).
                </p>
              ) : null}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                الكمية
              </label>
              <Input
                type="number"
                step="any"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                تاريخ الفاتورة
              </label>
              <Input
                type="datetime-local"
                value={editForm.billDate}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, billDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                تاريخ المكالمة
              </label>
              <Input
                type="datetime-local"
                value={editForm.dateOfCall}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, dateOfCall: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              الوصف
            </label>
            <Textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              placeholder="ملاحظات إضافية..."
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        title="حذف الفاتورة"
        description="هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع."
        confirmLabel="نعم، احذف"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  );
}
