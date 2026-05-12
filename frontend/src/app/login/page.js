"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  useEffect(() => {
    document.title = "تسجيل الدخول";
  }, []);

  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("مرحباً بك مجدداً");
      router.replace("/");
    } catch (err) {
      setError(err.message || "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative side panel */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-gradient-to-br from-indigo-200/40 via-violet-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-gradient-to-tr from-sky-200/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 surface-lifted overflow-hidden">
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 text-white">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/20 grid place-items-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path
                    d="M5 6.5C5 5.12 6.12 4 7.5 4h6.4c.93 0 1.78.51 2.22 1.33L18.8 10c.4.75.4 1.65 0 2.4l-2.68 5.27c-.44.82-1.29 1.33-2.22 1.33H7.5A2.5 2.5 0 0 1 5 16.5v-10Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 9h5M9 12h5M9 15h3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight">
                UserBilling
              </span>
            </span>
          </div>
          <div className="relative">
            <h2 className="text-2xl font-extrabold leading-snug">
              إدارة العملاء والفواتير
              <br />
              <span className="text-indigo-300">بكفاءة ووضوح</span>
            </h2>
            <p className="mt-3 text-sm text-slate-300/90 leading-7 max-w-sm">
              نظام داخلي بسيط ومتقن لتتبع عملائك وفواتيرك بأسلوب احترافي.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-center">
            {[
              { v: "100%", l: "RTL عربي" },
              { v: "آمن", l: "JWT" },
              { v: "سريع", l: "أداء" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3"
              >
                <p className="text-lg font-bold">{s.v}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10 bg-white">
          <div className="max-w-sm mx-auto">
            <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-600 uppercase">
              مرحباً بعودتك
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">
              تسجيل الدخول
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              أدخل بيانات المسؤول للمتابعة إلى لوحة التحكم.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  البريد الإلكتروني
                </label>
                <div className="field-icon-wrap">
                  <Mail size={16} className="field-icon" />
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  كلمة المرور
                </label>
                <div className="field-icon-wrap">
                  <Lock size={16} className="field-icon" />
                  <Input
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    className="absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    style={{ insetInlineEnd: "0.75rem" }}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                دخول إلى لوحة التحكم
              </Button>
            </form>

            <p className="mt-6 text-[11px] text-slate-400 text-center">
              النظام مخصص للمسؤول فقط. لا يوجد تسجيل عام.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
