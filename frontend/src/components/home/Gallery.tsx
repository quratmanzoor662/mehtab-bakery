"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SLIDES = [
  {
    src: "/images/shop/shopimage1.jpeg",
    caption: "Morning Baking",
  },
  {
    src: "/images/shop/shopimage2.jpeg",
    caption: "Fresh Girda",
  },
  {
    src: "/images/shop/shopimage3.jpeg",
    caption: "Traditional Tandoor",
  },
  {
    src: "/images/shop/shopimage4.jpeg",
    caption: "Preparing Tailwoor",
  },
  {
    src: "/images/shop/shopimage5.jpeg",
    caption: "Bakery Counter",
  },
  {
    src: "/images/shop/shopimage6.jpeg",
    caption: "Fresh Kulchas",
  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function Gallery() {
  const [index, setIndex] = useState(0);
  const count = SLIDES.length;
  const slide = SLIDES[index];

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const id = window.setInterval(() => go(index + 1), 5000);
    return () => window.clearInterval(id);
  }, [go, index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -48 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 48 || info.velocity.x > 400) go(index - 1);
  };

  return (
    <ScrollReveal
      as="section"
      className="bg-background py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-text sm:text-4xl">
            From Our Bakery
          </h2>
          <p className="mt-3 text-text-muted">
            Real mornings in Wavoora Lolab — swipe through the tandoor floor.
          </p>
        </div>

        <div className="relative mx-auto mt-10 max-w-3xl">
          <motion.div
            className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] sm:aspect-[16/10]"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.src}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.src}
                  alt={slide.caption}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="pointer-events-none object-cover select-none"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-text/70 to-transparent px-5 py-5">
                  <p className="font-heading text-xl font-semibold text-white sm:text-2xl">
                    {slide.caption}
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Photo {index + 1} of {count}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-text shadow-[var(--shadow-soft)] backdrop-blur-sm sm:left-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-text shadow-[var(--shadow-soft)] backdrop-blur-sm sm:right-3"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 flex justify-center gap-1.5">
            {SLIDES.map((item, i) => (
              <button
                key={item.src}
                type="button"
                aria-label={`Go to ${item.caption}`}
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
