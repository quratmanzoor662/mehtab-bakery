"use client";

import { motion } from "framer-motion";
import { RESERVE_CTA, SITE } from "@/constants/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroCarousel } from "@/components/home/HeroCarousel";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,160,23,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(139,69,19,0.1),_transparent_50%)]"
      />

      <Container className="relative grid items-center gap-6 py-8 sm:gap-10 sm:py-16 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-6 lg:py-20 xl:gap-x-16">
        {/* Brand copy — first on all breakpoints */}
        <div className="order-1 max-w-xl lg:col-start-1 lg:row-start-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="font-heading text-[1.85rem] leading-[1.12] font-semibold text-text sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
          >
            {SITE.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: EASE }}
            className="mt-3 max-w-md text-base leading-relaxed text-text-muted sm:mt-5 sm:text-xl"
          >
            {SITE.tagline}
          </motion.p>
        </div>

        {/* Carousel — above CTAs on mobile; right column on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.4, ease: EASE }}
          className="relative order-2 mx-auto w-full max-w-xl lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none"
        >
          <motion.div
            animate={{ scale: [1, 1.015, 1] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="origin-center"
          >
            <HeroCarousel />
          </motion.div>

          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute -bottom-4 -left-3 -z-10 h-40 w-40 rounded-full bg-secondary/25 blur-3xl sm:h-56 sm:w-56"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -top-6 -right-4 -z-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:h-48 sm:w-48"
          />
        </motion.div>

        {/* CTAs + social proof — below carousel on mobile */}
        <div className="order-3 max-w-xl lg:col-start-1 lg:row-start-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
            className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3"
          >
            <Button href={RESERVE_CTA.href} size="lg" className="w-full sm:w-auto">
              {RESERVE_CTA.label}
            </Button>
            <Button
              href="#breads"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore Our Breads
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.7, ease: EASE }}
            className="mt-5 space-y-1.5 sm:mt-6"
          >
            <p className="text-sm font-medium tracking-wide text-text">
              <span className="mr-1.5 text-secondary" aria-hidden>
                ★★★★★
              </span>
              Trusted by Families in Wavoora Lolab
            </p>
            <p className="text-sm text-text-muted">
              Serving Fresh Kashmiri Tandoori Breads Since 2015
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
