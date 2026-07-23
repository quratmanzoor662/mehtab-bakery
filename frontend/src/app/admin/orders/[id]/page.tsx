"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { OrderInvoice } from "@/components/admin/OrderInvoice";
import { getErrorMessage } from "@/services/api";
import {
  ORDER_ACTIONS,
  fetchOrder,
  statusBadgeClass,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/services/order";

function formatTimelineTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOrder(id);
      setOrder(data);
    } catch (err) {
      setError(getErrorMessage(err, "Order not found"));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(next: OrderStatus) {
    if (!order) return;
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order._id, next);
      setOrder(updated);
    } catch (err) {
      alert(getErrorMessage(err, "Status update failed"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-[#6B5344]">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Order not found"}
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-[#8B4513]"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>
    );
  }

  const actions = ORDER_ACTIONS[order.status] ?? [];
  const history = order.status_history ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-[#6B5344] hover:text-[#2C1810]"
          >
            <ArrowLeft size={16} /> Orders
          </Link>
          <h2 className="font-heading mt-1 text-2xl text-[#2C1810]">
            {order.reservation_number}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(order.status)}`}
          >
            {order.status}
          </span>
          <OrderInvoice order={order} />
        </div>
      </div>

      <div className="grid gap-4 print:hidden lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5">
            <h3 className="font-heading text-lg">Customer</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[#6B5344]">Name</dt>
                <dd className="mt-0.5 font-medium">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-[#6B5344]">Phone</dt>
                <dd className="mt-0.5 font-medium">
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-[#8B4513] hover:underline"
                  >
                    {order.customer.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[#6B5344]">Pickup</dt>
                <dd className="mt-0.5 font-medium">
                  {order.pickup_date} · {order.pickup_time}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B5344]">Notes</dt>
                <dd className="mt-0.5 font-medium">
                  {order.notes?.trim() || "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5">
            <h3 className="font-heading text-lg">Items</h3>
            <ul className="mt-3 divide-y divide-[#E8D5C4]/70">
              {order.items.map((item) => (
                <li
                  key={`${item.product_id}-${item.name}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span>
                    <span className="font-medium">{item.quantity} × </span>
                    {item.name}
                    <span className="ml-2 text-[#6B5344]">
                      ₹{item.price} each
                    </span>
                  </span>
                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-[#E8D5C4] pt-3 text-base font-semibold">
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5">
            <h3 className="font-heading text-lg">Update Status</h3>
            <p className="mt-1 text-sm text-[#6B5344]">
              Current: <strong>{order.status}</strong>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.length === 0 ? (
                <p className="text-sm text-[#6B5344]">No further actions</p>
              ) : (
                actions.map((action) => (
                  <button
                    key={action.next}
                    type="button"
                    disabled={busy}
                    onClick={() => void changeStatus(action.next)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50 ${action.tone}`}
                  >
                    {action.label}
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5">
            <h3 className="font-heading text-lg">Timeline</h3>
            <ol className="mt-4 space-y-0">
              {history.map((entry, index) => {
                const isLast = index === history.length - 1;
                return (
                  <li key={`${entry.status}-${entry.time}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          isLast ? "bg-[#8B4513]" : "bg-[#D4A017]"
                        }`}
                      />
                      {!isLast ? (
                        <span className="my-1 w-px flex-1 bg-[#E8D5C4]" />
                      ) : null}
                    </div>
                    <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                      <p className="text-sm font-medium text-[#2C1810]">
                        {entry.status}
                      </p>
                      <p className="text-xs text-[#6B5344]">
                        {formatTimelineTime(entry.time)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
