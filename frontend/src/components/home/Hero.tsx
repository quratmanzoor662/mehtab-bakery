"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { RESERVE_CTA, SITE } from "@/constants/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,160,23,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(139,69,19,0.1),_transparent_50%)]"
      />

      <Container className="relative grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20 xl:gap-16">
        <div className="max-w-xl">
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-heading text-4xl leading-[1.1] font-semibold text-text sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
          >
            {SITE.name}
          </motion.h1>

          <motion.p
            custom={0.12}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-5 max-w-md text-lg leading-relaxed text-text-muted sm:text-xl"
          >
            {SITE.tagline}
          </motion.p>

          <motion.div
            custom={0.24}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href={RESERVE_CTA.href} size="lg">
              {RESERVE_CTA.label}
            </Button>
            <Button href="#breads" variant="outline" size="lg">
              Explore Our Breads
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] lg:aspect-[5/4]">
            <Image
              src="/images/banner/hero-banner.webp"
              alt="Fresh bread from Mehtab Bakery"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-text/25 via-transparent to-transparent"
            />
          </div>

          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute -bottom-4 -left-3 -z-10 h-40 w-40 rounded-full bg-secondary/25 blur-3xl sm:h-56 sm:w-56"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="absolute -top-6 -right-4 -z-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:h-48 sm:w-48"
          />
        </motion.div>
      </Container>
    </section>
  );
}
