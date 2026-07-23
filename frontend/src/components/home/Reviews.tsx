"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const REVIEWS = [
  {
    quote: "Best Girda in Lolab.",
    name: "Aamir Ahmed",
  },
  {
    quote: "Always fresh every morning.",
    name: "Imran Dar",
  },
  {
    quote: "Our family trusts Mehtab Bakery for every celebration.",
    name: "Farzana Bhat",
  },
  {
    quote: "Warm Kulcha straight from the tandoor — unmatched.",
    name: "Zahid Mir",
  },
] as const;

export function Reviews() {
  const [index, setIndex] = useState(0);
  const count = REVIEWS.length;
  const review = REVIEWS[index];

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const id = window.setInterval(() => go(index + 1), 5000);
    return () => window.clearInterval(id);
  }, [go, index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40 || info.velocity.x < -350) go(index + 1);
    else if (info.offset.x > 40 || info.velocity.x > 350) go(index - 1);
  };

  return (
    <ScrollReveal
      as="section"
      className="bg-background py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-text sm:text-4xl">
            Loved by Our Neighbors
          </h2>
          <p className="mt-3 text-text-muted">
            Words from families across Wavoora Lolab.
          </p>
        </div>

        <div className="relative mx-auto mt-10 max-w-xl">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={review.name}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[var(--radius-xl)] border border-border/60 bg-surface px-6 py-8 text-center shadow-[var(--shadow-soft)] sm:px-10 sm:py-10"
              >
                <p className="text-secondary" aria-label="5 star rating">
                  ★★★★★
                </p>
                <p className="font-heading mt-4 text-2xl leading-snug font-semibold text-text sm:text-3xl">
                  “{review.quote}”
                </p>
                <footer className="mt-5 text-sm font-medium text-text-muted">
                  — {review.name}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </motion.div>

          <div className="mt-5 flex justify-center gap-1.5">
            {REVIEWS.map((item, i) => (
              <button
                key={item.name}
                type="button"
                aria-label={`Review by ${item.name}`}
                onClick={() => go(i)}
                className={[
                  "h-2 rounded-full transition-all",
                  i === index ? "w-5 bg-primary" : "w-2 bg-border",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
