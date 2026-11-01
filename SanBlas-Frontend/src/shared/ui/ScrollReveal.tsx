import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  /** Above-the-fold: anima al montar, sin whileInView. */
  immediate?: boolean;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
  immediate = false,
}: ScrollRevealProps) {
  const reducirMovimiento = useReducedMotion();

  if (immediate) {
    return (
      <motion.div
        className={className}
        initial={reducirMovimiento ? false : { opacity: 0 }}
        animate={reducirMovimiento ? undefined : { opacity: 1 }}
        transition={{
          duration: 0.55,
          ease: "easeOut",
          delay: reducirMovimiento ? 0 : delay,
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={reducirMovimiento ? false : { opacity: 0 }}
      whileInView={reducirMovimiento ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.65,
        ease: "easeOut",
        delay: reducirMovimiento ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
