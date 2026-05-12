"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  FilePlus,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const SECTIONS = [
  {
    label: "الرئيسية",
    items: [
      { href: "/", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { href: "/users", label: "العملاء", icon: Users },
      { href: "/bills", label: "الفواتير", icon: FileText },
    ],
  },
  {
    label: "إجراءات سريعة",
    items: [
      { href: "/create-user", label: "إضافة عميل", icon: UserPlus },
      { href: "/create-bill", label: "إضافة فاتورة", icon: FilePlus },
    ],
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 grid place-items-center shadow-[0_8px_18px_-8px_rgba(79,70,229,0.6)]">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none">
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
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold text-slate-900">
          UserBilling
        </p>
        <p className="text-[11px] text-slate-500">إدارة العملاء والفواتير</p>
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className="h-full w-72 bg-white/85 backdrop-blur-xl border-l border-slate-200/70 flex flex-col">
      <div className="p-5 pb-3">
        <Brand />
      </div>

      <nav className="flex-1 px-3 pb-3 overflow-y-auto thin-scroll">
        {SECTIONS.map((section, i) => (
          <div key={i} className="mb-5">
            <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`group flex items-center gap-3 pr-3 pl-3 py-2.5 rounded-xl text-sm transition relative ${
                        active
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {active ? (
                        <span className="absolute right-0 top-2 bottom-2 w-1 rounded-full bg-indigo-600" />
                      ) : null}
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                          active
                            ? "bg-white text-indigo-600 ring-1 ring-indigo-100 shadow-sm"
                            : "text-slate-500 group-hover:text-slate-700"
                        }`}
                      >
                        <Icon size={17} strokeWidth={2.1} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="surface flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold">
            {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500 leading-none">المسؤول</p>
            <p
              className="text-[13px] font-semibold text-slate-800 truncate"
              title={user?.email}
            >
              {user?.email || "—"}
            </p>
          </div>
          <button
            onClick={logout}
            aria-label="تسجيل الخروج"
            className="w-9 h-9 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition"
            title="تسجيل الخروج"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
