"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReservation } from "@/features/reservation/ReservationContext";
import { Button } from "@/components/ui/Button";

export function ContinueReservationBanner() {
  const {
    hasDraft,
    status,
    sheetOpen,
    pieceCount,
    continueReservation,
    clearReservation,
  } = useReservation();

  const show =
    hasDraft && status === "awaiting_whatsapp" && !sheetOpen;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="continue-reservation"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="border-b border-secondary/30 bg-secondary/15"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="text-sm text-text">
              You have a saved reservation ({pieceCount} pieces). Continue where
              you left off — your order is still saved if WhatsApp didn&apos;t
              send.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={clearReservation}
              >
                Discard
              </Button>
              <Button type="button" size="md" onClick={continueReservation}>
                Continue Reservation
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
