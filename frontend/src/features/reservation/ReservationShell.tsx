"use client";

import { ReservationProvider } from "@/features/reservation/ReservationContext";
import { StickyReservationBar } from "@/features/reservation/StickyReservationBar";
import { ReservationSheet } from "@/features/reservation/ReservationSheet";
import { ContinueReservationBanner } from "@/features/reservation/ContinueReservationBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ClosureBanner } from "@/components/home/ClosureBanner";

export function ReservationShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ReservationProvider>
        <ToastProvider>
          <ContinueReservationBanner />
          <ClosureBanner />
          {children}
          <StickyReservationBar />
          <ReservationSheet />
        </ToastProvider>
      </ReservationProvider>
    </SettingsProvider>
  );
}
