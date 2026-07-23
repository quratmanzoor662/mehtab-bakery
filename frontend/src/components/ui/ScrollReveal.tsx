"use client";

import type { ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
} & Pick<MotionProps, "viewport">;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as = "div",
  viewport = { once: true, amount: 0.2 },
}: RevealProps) {
  const Comp = as === "section" ? motion.section : motion.div;

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewport}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}
