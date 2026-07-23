"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import {
  fetchDashboard,
  type DashboardResponse,
} from "@/services/dashboard";
import { getErrorMessage } from "@/services/api";
import { statusBadgeClass } from "@/services/order";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchDashboard();
        if (alive) setData(res);
      } catch (err) {
        if (alive) setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <p className="text-[#6B5344]">Loading dashboard…</p>;
  }

  if (error || !data) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || "No data"}
      </p>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#6B5344]">Today · {s.date}</p>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-[#8B4513] hover:underline"
        >
          View all orders →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Orders" value={s.today_orders} />
        <StatCard label="Today's Revenue" value={`₹${s.today_revenue}`} />
        <StatCard label="Pending" value={s.pending_orders} />
        <StatCard label="Preparing" value={s.preparing_orders ?? 0} />
        <StatCard label="Confirmed" value={s.confirmed_orders} />
        <StatCard label="Ready" value={s.ready_orders} />
        <StatCard label="Collected" value={s.collected_orders} />
        <StatCard label="Cancelled" value={s.cancelled_orders} />
        <StatCard label="Total Products" value={s.products} />
        <StatCard label="Available" value={s.available_products} />
        <StatCard label="Sold Out" value={s.sold_out_products} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E8D5C4] bg-white">
        <div className="flex items-center justify-between border-b border-[#E8D5C4] px-4 py-3">
          <h2 className="font-heading text-xl">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#FFF8F0] text-[#6B5344]">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[#6B5344]"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                data.recent_orders.map((row) => (
                  <tr
                    key={row.id || row.reservation_number}
                    className="border-t border-[#E8D5C4]/70"
                  >
                    <td className="px-4 py-3 font-medium">
                      {row.reservation_number}
                    </td>
                    <td className="px-4 py-3">{row.customer}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{row.total_amount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(row.reservation_number)}`}
                        className="text-xs font-medium text-[#8B4513] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
