"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { AdminGate } from "@/components/admin/AdminGate";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}
