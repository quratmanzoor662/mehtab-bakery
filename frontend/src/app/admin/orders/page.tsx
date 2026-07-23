"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getErrorMessage } from "@/services/api";
import {
  ORDER_STATUSES,
  fetchOrders,
  statusBadgeClass,
  type Order,
} from "@/services/order";

const DATE_PRESETS = [
  { value: "", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "custom", label: "Custom Range" },
] as const;

function pickupLabel(date: string, time: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (date === today) return `Today ${time}`;
  if (date === yesterday) return `Yesterday ${time}`;
  return `${date} · ${time}`;
}

function rangeLabel(page: number, limit: number, total: number) {
  if (total === 0) return "0";
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `${start}–${end} of ${total}`;
}

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchOrders({
        status: status || undefined,
        search: search || undefined,
        date: datePreset || undefined,
        date_from:
          datePreset === "custom" && dateFrom ? dateFrom : undefined,
        date_to: datePreset === "custom" && dateTo ? dateTo : undefined,
        page,
        limit,
      });
      setRows(res.reservations);
      setTotal(res.total);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }, [page, status, search, datePreset, dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="space-y-4 print:hidden">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form onSubmit={onSearch} className="flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5344]"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order, name, or phone…"
              className="w-full rounded-xl border border-[#E8D5C4] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#8B4513]"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-[#E8D5C4] bg-white px-4 text-sm hover:bg-[#FFF8F0]"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-xl border border-[#E8D5C4] bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={datePreset}
            onChange={(e) => {
              setPage(1);
              setDatePreset(e.target.value);
            }}
            className="rounded-xl border border-[#E8D5C4] bg-white px-3 py-2.5 text-sm outline-none"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value || "all"} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {datePreset === "custom" ? (
        <div className="flex flex-wrap gap-2">
          <label className="text-sm text-[#6B5344]">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPage(1);
                setDateFrom(e.target.value);
              }}
              className="ml-2 rounded-xl border border-[#E8D5C4] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[#6B5344]">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPage(1);
                setDateTo(e.target.value);
              }}
              className="ml-2 rounded-xl border border-[#E8D5C4] bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["", ...ORDER_STATUSES].map((s) => {
          const active = status === s;
          const label = s || "All";
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                setPage(1);
                setStatus(s);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-[#8B4513] text-white"
                  : "border border-[#E8D5C4] bg-white text-[#6B5344] hover:bg-[#FFF8F0]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#E8D5C4] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#FFF8F0] text-[#6B5344]">
              <tr>
                <th className="px-4 py-3 font-medium">Order No</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-[#6B5344]"
                  >
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-[#6B5344]"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-t border-[#E8D5C4]/70">
                    <td className="px-4 py-3 font-medium">
                      {r.reservation_number}
                    </td>
                    <td className="px-4 py-3">{r.customer?.name}</td>
                    <td className="px-4 py-3">{r.customer?.phone}</td>
                    <td className="px-4 py-3">
                      {pickupLabel(r.pickup_date, r.pickup_time)}
                    </td>
                    <td className="px-4 py-3">₹{r.total_amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(r.reservation_number)}`}
                        className="rounded-lg border border-[#E8D5C4] px-2.5 py-1 text-xs hover:bg-[#FFF8F0]"
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

        <div className="flex items-center justify-between border-t border-[#E8D5C4] px-4 py-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-[#E8D5C4] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[#6B5344]">
            Showing {rangeLabel(page, limit, total)}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[#E8D5C4] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
