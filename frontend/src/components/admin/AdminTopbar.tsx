"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TopbarProps = {
  title: string;
  onMenu: () => void;
};

export function AdminTopbar({ title, onMenu }: TopbarProps) {
  const { admin } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E8D5C4] bg-[#FFF8F0]/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg border border-[#E8D5C4] bg-white p-2 text-[#2C1810] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-heading text-xl text-[#2C1810] sm:text-2xl">
          {title}
        </h1>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-[#2C1810]">
          {admin?.name ?? "Admin"}
        </p>
        <p className="text-xs text-[#6B5344]">{admin?.email}</p>
      </div>
    </header>
  );
}
