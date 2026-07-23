"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { PRODUCTS, MIN_RESERVATION_AMOUNT } from "@/constants/products";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useToast } from "@/components/ui/Toast";
import { useReservation } from "@/features/reservation/ReservationContext";
import { useBakerySettings } from "@/contexts/SettingsContext";
import { getStockUrgency, isAvailable } from "@/data/today";
import type { Product } from "@/types/product";
import { PickupTimer } from "@/components/home/PickupTimer";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const urgencyStyles = {
  warn: "bg-orange-500 text-white",
  critical: "bg-red-600 text-white",
  soldout: "bg-text/80 text-white",
  ok: "bg-secondary text-text",
} as const;

function ProductQuantityControl({ product }: { product: Product }) {
  const { addProduct, setQuantity, items } = useReservation();
  const { showAdded } = useToast();
  const { orderingAllowed, futurePickupOnly } = useBakerySettings();
  const inCart = items.find((entry) => entry.productId === product.id);
  const quantity = inCart?.quantity ?? 0;
  const available = isAvailable(product.id);

  if (!orderingAllowed) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-14 sm:px-4 sm:pb-4">
        <div className="relative rounded-[var(--radius-md)] bg-text/75 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm">
          Ordering Unavailable
        </div>
      </div>
    );
  }

  if (!available) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-14 sm:px-4 sm:pb-4">
        <div className="relative rounded-[var(--radius-md)] bg-text/75 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm">
          Sold Out Today
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-14 sm:px-4 sm:pb-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-text/60 via-text/20 to-transparent"
      />

      <div className="relative">
        {futurePickupOnly ? (
          <p className="mb-2 text-center text-[0.65rem] font-semibold tracking-wide text-white uppercase drop-shadow">
            Pickup tomorrow
          </p>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          {quantity === 0 ? (
            <motion.div
              key="reserve"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                type="button"
                className="h-12 w-full text-base sm:h-11"
                onClick={() => {
                  addProduct(product.id);
                  showAdded(product.name);
                }}
              >
                {futurePickupOnly ? "Reserve for Tomorrow" : "Reserve"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-12 items-center justify-between gap-2 rounded-[var(--radius-md)] bg-surface/95 px-1.5 shadow-[var(--shadow-soft)] backdrop-blur-md sm:h-11"
            >
              <button
                type="button"
                aria-label={`Decrease ${product.name} quantity`}
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-text transition-colors hover:bg-primary/10 active:bg-primary/15 sm:h-10 sm:w-10"
              >
                <Minus className="h-5 w-5" strokeWidth={2.25} />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={quantity}
                    initial={{ opacity: 0, y: 10, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: [1, 1.12, 1] }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                      scale: { times: [0, 0.45, 1] },
                    }}
                    className="text-sm font-semibold text-text sm:text-[0.95rem]"
                    aria-live="polite"
                  >
                    {quantity} {quantity === 1 ? "Piece" : "Pieces"}
                  </motion.p>
                </AnimatePresence>
              </div>

              <button
                type="button"
                aria-label={`Increase ${product.name} quantity`}
                onClick={() => {
                  setQuantity(product.id, quantity + 1);
                  showAdded(product.name);
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-text transition-colors hover:bg-primary/10 active:bg-primary/15 sm:h-10 sm:w-10"
              >
                <Plus className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ProductGrid() {
  return (
    <section id="breads" className="bg-background py-12 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[1.75rem] font-semibold text-text sm:text-4xl lg:text-[2.5rem]">
            Our Breads
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted sm:mt-4 sm:text-lg">
            Mix any breads you like. Minimum reservation total is ₹
            {MIN_RESERVATION_AMOUNT}.
          </p>
        </ScrollReveal>

        <div className="mt-6 sm:mt-10">
          <PickupTimer />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="mt-8 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-7 lg:mt-16 lg:grid-cols-4 lg:gap-6"
        >
          {PRODUCTS.map((product) => {
            const urgency = getStockUrgency(product.id);
            const available = isAvailable(product.id);

            return (
              <motion.article
                key={product.id}
                variants={item}
                whileHover={{ y: available ? -6 : 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={[
                  "group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-surface shadow-[var(--shadow-soft)] transition-shadow duration-300",
                  available ? "hover:shadow-[var(--shadow-card)]" : "opacity-95",
                ].join(" ")}
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-primary/5 sm:aspect-[4/5]">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={[
                      "object-cover transition-transform duration-700 ease-out",
                      available ? "group-hover:scale-110" : "grayscale-[35%]",
                    ].join(" ")}
                  />

                  {available ? (
                    <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-white uppercase shadow-[var(--shadow-soft)] sm:top-3 sm:left-3 sm:px-3 sm:text-[0.7rem]">
                      Fresh Today
                    </span>
                  ) : (
                    <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-white uppercase shadow-[var(--shadow-soft)] sm:top-3 sm:left-3 sm:px-3 sm:text-[0.7rem]">
                      Sold Out
                    </span>
                  )}

                  <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5 sm:top-3 sm:right-3 sm:gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-text shadow-[var(--shadow-soft)] ring-2 ring-white/70 sm:h-12 sm:w-12">
                      ₹{product.price}
                    </span>
                    {urgency ? (
                      <span
                        className={[
                          "max-w-[6.5rem] rounded-full px-2 py-1 text-center text-[0.6rem] leading-tight font-bold tracking-wide uppercase shadow-[var(--shadow-soft)] sm:max-w-[7.5rem] sm:px-2.5 sm:text-[0.65rem]",
                          urgencyStyles[urgency.tone],
                        ].join(" ")}
                      >
                        {urgency.label}
                      </span>
                    ) : null}
                  </div>

                  <ProductQuantityControl product={product} />
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <h3 className="font-heading text-lg font-semibold text-text sm:text-xl">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-text-muted sm:mt-2">
                    {product.description}
                  </p>
                  <p className="mt-2 text-xs text-text-muted sm:mt-3">
                    Mix any breads · Min. ₹{MIN_RESERVATION_AMOUNT} total
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
