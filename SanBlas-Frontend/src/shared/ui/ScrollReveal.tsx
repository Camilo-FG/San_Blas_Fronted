import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  /** Sin animación (above-the-fold / hero). */
  immediate?: boolean;
};

/**
 * Animación al entrar en viewport (opacity + y).
 * En el primer paint queda visible (compatible con prerender/hydrateRoot);
 * si el bloque nace fuera de pantalla, entonces sí anima al hacer scroll.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.18,
  immediate = false,
}: ScrollRevealProps) {
  const reducirMovimiento = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [animarAlScroll, setAnimarAlScroll] = useState(false);

  useEffect(() => {
    if (immediate || reducirMovimiento) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margen = 48;
    const visible =
      rect.top < window.innerHeight - margen && rect.bottom > margen;

    // Solo ocultar+animar lo que empieza fuera de pantalla (no el hero).
    if (!visible) {
      setAnimarAlScroll(true);
    }
  }, [immediate, reducirMovimiento]);

  if (immediate || reducirMovimiento) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={animarAlScroll ? { opacity: 0, y: 28 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: animarAlScroll ? delay : 0,
      }}
    >
      {children}
    </motion.div>
  );
}
