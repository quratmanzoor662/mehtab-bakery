"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/constants/products";
import { Button } from "@/components/ui/Button";
import { useReservation } from "@/features/reservation/ReservationContext";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ProductGrid() {
  const { addProduct, items } = useReservation();

  return (
    <section id="breads" className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-semibold text-text sm:text-4xl lg:text-[2.5rem]">
            Our Breads
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
            Handcrafted Kashmiri breads, baked fresh and ready to reserve for
            pickup.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-7 lg:mt-16 lg:grid-cols-4 lg:gap-6"
        >
          {PRODUCTS.map((product) => {
            const inCart = items.find((entry) => entry.productId === product.id);

            return (
              <motion.article
                key={product.id}
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-surface shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  <span className="absolute top-3 left-3 z-10 rounded-full bg-background/95 px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-primary uppercase shadow-[var(--shadow-soft)] backdrop-blur-sm">
                    Fresh Today
                  </span>

                  <span
                    className="absolute top-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-text shadow-[var(--shadow-soft)] ring-2 ring-white/70"
                    aria-label={`Price ₹${product.price}`}
                  >
                    ₹{product.price}
                  </span>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-text/55 via-text/15 to-transparent px-4 pt-16 pb-4 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="pointer-events-auto translate-y-0 opacity-100 transition-all duration-300 ease-out sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => addProduct(product.id)}
                      >
                        {inCart ? "Add more" : "Add Bread"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-heading text-xl font-semibold text-text">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                    {product.description}
                  </p>
                  <p className="mt-3 text-xs text-text-muted">
                    Min. order {product.minOrder} pieces
                  </p>
                  <Button
                    type="button"
                    className="mt-4 w-full sm:hidden"
                    onClick={() => {
                      addProduct(product.id);
                    }}
                  >
                    {inCart ? `In cart · ${inCart.quantity}` : "Add Bread"}
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
