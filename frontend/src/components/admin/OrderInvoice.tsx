"use client";

import type { Order } from "@/services/order";

type InvoiceProps = {
  order: Order;
};

function formatWhen(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Printable bakery invoice — opens browser print dialog. */
export function OrderInvoice({ order }: InvoiceProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-xl border border-[#E8D5C4] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#FFF8F0] print:hidden"
      >
        Print Invoice
      </button>

      <div id="order-invoice" className="order-invoice-print">
        <div className="mx-auto max-w-md p-8 font-sans text-sm text-black">
          <header className="border-b border-black pb-4 text-center">
            <h1 className="font-serif text-2xl font-semibold">Mehtab Bakery</h1>
            <p className="mt-1 text-xs">Wavoora Lolab, Kashmir</p>
            <p className="mt-3 text-base font-semibold">
              Order {order.reservation_number}
            </p>
          </header>

          <section className="mt-4 space-y-1 border-b border-dashed border-black/40 pb-4">
            <p>
              <span className="font-semibold">Customer:</span>{" "}
              {order.customer.name}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {order.customer.phone}
            </p>
            <p>
              <span className="font-semibold">Pickup:</span> {order.pickup_date}{" "}
              · {order.pickup_time}
            </p>
            {order.notes ? (
              <p>
                <span className="font-semibold">Notes:</span> {order.notes}
              </p>
            ) : null}
            <p className="text-xs text-black/60">
              Placed {formatWhen(order.created_at)}
            </p>
          </section>

          <section className="mt-4 border-b border-dashed border-black/40 pb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/20 text-xs uppercase">
                  <th className="py-1 font-semibold">Item</th>
                  <th className="py-1 text-right font-semibold">Qty</th>
                  <th className="py-1 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={`${item.product_id}-${item.name}`}>
                    <td className="py-1.5">{item.name}</td>
                    <td className="py-1.5 text-right">{item.quantity}</td>
                    <td className="py-1.5 text-right">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-4 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>₹{order.total_amount}</span>
          </section>

          <p className="mt-6 text-center text-xs">
            Status: {order.status} · Thank you for choosing Mehtab Bakery
          </p>
        </div>
      </div>
    </>
  );
}
