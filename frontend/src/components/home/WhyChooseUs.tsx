"use client";

import { motion } from "framer-motion";
import { Flame, ShieldCheck, BookOpen, Award, type LucideIcon } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Fresh from the Tandoor",
    description:
      "Every loaf is baked fresh in our traditional tandoor, served warm and ready for your table.",
    icon: Flame,
  },
  {
    title: "Hygienically Prepared",
    description:
      "Clean kitchens, careful handling, and strict standards so every bite is safe and wholesome.",
    icon: ShieldCheck,
  },
  {
    title: "Traditional Recipes",
    description:
      "Authentic Kashmiri breads crafted with time-honored recipes passed down through generations.",
    icon: BookOpen,
  },
  {
    title: "Trusted Since 2015",
    description:
      "Over a decade of serving Wavoora Lolab families—built on freshness, taste, and reliability.",
    icon: Award,
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const iconMotion = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function WhyChooseUs() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-semibold text-text sm:text-4xl lg:text-[2.5rem]">
            Why Choose Mehtab Bakery
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
            What sets our breads apart—freshness, tradition, and trust in every
            bite.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-7 lg:mt-16 lg:grid-cols-4 lg:gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="rounded-[var(--radius-lg)] border border-border/60 bg-surface p-6 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] sm:p-7"
              >
                <motion.div
                  variants={iconMotion}
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </motion.div>
                <h3 className="font-heading text-xl font-semibold text-text">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-[0.95rem]">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
