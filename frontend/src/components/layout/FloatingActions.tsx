"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { CONTACT, getWhatsAppChatUrl } from "@/constants/contact";
import { useReservation } from "@/features/reservation/ReservationContext";

export function FloatingActions() {
  const { hasPendingReservation } = useReservation();

  // When the sticky cart is open, park FABs on the left so they don't cover "View Cart".
  const side = hasPendingReservation
    ? "left-3 right-auto sm:left-6"
    : "right-3 left-auto sm:right-6";

  const bottom = hasPendingReservation
    ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))]"
    : "bottom-[max(1rem,env(safe-area-inset-bottom,0px))] sm:bottom-6";

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2.5 sm:gap-3 ${side} ${bottom}`}
    >
      <motion.a
        href={`tel:${CONTACT.phoneTel}`}
        aria-label="Call Mehtab Bakery"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.35 }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-card)] transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Phone className="h-5 w-5" strokeWidth={2} aria-hidden />
      </motion.a>

      <motion.a
        href={getWhatsAppChatUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: [1, 1, 1.07, 1, 1],
        }}
        transition={{
          opacity: { duration: 0.45, delay: 1.15, ease: "easeOut" },
          scale: {
            duration: 10,
            times: [0, 0.82, 0.88, 0.94, 1],
            repeat: Infinity,
            delay: 1.15,
            ease: "easeInOut",
          },
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-card)] transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </motion.a>
    </div>
  );
}
