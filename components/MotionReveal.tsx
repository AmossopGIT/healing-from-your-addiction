"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

const easing = [0.22, 1, 0.36, 1] as const;

type BaseRevealProps = {
  children: ReactNode;
  delay?: number;
};

export function RevealDiv({
  children,
  delay = 0,
  ...rest
}: BaseRevealProps & Omit<HTMLMotionProps<"div">, "children">) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay, ease: easing }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealArticle({
  children,
  delay = 0,
  ...rest
}: BaseRevealProps & Omit<HTMLMotionProps<"article">, "children">) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay, ease: easing }}
      {...rest}
    >
      {children}
    </motion.article>
  );
}
