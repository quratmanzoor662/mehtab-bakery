"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  name: string;
  price: number;
  src: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    name: "Girda",
    price: 10,
    src: "/images/banner/girda.webp",
    alt: "Fresh Girda from Mehtab Bakery",
  },
  {
    name: "Tailwoor",
    price: 5,
    src: "/images/banner/tailwoor.jpeg",
    alt: "Traditional Tailwoor bread",
  },
  {
    name: "Kulcha",
    price: 10,
    src: "/images/banner/kulcha.jpeg",
    alt: "Kashmiri Kulcha bread",
  },
  {
    name: "Bakirkhani",
    price: 10,
    src: "/images/banner/bakirkhani.jpeg",
    alt: "Layered Bakirkhani bread",
  },
];

const AUTO_MS = 4000;
const SWIPE_OFFSET = 48;
const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = SLIDES.length;
  const slide = SLIDES[index];

  const goTo = useCallback(
    (nextIndex: number) => {
      setIndex(((nextIndex % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, count, index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -400) {
      next();
    } else if (info.offset.x > SWIPE_OFFSET || info.velocity.x > 400) {
      prev();
    }
  };

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] lg:aspect-[5/4]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Fresh breads from Mehtab Bakery"
    >
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
      >
        {SLIDES.map((item, i) => {
          const active = i === index;
          return (
            <motion.div
              key={item.src}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.95, ease: EASE }}
              style={{ zIndex: active ? 1 : 0 }}
              aria-hidden={!active}
            >
              <motion.div
                key={active ? `zoom-${item.src}-${index}` : `idle-${item.src}`}
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: active ? 1.06 : 1 }}
                transition={
                  active
                    ? { duration: AUTO_MS / 1000, ease: "linear" }
                    : { duration: 0.6, ease: EASE }
                }
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="pointer-events-none object-cover select-none"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-text/40 via-transparent to-text/10"
      />

      <span className="absolute top-3 left-3 z-[3] rounded-full bg-background/95 px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-primary uppercase shadow-[var(--shadow-soft)] backdrop-blur-sm sm:top-4 sm:left-4">
        Fresh Today
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute bottom-4 left-3 z-[3] max-w-[min(100%,14rem)] rounded-[var(--radius-md)] bg-text/55 px-3.5 py-2.5 text-white shadow-[var(--shadow-soft)] backdrop-blur-md sm:bottom-5 sm:left-4 sm:px-4"
        >
          <p className="font-heading text-base font-semibold sm:text-lg">
            {slide.name}
          </p>
          <p className="mt-0.5 text-sm text-white/90">₹{slide.price}</p>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        aria-label="Previous bread"
        onClick={prev}
        className="absolute top-1/2 left-2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-text shadow-[var(--shadow-soft)] backdrop-blur-sm transition-colors hover:bg-background sm:left-3 sm:h-10 sm:w-10"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Next bread"
        onClick={next}
        className="absolute top-1/2 right-2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-text shadow-[var(--shadow-soft)] backdrop-blur-sm transition-colors hover:bg-background sm:right-3 sm:h-10 sm:w-10"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div
        className="absolute bottom-4 right-3 z-[3] flex items-center gap-1.5 sm:bottom-5 sm:right-4"
        role="tablist"
        aria-label="Carousel slides"
      >
        {SLIDES.map((item, i) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${item.name}`}
            onClick={() => goTo(i)}
            className={[
              "h-2 rounded-full transition-all duration-300",
              i === index
                ? "w-5 bg-secondary"
                : "w-2 bg-white/55 hover:bg-white/80",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
