"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReservation } from "@/features/reservation/ReservationContext";
import { Button } from "@/components/ui/Button";
import { useBakerySettings } from "@/contexts/SettingsContext";

/** Sticky cart — only while a reservation is still pending (not after WhatsApp). */
export function StickyReservationBar() {
  const {
    hasPendingReservation,
    pieceCount,
    subtotal,
    openSheet,
    sheetOpen,
  } = useReservation();
  const { orderingAllowed } = useBakerySettings();

  return (
    <AnimatePresence>
      {hasPendingReservation && !sheetOpen && orderingAllowed ? (
        <motion.div
          key="sticky-reservation-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-border/70 bg-surface/95 px-3 py-2.5 shadow-[var(--shadow-card)] backdrop-blur-md sm:gap-3 sm:px-5 sm:py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {pieceCount} piece{pieceCount === 1 ? "" : "s"} reserved
              </p>
              <p className="text-xs text-text-muted">Est. ₹{subtotal}</p>
            </div>
            <Button
              type="button"
              onClick={() => openSheet("cart")}
              className="shrink-0 px-3 text-sm sm:px-4"
            >
              View Cart
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
