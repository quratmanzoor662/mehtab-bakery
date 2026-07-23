"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/settings": "Settings",
  "/admin/profile": "Profile",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  let title = TITLES[pathname] ?? "Admin";
  if (pathname.startsWith("/admin/orders/") && pathname !== "/admin/orders") {
    title = "Order Details";
  } else if (pathname.startsWith("/admin/products")) {
    title = "Products";
  }

  return (
    <div className="flex min-h-screen bg-[#FFF8F0] text-[#2C1810]">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
