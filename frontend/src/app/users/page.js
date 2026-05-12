"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Mail,
  Globe,
  Users as UsersIcon,
  ArrowLeft,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
  useEffect(() => {
    document.title = "العملاء";
  }, []);

  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/users");
      setClients(data);
    } catch (err) {
      setError(err.message || "تعذر تحميل العملاء");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.email, c.country]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [clients, search]);

  return (
    <div>
      <PageHeader
        eyebrow="إدارة"
        title="العملاء"
        subtitle="قائمة العملاء المسجلين ومعلومات الاتصال الخاصة بهم"
        actions={
          <Link href="/create-user">
            <Button startIcon={<UserPlus size={16} />}>إضافة عميل</Button>
          </Link>
        }
      />

      <div className="surface p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحث بالاسم أو البريد أو الدولة..."
          />
        </div>
        <div className="text-xs text-slate-500">
          {!loading && !error ? (
            <span>
              عرض{" "}
              <span className="font-bold text-slate-700 tabular">
                {filtered.length}
              </span>{" "}
              من{" "}
              <span className="font-bold text-slate-700 tabular">
                {clients.length}
              </span>
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={search ? "لم يتم العثور على نتائج" : "لا يوجد عملاء بعد"}
          description={
            search
              ? "جرب كلمات بحث مختلفة أو امسح حقل البحث."
              : "أضف عميلك الأول لتظهر بياناته هنا."
          }
          action={
            !search ? (
              <Link href="/create-user">
                <Button startIcon={<UserPlus size={16} />}>
                  إضافة أول عميل
                </Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Link
              key={client._id}
              href={`/users/${client._id}`}
              className="surface p-5 text-right hover:shadow-[0_14px_28px_-14px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
            >
              <div className="flex items-center gap-4">
                <Avatar
                  src={client.image}
                  imageUrl={client.imageUrl}
                  name={client.name}
                  className="w-14 h-14 text-lg"
                  ringed
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-slate-900 truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Globe size={13} className="text-slate-400" />
                  {client.country}
                </span>
                <span className="text-xs text-indigo-600 font-semibold inline-flex items-center gap-1">
                  عرض التفاصيل
                  <ArrowLeft size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
