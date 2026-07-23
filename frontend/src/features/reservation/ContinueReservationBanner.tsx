"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReservation } from "@/features/reservation/ReservationContext";
import { Button } from "@/components/ui/Button";
import { useBakerySettings } from "@/contexts/SettingsContext";

/** Shown only for an unfinished (pending) reservation — never after WhatsApp confirm. */
export function ContinueReservationBanner() {
  const {
    hasPendingReservation,
    sheetOpen,
    pieceCount,
    continueReservation,
    clearReservation,
  } = useReservation();
  const { orderingAllowed } = useBakerySettings();

  const show = hasPendingReservation && !sheetOpen && orderingAllowed;

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
              You have a pending reservation ({pieceCount} pieces). Continue to
              finish, or discard to start fresh.
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
