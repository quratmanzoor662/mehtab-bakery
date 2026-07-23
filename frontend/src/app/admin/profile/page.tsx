"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AdminProfilePage() {
  const { admin, logout } = useAuth();

  return (
    <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-[#E8D5C4] bg-white p-6">
      <h2 className="font-heading text-2xl">
        Profile
      </h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[#6B5344]">Name</dt>
          <dd className="mt-0.5 font-medium">{admin?.name}</dd>
        </div>
        <div>
          <dt className="text-[#6B5344]">Email</dt>
          <dd className="mt-0.5 font-medium">{admin?.email}</dd>
        </div>
        <div>
          <dt className="text-[#6B5344]">Role</dt>
          <dd className="mt-0.5 font-medium capitalize">{admin?.role}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-xl border border-[#E8D5C4] px-4 py-2.5 text-sm hover:bg-[#FFF8F0]"
      >
        Logout
      </button>
    </div>
  );
}
