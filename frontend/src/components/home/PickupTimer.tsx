"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { todayBoard } from "@/data/today";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type TimerState =
  | { open: true; hours: number; minutes: number; seconds: number }
  | { open: false };

function getTimerState(now = new Date()): TimerState {
  const { opensAtHour, closesAtHour } = todayBoard.reservation;
  const hour = now.getHours();

  if (hour < opensAtHour || hour >= closesAtHour) {
    return { open: false };
  }

  const close = new Date(now);
  close.setHours(closesAtHour, 0, 0, 0);
  const diff = Math.max(0, close.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return { open: true, hours, minutes, seconds };
}

export function PickupTimer() {
  const [state, setState] = useState<TimerState>(() => getTimerState());

  useEffect(() => {
    const id = window.setInterval(() => setState(getTimerState()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ScrollReveal>
      <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-border/70 bg-surface px-4 py-3.5 text-center shadow-[var(--shadow-soft)] sm:max-w-none sm:px-8 sm:py-5">
        {state.open ? (
          <>
            <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-accent uppercase sm:text-xs">
              Reserve Before
            </p>
            <motion.p
              key={`${state.hours}-${state.minutes}`}
              initial={{ opacity: 0.7, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading mt-1 text-2xl font-semibold whitespace-nowrap tabular-nums text-text sm:text-4xl"
            >
              {state.hours}h {String(state.minutes).padStart(2, "0")}m left
            </motion.p>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">
              Pickup window closes at 7:00 PM
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-xl font-semibold text-primary sm:text-3xl">
              Reservations Closed
            </p>
            <p className="mt-2 text-xs text-text-muted sm:text-sm">
              We&apos;ll be back tomorrow at 5:00 AM.
            </p>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}
