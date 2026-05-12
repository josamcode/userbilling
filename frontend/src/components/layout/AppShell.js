"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/auth-context";
import { Loading } from "@/components/ui/empty";

const PUBLIC_ROUTES = ["/login"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r);

  useEffect(() => {
    if (status === "guest" && !isPublic) {
      router.replace("/login");
    } else if (status === "authed" && pathname === "/login") {
      router.replace("/");
    }
  }, [status, isPublic, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isPublic) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (status !== "authed") {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block no-print">
        <Sidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden fade-in no-print">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full pop-in">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-slate-200/70 sticky top-0 z-20 no-print">
          <button
            aria-label="القائمة"
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-700"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="font-extrabold tracking-tight text-slate-900">
            UserBilling
          </p>
          <span className="w-9" />
        </header>
        <div className="flex-1 px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-[1280px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
