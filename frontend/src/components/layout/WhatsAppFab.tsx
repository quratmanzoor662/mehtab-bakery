"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const WHATSAPP_URL =
  "https://wa.me/919149706733?text=Hello%20Mehtab%20Bakery%2C%20I%20would%20like%20to%20reserve%20fresh%20bread.";

export function WhatsAppFab() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: [1, 1, 1.07, 1, 1],
      }}
      transition={{
        opacity: { duration: 0.45, delay: 1.1, ease: "easeOut" },
        scale: {
          duration: 10,
          times: [0, 0.82, 0.88, 0.94, 1],
          repeat: Infinity,
          delay: 1.1,
          ease: "easeInOut",
        },
      }}
      className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-card)] transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6 sm:bottom-24"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </motion.a>
  );
}
