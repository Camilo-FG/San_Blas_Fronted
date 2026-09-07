import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const DURACION_DEFECTO_MS = 6000;

const textoPorCantidad = (cantidad: number): string =>
  cantidad === 1
    ? "Tenés 1 solicitud nueva desde tu última visita"
    : `Tenés ${cantidad} solicitudes nuevas desde tu última visita`;

export interface NotificacionSolicitudesNuevasProps {
  cantidad: number;
  texto?: string;
  duracionMs?: number;
  onCerrar?: () => void;
}

export function NotificacionSolicitudesNuevas({
  cantidad,
  texto,
  duracionMs = DURACION_DEFECTO_MS,
  onCerrar,
}: NotificacionSolicitudesNuevasProps): React.JSX.Element {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), duracionMs);
    return () => clearTimeout(timer);
  }, [visible, duracionMs]);

  const cerrar = () => {
    setVisible(false);
    onCerrar?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full items-center gap-3 rounded-2xl border border-royal-gold/45 bg-royal-gold/10 px-4 py-3 text-royal-blue sm:gap-3.5 sm:px-5 sm:py-4"
        >
          <Bell className="size-5 shrink-0 text-royal-gold" aria-hidden="true" />
          <p className="flex-1 text-sm font-medium leading-snug text-[#16243c] sm:text-[0.95rem]">
            {texto ?? textoPorCantidad(cantidad)}
          </p>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar notificación"
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-1.5 text-[#16243c]/60 transition-colors hover:bg-royal-gold/20 hover:text-[#16243c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-gold"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}