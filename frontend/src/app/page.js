"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  CircleDashed,
  UserPlus,
  FilePlus,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  formatDateTime,
  formatPrice,
  paymentStatusLabel,
  PAYMENT_STATUS_TONE,
} from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Donut, DonutLegend } from "@/components/charts/Donut";
import { EmptyState, ErrorState } from "@/components/ui/empty";
import { SkeletonCard, Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/stats");
      setStats(data);
    } catch (err) {
      setError(err.message || "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "لوحة التحكم";
    load();
  }, []);

  const paid = stats?.paidBills ?? 0;
  const partial = stats?.partialBills ?? 0;
  const unpaid = stats?.unpaidBills ?? stats?.pendingBills ?? 0;
  const totalBills = stats?.totalBills ?? 0;
  const hasBills = totalBills > 0;

  const segments = hasBills
    ? [
        { label: "مدفوعة بالكامل", value: paid, color: "#059669" },
        { label: "مدفوعة جزئيًا", value: partial, color: "#6366f1" },
        { label: "غير مدفوعة", value: unpaid, color: "#f59e0b" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="نظرة عامة"
        title="لوحة التحكم"
        subtitle="ملخص نشاط العملاء والفواتير في حسابك"
        actions={
          <>
            <Link href="/create-user">
              <Button variant="secondary" startIcon={<UserPlus size={16} />}>
                إضافة عميل
              </Button>
            </Link>
            <Link href="/create-bill">
              <Button startIcon={<FilePlus size={16} />}>إضافة فاتورة</Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="surface p-6 lg:col-span-1">
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            </div>
            <div className="surface p-6 lg:col-span-2">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              tone="indigo"
              label="إجمالي العملاء"
              value={stats.totalUsers}
              hint="مجموع العملاء المسجلين"
            />
            <StatCard
              icon={FileText}
              tone="slate"
              label="إجمالي الفواتير"
              value={stats.totalBills}
              hint={`إجمالي: ${formatPrice(stats.totalBilled)}`}
            />
            <StatCard
              icon={CheckCircle2}
              tone="emerald"
              label="مدفوعة بالكامل"
              value={paid}
              hint={`المحصّل: ${formatPrice(stats.totalPaid)}`}
            />
            <StatCard
              icon={Clock}
              tone="amber"
              label="غير مدفوعة / جزئيًا"
              value={unpaid + partial}
              hint={`المتبقي: ${formatPrice(stats.totalRemaining)}`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader
                title="حالة الفواتير"
                subtitle="توزيع الفواتير حسب حالة الدفع"
              />
              <div className="px-5 pb-5 pt-3 flex flex-col items-center">
                <Donut
                  segments={segments}
                  centerLabel="إجمالي"
                  centerValue={totalBills}
                />
                <div className="w-full mt-5">
                  {hasBills ? (
                    <DonutLegend segments={segments} />
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      لا توجد فواتير لعرضها بعد.
                    </p>
                  )}
                </div>
                {hasBills && partial > 0 ? (
                  <div className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <CircleDashed size={14} className="text-indigo-500" />
                    <span>
                      {partial} فاتورة مدفوعة جزئيًا — راجع تفاصيلها لتحصيل
                      المتبقي.
                    </span>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="أحدث الفواتير"
                subtitle="آخر ٥ فواتير تم تسجيلها"
                action={
                  <Link
                    href="/bills"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    عرض الكل
                    <ArrowLeft size={14} />
                  </Link>
                }
              />
              <div className="p-2">
                {!stats.latest || stats.latest.length === 0 ? (
                  <EmptyState
                    title="لا توجد فواتير بعد"
                    description="ابدأ بإضافة عميل ثم إنشاء أول فاتورة لظهور البيانات هنا."
                    action={
                      <Link href="/create-bill">
                        <Button startIcon={<FilePlus size={16} />}>
                          إضافة فاتورة
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {stats.latest.map((b) => (
                      <li key={b._id}>
                        <Link
                          href={`/bills/${b._id}`}
                          className="flex items-center justify-between gap-4 px-3 py-3.5 rounded-xl hover:bg-slate-50/70 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-9 h-9 rounded-xl ring-1 ring-inset flex items-center justify-center text-xs font-bold ${
                                b.paymentStatus === "paid"
                                  ? "bg-emerald-50 ring-emerald-100 text-emerald-700"
                                  : b.paymentStatus === "partial"
                                  ? "bg-indigo-50 ring-indigo-100 text-indigo-700"
                                  : "bg-amber-50 ring-amber-100 text-amber-700"
                              }`}
                            >
                              {(b.displayName || "؟").charAt(0)}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {b.displayName || "—"}
                              </p>
                              <p className="text-xs text-slate-500 tabular">
                                {formatDateTime(b.billDate || b.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-slate-800 tabular">
                              {formatPrice(b.billPrice)}
                            </span>
                            <Badge
                              tone={
                                PAYMENT_STATUS_TONE[b.paymentStatus] ||
                                "neutral"
                              }
                            >
                              {paymentStatusLabel(b.paymentStatus)}
                            </Badge>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
