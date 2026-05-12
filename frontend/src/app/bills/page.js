"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FilePlus,
  Trash2,
  Eye,
  FileText as FileTextIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import {
  formatDateTime,
  formatPrice,
  billDisplayName,
  paymentStatusLabel,
  PAYMENT_STATUS_TONE,
} from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

const FILTERS = [
  { value: "all", label: "الكل" },
  { value: "paid", label: "مدفوعة بالكامل" },
  { value: "partial", label: "جزئيًا" },
  { value: "unpaid", label: "غير مدفوعة" },
];

export default function BillsPage() {
  useEffect(() => {
    document.title = "الفواتير";
  }, []);

  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/bills");
      setBills(data);
    } catch (err) {
      setError(err.message || "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bills.filter((b) => {
      if (statusFilter !== "all" && b.paymentStatus !== statusFilter)
        return false;
      if (!q) return true;
      const name = billDisplayName(b).toLowerCase();
      return name.includes(q);
    });
  }, [bills, search, statusFilter]);

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.del(`/api/bills/${confirmDelete._id}`);
      setBills((prev) => prev.filter((b) => b._id !== confirmDelete._id));
      toast.success("تم حذف الفاتورة");
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message || "تعذر الحذف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="إدارة"
        title="الفواتير"
        subtitle="جميع الفواتير المسجّلة ومتابعة حالة دفعها"
        actions={
          <Link href="/create-bill">
            <Button startIcon={<FilePlus size={16} />}>إضافة فاتورة</Button>
          </Link>
        }
      />

      <div className="surface p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحث باسم العميل..."
          />
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 self-start md:self-auto overflow-x-auto">
          {FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  active
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="md:mr-auto text-xs text-slate-500">
          {!loading && !error ? (
            <span>
              عرض{" "}
              <span className="font-bold text-slate-700 tabular">
                {filtered.length}
              </span>{" "}
              من{" "}
              <span className="font-bold text-slate-700 tabular">
                {bills.length}
              </span>
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="surface overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title={
            search || statusFilter !== "all"
              ? "لم يتم العثور على نتائج"
              : "لا توجد فواتير بعد"
          }
          description={
            search || statusFilter !== "all"
              ? "جرّب فلتراً مختلفاً أو امسح البحث."
              : "أنشئ أول فاتورة لتبدأ في متابعة المدفوعات."
          }
          action={
            !search && statusFilter === "all" ? (
              <Link href="/create-bill">
                <Button startIcon={<FilePlus size={16} />}>إضافة فاتورة</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block surface overflow-hidden">
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500">
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      العميل
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      الإجمالي
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      المدفوع
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      المتبقي
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      الحالة
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      التاريخ
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-wider uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((bill) => {
                    const name = billDisplayName(bill) || "—";
                    return (
                      <tr
                        key={bill._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/bills/${bill._id}`}
                            className="flex items-center gap-3 min-w-0"
                          >
                            <Avatar name={name} className="w-9 h-9 text-xs" />
                            <span className="font-semibold text-slate-800 truncate hover:text-indigo-700">
                              {name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800 tabular">
                          {formatPrice(bill.totalAmount ?? bill.billPrice)}
                        </td>
                        <td className="px-5 py-3 font-bold text-emerald-700 tabular">
                          {formatPrice(bill.paidAmount)}
                        </td>
                        <td className="px-5 py-3 font-bold text-amber-700 tabular">
                          {formatPrice(bill.remainingAmount)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            tone={
                              PAYMENT_STATUS_TONE[bill.paymentStatus] ||
                              "neutral"
                            }
                          >
                            {paymentStatusLabel(bill.paymentStatus)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-slate-600 tabular">
                          {formatDateTime(bill.billDate)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/bills/${bill._id}`}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                              aria-label="عرض"
                              title="عرض التفاصيل"
                            >
                              <Eye size={16} />
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(bill)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                              aria-label="حذف"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {filtered.map((bill) => {
              const name = billDisplayName(bill) || "—";
              return (
                <div key={bill._id} className="surface p-4">
                  <Link
                    href={`/bills/${bill._id}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={name} className="w-10 h-10 text-sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 tabular">
                          {formatDateTime(bill.billDate)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      tone={PAYMENT_STATUS_TONE[bill.paymentStatus] || "neutral"}
                    >
                      {paymentStatusLabel(bill.paymentStatus)}
                    </Badge>
                  </Link>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500">الإجمالي</p>
                      <p className="text-sm font-bold tabular text-slate-800">
                        {formatPrice(bill.totalAmount ?? bill.billPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">المدفوع</p>
                      <p className="text-sm font-bold tabular text-emerald-700">
                        {formatPrice(bill.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">المتبقي</p>
                      <p className="text-sm font-bold tabular text-amber-700">
                        {formatPrice(bill.remainingAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
                    <Link href={`/bills/${bill._id}`}>
                      <Button size="sm" variant="ghost">
                        عرض التفاصيل
                      </Button>
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(bill)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      aria-label="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف الفاتورة"
        description="هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع."
        confirmLabel="نعم، احذف"
        destructive
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
