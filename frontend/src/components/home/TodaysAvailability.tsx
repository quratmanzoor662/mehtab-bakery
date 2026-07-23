"use client";

import { motion } from "framer-motion";
import { PRODUCTS } from "@/constants/products";
import { isAvailable, todayBoard } from "@/data/today";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function TodaysAvailability() {
  return (
    <ScrollReveal as="section" className="bg-background py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-border/80 bg-[#f7efe3] shadow-[var(--shadow-card)]">
          <div className="border-b border-dashed border-primary/25 bg-primary/10 px-5 py-4 text-center">
            <p className="font-heading text-2xl font-semibold text-primary">
              Today&apos;s Tandoor
            </p>
            <p className="mt-1 text-xs font-medium tracking-[0.16em] text-text-muted uppercase">
              Fresh notice board
            </p>
          </div>

          <ul className="divide-y divide-dashed divide-primary/15 px-2 py-2">
            {PRODUCTS.map((product, index) => {
              const available = isAvailable(product.id);
              return (
                <motion.li
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index, duration: 0.35 }}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                        available
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-red-500/15 text-red-700",
                      ].join(" ")}
                      aria-hidden
                    >
                      {available ? "✓" : "✕"}
                    </span>
                    <span
                      className={[
                        "font-heading text-lg font-semibold",
                        available ? "text-text" : "text-text-muted line-through",
                      ].join(" ")}
                    >
                      {product.name}
                    </span>
                  </div>
                  <span
                    className={[
                      "text-xs font-semibold tracking-wide uppercase",
                      available ? "text-emerald-700" : "text-red-700",
                    ].join(" ")}
                  >
                    {available ? "Fresh" : "Sold Out"}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          <p className="border-t border-dashed border-primary/20 px-5 py-3 text-center text-[0.7rem] text-text-muted">
            Updated live from today&apos;s board ·{" "}
            {Object.values(todayBoard.availability).filter(Boolean).length} fresh
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
