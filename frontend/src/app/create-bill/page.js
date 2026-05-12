"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";
import { Loading, ErrorState } from "@/components/ui/empty";

const billSchema = z.object({
  userId: z.string().min(1, "اختر عميلاً"),
  amount: z
    .number({ invalid_type_error: "الكمية مطلوبة" })
    .positive("يجب أن تكون أكبر من 0"),
  billPrice: z
    .number({ invalid_type_error: "السعر مطلوب" })
    .positive("يجب أن يكون أكبر من 0"),
  billDate: z.string().min(1, "تاريخ ووقت الفاتورة مطلوبان"),
  dateOfCall: z.string().min(1, "تاريخ ووقت المكالمة مطلوبان"),
  description: z.string().optional(),
});

function FieldLabel({ children }) {
  return (
    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
      {children}
    </label>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-[11px] text-rose-600 mt-1.5">{children}</p>;
}

function CreateBillInner() {
  useEffect(() => {
    document.title = "إنشاء فاتورة جديدة";
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const presetUserId = searchParams.get("userId") || "";
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [userId, setUserId] = useState(presetUserId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: { userId: presetUserId },
  });

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await api.get("/api/users");
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || "تعذر تحميل العملاء");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Keep RHF in sync with controlled userId
  useEffect(() => {
    setValue("userId", userId, { shouldValidate: true });
  }, [userId, setValue]);

  const onSubmit = async (data) => {
    try {
      await api.post("/api/bills", { ...data, userId });
      toast.success("تم إنشاء الفاتورة");
      router.push("/bills");
    } catch (err) {
      toast.error(err.message || "تعذر إنشاء الفاتورة");
    }
  };

  const userOptions = users.map((u) => ({
    value: u._id,
    label: u.name,
    sublabel: `${u.email} • ${u.country}`,
    searchText: `${u.name} ${u.email} ${u.country}`,
  }));

  const presetUser =
    presetUserId && users.find((u) => u._id === presetUserId);

  return (
    <div>
      <PageHeader
        eyebrow="إضافة"
        title="إنشاء فاتورة جديدة"
        subtitle={
          presetUser
            ? `سيتم ربط الفاتورة بالعميل: ${presetUser.name}`
            : "اختر العميل وأدخل تفاصيل الفاتورة"
        }
        actions={
          <Link href="/bills">
            <Button variant="secondary" endIcon={<ArrowRight size={16} />}>
              العودة للقائمة
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 surface p-6 md:p-8">
          {usersLoading ? (
            <Loading />
          ) : usersError ? (
            <ErrorState message={usersError} onRetry={loadUsers} />
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
              <p className="text-sm text-amber-800 font-semibold">
                لا يوجد عملاء مسجلون بعد
              </p>
              <p className="text-xs text-amber-700 mt-1">
                يجب إضافة عميل أولاً لتتمكن من إنشاء فاتورة له.
              </p>
              <Link href="/create-user" className="inline-block mt-4">
                <Button>إضافة عميل أولاً</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <FieldLabel>العميل</FieldLabel>
                <SearchableSelect
                  value={userId}
                  onChange={setUserId}
                  options={userOptions}
                  placeholder="اختر عميلاً"
                  searchPlaceholder="ابحث بالاسم أو البريد أو الدولة..."
                  emptyMessage="لا يوجد عملاء مطابقون"
                  error={!!errors.userId}
                  clearable
                />
                <FieldError>{errors.userId?.message}</FieldError>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>السعر</FieldLabel>
                  <Input
                    type="number"
                    step="any"
                    {...register("billPrice", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <FieldError>{errors.billPrice?.message}</FieldError>
                </div>
                <div>
                  <FieldLabel>الكمية</FieldLabel>
                  <Input
                    type="number"
                    step="any"
                    {...register("amount", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <FieldError>{errors.amount?.message}</FieldError>
                </div>
                <div>
                  <FieldLabel>تاريخ ووقت الفاتورة</FieldLabel>
                  <Input type="datetime-local" {...register("billDate")} />
                  <FieldError>{errors.billDate?.message}</FieldError>
                </div>
                <div>
                  <FieldLabel>تاريخ ووقت المكالمة</FieldLabel>
                  <Input type="datetime-local" {...register("dateOfCall")} />
                  <FieldError>{errors.dateOfCall?.message}</FieldError>
                </div>
              </div>

              <div>
                <FieldLabel>الوصف (اختياري)</FieldLabel>
                <Textarea
                  {...register("description")}
                  rows={3}
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <div className="bg-slate-50/60 rounded-xl border border-slate-100 px-4 py-3 text-xs text-slate-600 leading-6">
                تبدأ الفاتورة الجديدة بحالة{" "}
                <span className="font-bold text-amber-700">غير مدفوعة</span>.
                يمكنك تسجيل الدفعات لاحقًا من صفحة تفاصيل الفاتورة لتتغير
                الحالة تلقائيًا إلى مدفوعة جزئيًا أو بالكامل.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Link href="/bills">
                  <Button variant="secondary" disabled={isSubmitting}>
                    إلغاء
                  </Button>
                </Link>
                <Button type="submit" loading={isSubmitting}>
                  إنشاء الفاتورة
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-4">
          <div className="surface p-5">
            <h3 className="text-sm font-bold text-slate-900">قبل البدء</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-600 leading-6">
              <li className="flex gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>اختر العميل من القائمة، أو ابحث عنه بالاسم.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>أدخل تاريخ ووقت الفاتورة بدقة الدقيقة.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>الحالة تُحدّد تلقائيًا من سجل الدفعات لاحقًا.</span>
              </li>
            </ul>
          </div>
          <div className="surface p-5">
            <h3 className="text-sm font-bold text-slate-900">
              العملاء المسجلون
            </h3>
            <p className="text-3xl font-extrabold text-slate-900 tabular mt-2">
              {usersLoading ? "..." : users.length}
            </p>
            <Link
              href="/users"
              className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              عرض جميع العملاء
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CreateBillPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CreateBillInner />
    </Suspense>
  );
}
