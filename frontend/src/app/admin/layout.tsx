import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: "Admin | Mehtab Bakery",
  description: "Mehtab Bakery admin panel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
