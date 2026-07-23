"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/services/api";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#F5E6D3,transparent_55%),linear-gradient(180deg,#FFF8F0,#F3E7DA)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#E8D5C4] bg-white/90 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8B4513]">
          Mehtab Bakery
        </p>
        <h1 className="mt-2 font-heading text-3xl text-[#2C1810]">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-[#6B5344]">
          Sign in to manage products, reservations, and settings.
        </p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2.5 outline-none focus:border-[#8B4513]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2.5 outline-none focus:border-[#8B4513]"
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#8B4513] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B3410] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
