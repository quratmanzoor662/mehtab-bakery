"use client";

import { type FormEvent, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useReservation } from "@/features/reservation/ReservationContext";
import { PRODUCT_MAP, PICKUP_TIME_SLOTS } from "@/constants/products";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { todayDateInputValue } from "@/lib/reservation";
import type { ReservationStep } from "@/types/reservation";

const STEPS: ReservationStep[] = ["cart", "details", "confirm"];

const STEP_LABELS: Record<ReservationStep, string> = {
  cart: "Reservation Cart",
  details: "Customer Details",
  confirm: "Confirm Reservation",
};

function isDetailsValid(customer: {
  name: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
}) {
  return (
    customer.name.trim().length >= 2 &&
    customer.phone.replace(/\D/g, "").length >= 10 &&
    Boolean(customer.pickupDate) &&
    Boolean(customer.pickupTime)
  );
}

export function ReservationSheet() {
  const {
    items,
    customer,
    step,
    sheetOpen,
    pieceCount,
    subtotal,
    isBulk,
    setQuantity,
    removeProduct,
    updateCustomer,
    closeSheet,
    setStep,
    confirmAndOpenWhatsApp,
    clearReservation,
  } = useReservation();

  const detailsValid = useMemo(() => isDetailsValid(customer), [customer]);
  const minDate = todayDateInputValue();

  const onDetailsSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!detailsValid) return;
    setStep("confirm");
  };

  return (
    <AnimatePresence>
      {sheetOpen ? (
        <motion.div
          key="reservation-sheet"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close reservation"
            className="absolute inset-0 bg-text/40 backdrop-blur-[2px]"
            onClick={closeSheet}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-sheet-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)] sm:rounded-[var(--radius-xl)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-text-muted uppercase">
                  Step {STEPS.indexOf(step) + 1} of {STEPS.length}
                </p>
                <h2
                  id="reservation-sheet-title"
                  className="font-heading mt-1 text-xl font-semibold text-text"
                >
                  {STEP_LABELS[step]}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-[var(--radius-md)] p-2 text-text-muted transition-colors hover:bg-primary/5 hover:text-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {step === "cart" ? (
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-text-muted">
                      Your cart is empty. Add breads from Our Breads to start a
                      reservation.
                    </p>
                  ) : (
                    items.map((item) => {
                      const product = PRODUCT_MAP[item.productId];
                      return (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border/60 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-heading font-semibold text-text">
                              {product.name}
                            </p>
                            <p className="text-xs text-text-muted">
                              ₹{product.price} · min {product.minOrder}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              className="rounded-full border border-border p-1.5 text-text hover:bg-primary/5"
                              aria-label={`Decrease ${product.name}`}
                              onClick={() =>
                                setQuantity(item.productId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="rounded-full border border-border p-1.5 text-text hover:bg-primary/5"
                              aria-label={`Increase ${product.name}`}
                              onClick={() =>
                                setQuantity(item.productId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="rounded-[var(--radius-md)] p-2 text-text-muted hover:bg-primary/5 hover:text-primary"
                            aria-label={`Remove ${product.name}`}
                            onClick={() => removeProduct(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })
                  )}

                  {items.length > 0 ? (
                    <div className="rounded-[var(--radius-md)] bg-background px-4 py-3 text-sm">
                      <div className="flex justify-between text-text">
                        <span>{pieceCount} pieces</span>
                        <span className="font-semibold">Est. ₹{subtotal}</span>
                      </div>
                      {isBulk ? (
                        <p className="mt-2 text-xs text-accent">
                          Bulk order (over 50 pieces). Final price will be
                          confirmed on WhatsApp (min ₹7/piece if custom).
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === "details" ? (
                <form
                  id="reservation-details-form"
                  onSubmit={onDetailsSubmit}
                  className="space-y-4"
                >
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-text">Name</span>
                    <input
                      required
                      value={customer.name}
                      onChange={(event) =>
                        updateCustomer({ name: event.target.value })
                      }
                      className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-text">Phone</span>
                    <input
                      required
                      type="tel"
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomer({ phone: event.target.value })
                      }
                      className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="+91 ..."
                      autoComplete="tel"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-text">
                        Pickup date
                      </span>
                      <input
                        required
                        type="date"
                        min={minDate}
                        value={customer.pickupDate}
                        onChange={(event) =>
                          updateCustomer({ pickupDate: event.target.value })
                        }
                        className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-text">
                        Pickup time
                      </span>
                      <select
                        required
                        value={customer.pickupTime}
                        onChange={(event) =>
                          updateCustomer({ pickupTime: event.target.value })
                        }
                        className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select time</option>
                        {PICKUP_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-text">
                      Notes (optional)
                    </span>
                    <textarea
                      value={customer.notes}
                      onChange={(event) =>
                        updateCustomer({ notes: event.target.value })
                      }
                      rows={3}
                      className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Any special request for pickup"
                    />
                  </label>
                </form>
              ) : null}

              {step === "confirm" ? (
                <div className="space-y-4 text-sm">
                  <div className="rounded-[var(--radius-md)] border border-border/60 p-4">
                    <p className="font-heading text-base font-semibold text-text">
                      Order summary
                    </p>
                    <ul className="mt-3 space-y-2 text-text-muted">
                      {items.map((item) => {
                        const product = PRODUCT_MAP[item.productId];
                        return (
                          <li
                            key={item.productId}
                            className="flex justify-between gap-3"
                          >
                            <span>
                              {product.name} × {item.quantity}
                            </span>
                            <span className="text-text">
                              ₹{product.price * item.quantity}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-3 flex justify-between border-t border-border/60 pt-3 font-semibold text-text">
                      <span>{pieceCount} pieces</span>
                      <span>Est. ₹{subtotal}</span>
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-md)] border border-border/60 p-4 text-text-muted">
                    <p>
                      <span className="font-medium text-text">Name:</span>{" "}
                      {customer.name}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium text-text">Phone:</span>{" "}
                      {customer.phone}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium text-text">Pickup:</span>{" "}
                      {customer.pickupDate} at {customer.pickupTime}
                    </p>
                    {customer.notes.trim() ? (
                      <p className="mt-1">
                        <span className="font-medium text-text">Notes:</span>{" "}
                        {customer.notes}
                      </p>
                    ) : null}
                  </div>

                  <p className="text-xs leading-relaxed text-text-muted">
                    Confirming opens WhatsApp with your reservation. The bakery
                    must confirm before it is final. If WhatsApp doesn&apos;t
                    send, your reservation stays saved for your next visit.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-border/70 px-5 py-4 sm:flex-row sm:justify-between">
              {step === "cart" ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearReservation}
                    disabled={items.length === 0}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep("details")}
                    disabled={items.length === 0}
                  >
                    Continue
                  </Button>
                </>
              ) : null}

              {step === "details" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("cart")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    form="reservation-details-form"
                    disabled={!detailsValid}
                  >
                    Review reservation
                  </Button>
                </>
              ) : null}

              {step === "confirm" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("details")}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={confirmAndOpenWhatsApp}
                    className="bg-[#25D366] hover:bg-[#1ebe57] focus-visible:ring-[#25D366]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Send on WhatsApp
                  </Button>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
