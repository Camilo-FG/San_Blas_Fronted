import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  /** Sin animación (above-the-fold / hidratación). */
  immediate?: boolean;
};

/**
 * Reveal suave al hacer scroll. No usa opacity:0 en el montaje inicial
 * para no pelear con el HTML del prerender (hydrateRoot).
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
  immediate = false,
}: ScrollRevealProps) {
  const reducirMovimiento = useReducedMotion();

  if (immediate || reducirMovimiento) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: 0.65,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
