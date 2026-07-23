"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AdminShell } from "@/components/admin/AdminShell";

export function AdminGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isLogin) {
      router.replace("/admin/login");
      return;
    }
    if (isAuthenticated && isLogin) {
      router.replace("/admin");
      return;
    }
    setReady(true);
  }, [loading, isAuthenticated, isLogin, router]);

  if (loading || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] text-[#6B5344]">
        Loading…
      </div>
    );
  }

  if (isLogin) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
