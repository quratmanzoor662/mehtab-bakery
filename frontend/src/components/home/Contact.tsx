"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { CONTACT, getWhatsAppChatUrl } from "@/constants/contact";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type ContactCard = {
  title: string;
  body: string;
  href?: string;
  icon: ReactNode;
};

const cards: ContactCard[] = [
  {
    title: "Address",
    body: "Jamia Masjid, Wavoora Lolab, Kupwara, Kashmir",
    icon: <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
  },
  {
    title: "Hours",
    body: "Morning 6:00 AM – 12:00 PM · Evening 1:00 PM – 7:00 PM",
    icon: <Clock className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
  },
  {
    title: "Phone",
    body: CONTACT.phoneDisplay,
    icon: <Phone className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
    href: `tel:${CONTACT.phoneTel}`,
  },
  {
    title: "WhatsApp",
    body: "Message us to reserve fresh bread",
    icon: <WhatsAppIcon className="h-5 w-5" />,
    href: getWhatsAppChatUrl(),
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export function Contact() {
  return (
    <section id="contact" className="bg-background py-12 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-[1.75rem] font-semibold text-text sm:text-4xl lg:text-[2.5rem]">
            Visit or Reach Us
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted sm:mt-4 sm:text-lg">
            Find us in Wavoora Lolab, or get in touch to reserve your bread.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-4"
        >
          {cards.map((card) => {
            const inner = (
              <>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  {card.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-text">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {card.body}
                </p>
              </>
            );

            return (
              <motion.div key={card.title} variants={item}>
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      card.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block h-full rounded-[var(--radius-lg)] border border-border/60 bg-surface p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] sm:p-6"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="h-full rounded-[var(--radius-lg)] border border-border/60 bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
                    {inner}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
