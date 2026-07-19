"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Story() {
  return (
    <section id="about" className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] sm:aspect-[5/6]">
            <Image
              src="/images/shop/shopimage2.jpeg"
              alt="Inside Mehtab Bakery shop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <div className="max-w-xl lg:justify-self-start">
          <motion.span
            custom={0}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="inline-flex rounded-[var(--radius-md)] bg-primary/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Since 2015
          </motion.span>

          <motion.h2
            custom={0.1}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="font-heading mt-5 text-3xl leading-tight font-semibold text-text sm:text-4xl lg:text-[2.5rem]"
          >
            Serving Freshness & Tradition for Over 10 Years
          </motion.h2>

          <motion.p
            custom={0.2}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-6 text-base leading-relaxed text-text-muted sm:text-lg"
          >
            At Mehtab Bakery, we have proudly served the people of Wavoora Lolab
            and nearby areas with freshly baked traditional Kashmiri breads for
            over 10 years. Every Girda, Tailwoor, Kulcha, and Bakirkhani is
            handcrafted using authentic recipes, quality ingredients, and baked
            fresh in our traditional tandoor. Our commitment to cleanliness,
            freshness, and taste has made us a trusted choice for families every
            morning.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
