import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.18,
}: ScrollRevealProps) {
  const reducirMovimiento = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducirMovimiento ? false : { opacity: 0, y: 28 }}
      whileInView={reducirMovimiento ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: reducirMovimiento ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
