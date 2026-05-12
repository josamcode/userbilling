"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FilePlus,
  Pencil,
  Trash2,
  Mail,
  Globe,
  CalendarDays,
  Wallet,
  ArrowDownToLine,
  Receipt,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { EmptyState, ErrorState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  paymentStatusLabel,
  PAYMENT_STATUS_TONE,
} from "@/lib/format";

export default function ClientDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", country: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/users/${id}/details`);
      setData(res);
      setForm({
        name: res.user.name || "",
        email: res.user.email || "",
        country: res.user.country || "",
      });
    } catch (err) {
      setError(err.message || "تعذر تحميل بيانات العميل");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    document.title = "تفاصيل العميل";
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("country", form.country);
      if (imageFile) fd.append("image", imageFile);
      await api.putForm(`/api/users/${id}`, fd);
      toast.success("تم حفظ التغييرات");
      setEditing(false);
      setImageFile(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذر التحديث");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/api/users/${id}`);
      toast.success("تم حذف العميل");
      router.push("/users");
    } catch (err) {
      toast.error(err.message || "تعذر الحذف");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title=" " subtitle=" " />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader
          eyebrow="عميل"
          title="تفاصيل العميل"
          actions={
            <Link href="/users">
              <Button variant="secondary" endIcon={<ArrowRight size={16} />}>
                العودة
              </Button>
            </Link>
          }
        />
        <ErrorState message={error || "العميل غير موجود"} onRetry={load} />
      </div>
    );
  }

  const { user, bills, summary } = data;

  return (
    <div>
      <PageHeader
        eyebrow="عميل"
        title={user.name}
        subtitle={user.email}
        actions={
          <>
            <Link href="/users">
              <Button variant="secondary" endIcon={<ArrowRight size={16} />}>
                العودة للقائمة
              </Button>
            </Link>
            <Link href={`/create-bill?userId=${user._id}`}>
              <Button startIcon={<FilePlus size={16} />}>
                فاتورة جديدة لهذا العميل
              </Button>
            </Link>
          </>
        }
      />

      <Card className="p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <Avatar
            src={user.image}
            imageUrl={user.imageUrl}
            name={user.name}
            className="w-20 h-20 text-2xl"
            ringed
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-slate-900 truncate">
              {user.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span className="tabular">{user.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-slate-400" />
                <span>{user.country}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-slate-400" />
                <span className="tabular">
                  تم التسجيل {formatDate(user.createdAt)}
                </span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50"
              startIcon={<Trash2 size={15} />}
              onClick={() => setConfirmDel(true)}
            >
              حذف
            </Button>
            <Button
              variant="secondary"
              startIcon={<Pencil size={15} />}
              onClick={() => setEditing(true)}
            >
              تعديل
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Receipt}
          tone="slate"
          label="عدد الفواتير"
          value={summary.billCount}
          hint="إجمالي الفواتير المرتبطة"
        />
        <StatCard
          icon={Wallet}
          tone="indigo"
          label="إجمالي المُحرّر"
          value={formatPrice(summary.totalBilled)}
          hint="مجموع قيم الفواتير"
        />
        <StatCard
          icon={ArrowDownToLine}
          tone="emerald"
          label="إجمالي المُحصّل"
          value={formatPrice(summary.totalPaid)}
          hint={`${summary.byStatus.paid} مدفوعة بالكامل`}
        />
        <StatCard
          icon={Wallet}
          tone="amber"
          label="المتبقي"
          value={formatPrice(summary.totalRemaining)}
          hint={`${summary.byStatus.partial} جزئيًا • ${summary.byStatus.unpaid} غير مدفوعة`}
        />
      </div>

      <Card>
        <CardHeader
          title="فواتير العميل"
          subtitle={
            bills.length
              ? `${bills.length} فاتورة مرتبطة بهذا العميل`
              : "لا توجد فواتير لهذا العميل بعد"
          }
          action={
            <Link href={`/create-bill?userId=${user._id}`}>
              <Button
                size="sm"
                variant="soft"
                startIcon={<FilePlus size={14} />}
              >
                إضافة فاتورة
              </Button>
            </Link>
          }
        />
        <div className="p-3">
          {bills.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="لا توجد فواتير لهذا العميل"
              description="أنشئ أول فاتورة لمتابعة المدفوعات."
              action={
                <Link href={`/create-bill?userId=${user._id}`}>
                  <Button startIcon={<FilePlus size={16} />}>
                    إنشاء فاتورة
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {bills.map((b) => (
                <li key={b._id}>
                  <Link
                    href={`/bills/${b._id}`}
                    className="grid grid-cols-12 items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-slate-50/70 transition"
                  >
                    <div className="col-span-12 sm:col-span-4">
                      <p className="text-sm font-bold text-slate-800">
                        فاتورة #{String(b._id).slice(-6)}
                      </p>
                      <p className="text-xs text-slate-500 tabular">
                        {formatDateTime(b.billDate || b.createdAt)}
                      </p>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-[11px] text-slate-500">الإجمالي</p>
                      <p className="text-sm font-bold tabular text-slate-800">
                        {formatPrice(b.totalAmount)}
                      </p>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-[11px] text-slate-500">المدفوع</p>
                      <p className="text-sm font-bold tabular text-emerald-700">
                        {formatPrice(b.paidAmount)}
                      </p>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-[11px] text-slate-500">المتبقي</p>
                      <p className="text-sm font-bold tabular text-amber-700">
                        {formatPrice(b.remainingAmount)}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-2 sm:text-left">
                      <Badge
                        tone={
                          PAYMENT_STATUS_TONE[b.paymentStatus] || "neutral"
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

      <Modal
        open={editing}
        onClose={() => {
          setEditing(false);
          setImageFile(null);
        }}
        title="تعديل بيانات العميل"
        description="حدث البيانات ثم احفظ التغييرات."
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(false);
                setImageFile(null);
              }}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button onClick={handleSave} loading={saving}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FileUpload
            onFile={setImageFile}
            initialPreview={user.imageUrl || null}
            label="حدث صورة العميل"
            hint="اختياري — PNG/JPG حتى 5MB"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                الاسم
              </label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                الدولة
              </label>
              <Input
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        title="حذف العميل"
        description="هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع."
        confirmLabel="نعم، احذف"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  );
}
