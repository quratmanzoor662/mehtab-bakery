"use client";

import { ReservationProvider } from "@/features/reservation/ReservationContext";
import { StickyReservationBar } from "@/features/reservation/StickyReservationBar";
import { ReservationSheet } from "@/features/reservation/ReservationSheet";
import { ContinueReservationBanner } from "@/features/reservation/ContinueReservationBanner";

export function ReservationShell({ children }: { children: React.ReactNode }) {
  return (
    <ReservationProvider>
      <ContinueReservationBanner />
      {children}
      <StickyReservationBar />
      <ReservationSheet />
    </ReservationProvider>
  );
}
