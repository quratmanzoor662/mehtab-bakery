"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Flame, ShieldCheck, BookOpen, Award, type LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.92, 1.06, 1.06, 0.96]);
  const Icon = feature.icon;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.08 * index, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="rounded-[var(--radius-lg)] border border-border/60 bg-surface p-6 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] sm:p-7"
    >
      <motion.div
        style={{ scale }}
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
}

export function WhyChooseUs() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-text sm:text-4xl lg:text-[2.5rem]">
            Why Choose Mehtab Bakery
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
            What sets our breads apart—freshness, tradition, and trust in every
            bite.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-7 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
