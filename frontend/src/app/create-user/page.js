"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User, Mail, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { PageHeader } from "@/components/ui/page-header";

const userSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم قصير جداً")
    .refine((v) => v.trim().length > 0, "الاسم مطلوب"),
  email: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .refine((v) => v.trim().length > 0, "البريد الإلكتروني مطلوب"),
  country: z
    .string()
    .min(2, "اسم الدولة قصير جداً")
    .refine((v) => v.trim().length > 0, "الدولة مطلوبة"),
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

function IconField({ icon: Icon, ...inputProps }) {
  return (
    <div className="field-icon-wrap">
      <Icon size={16} className="field-icon" />
      <Input {...inputProps} />
    </div>
  );
}

export default function AdminCreateUser() {
  useEffect(() => {
    document.title = "إنشاء عميل جديد";
  }, []);

  const router = useRouter();
  const toast = useToast();
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(userSchema) });

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append("name", data.name.trim());
      fd.append("email", data.email.trim());
      fd.append("country", data.country.trim());
      if (imageFile) fd.append("image", imageFile);
      await api.postForm("/api/users", fd);
      toast.success("تم إنشاء العميل بنجاح");
      router.push("/users");
    } catch (err) {
      toast.error(err.message || "تعذر إنشاء العميل");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="إضافة"
        title="إنشاء عميل جديد"
        subtitle="أدخل بيانات العميل لإضافته إلى قاعدة العملاء"
        actions={
          <Link href="/users">
            <Button variant="secondary" endIcon={<ArrowRight size={16} />}>
              العودة للقائمة
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-2 surface p-6 md:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>الاسم الكامل</FieldLabel>
              <IconField
                icon={User}
                {...register("name")}
                placeholder="مثال: أحمد محمود"
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div>
              <FieldLabel>البريد الإلكتروني</FieldLabel>
              <IconField
                icon={Mail}
                type="email"
                {...register("email")}
                placeholder="name@example.com"
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>

            <div className="sm:col-span-2">
              <FieldLabel>الدولة</FieldLabel>
              <IconField
                icon={Globe}
                {...register("country")}
                placeholder="مثال: مصر"
              />
              <FieldError>{errors.country?.message}</FieldError>
            </div>
          </div>

          <div>
            <FieldLabel>صورة العميل</FieldLabel>
            <FileUpload onFile={setImageFile} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Link href="/users">
              <Button variant="secondary" disabled={isSubmitting}>
                إلغاء
              </Button>
            </Link>
            <Button type="submit" loading={isSubmitting}>
              إنشاء العميل
            </Button>
          </div>
        </form>

        <aside className="lg:col-span-1 space-y-4">
          <div className="surface p-5">
            <h3 className="text-sm font-bold text-slate-900">إرشادات سريعة</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-600 leading-6">
              <li className="flex gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>تأكد من صحة البريد الإلكتروني لتجنب التكرار.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>الصورة اختيارية وستُرفع تلقائياً إلى Cloudinary.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>يمكنك تعديل البيانات لاحقاً من صفحة العملاء.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
