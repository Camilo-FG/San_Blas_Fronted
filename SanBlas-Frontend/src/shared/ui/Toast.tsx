import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

type ToastType = "success" | "error" | "warning" | "info";
type ToastPosition = "top-right" | "bottom-right";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  position: ToastPosition;
}

const TOAST_DURATION_MS = 6000;
const RADIO_ANILLO = 12;
const CIRCUNFERENCIA_ANILLO = 2 * Math.PI * RADIO_ANILLO;

interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  dismissToast: (id: number) => void;
  dismissAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      idCounter.current += 1;
      const id = idCounter.current;
      const duration = options?.duration ?? TOAST_DURATION_MS;
      const position = options?.position ?? "top-right";
      setToasts((prev) => [
        ...prev,
        { id, message, type, duration, position },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Espejo del estado para que el listener establecido abajo decida con los
  // toasts al día sin re-registrar el efecto en cada cambio de lista.
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  // Las alertas tienen prioridad: un Escape con toasts visibles descarta el
  // más reciente (uno por uno) y corta la propagación para que los modales
  // que escuchan en window (useEscapeKey o cerrarConEsc) no se cierren en la
  // misma pulsación mientras queden alertas activas.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (toastsRef.current.length === 0) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setToasts((prev) => prev.slice(0, -1));
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, dismissToast, dismissAllToasts }}
    >
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function AnilloProgreso({
  duracionMs,
  sobreOscuro = false,
}: {
  duracionMs: number;
  sobreOscuro?: boolean;
}) {
  const colorPista = sobreOscuro ? "stroke-white/25" : "stroke-[#16243c]/10";
  const colorProgreso = sobreOscuro ? "stroke-white" : "stroke-[#aa7323]";
  return (
    <svg
      className="pointer-events-none absolute inset-0 -rotate-90"
      viewBox="0 0 30 30"
      aria-hidden="true"
    >
      <circle
        cx="15"
        cy="15"
        r={RADIO_ANILLO}
        fill="none"
        strokeWidth="2.5"
        className={colorPista}
      />
      <motion.circle
        cx="15"
        cy="15"
        r={RADIO_ANILLO}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={CIRCUNFERENCIA_ANILLO}
        className={colorProgreso}
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: CIRCUNFERENCIA_ANILLO }}
        transition={{ duration: duracionMs / 1000, ease: "linear" }}
      />
    </svg>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const reducirMovimiento = useReducedMotion();
  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <X size={20} className="text-white" />,
    warning: <AlertTriangle size={20} className="text-warning" />,
    info: <AlertCircle size={20} className="text-info" />,
  };

  const bgClasses = {
    success: "bg-emerald-100 border-success",
    error: "bg-red-600 border-red-700",
    warning: "bg-warning-bg border-warning",
    info: "bg-info-bg border-info",
  };

  const posiciones: ToastPosition[] = ["top-right", "bottom-right"];

  // Las alertas entran deslizándose desde el borde derecho de la pantalla y
  // se retiran hacia ese mismo borde: el desplazamiento cubre todo el ancho
  // visible para que nunca "aparezcan de la nada". Solo anima transform y
  // opacity, de modo que corre en el compositor a 60 fps.
  const deslizamiento = typeof window === "undefined" ? 600 : window.innerWidth;

  return (
    <>
      {posiciones.map((posicion) => {
        const grupo = toasts.filter((toast) => toast.position === posicion);
        return (
          <div
            key={posicion}
            className={`fixed z-[100000] flex flex-col gap-2 pointer-events-none ${
              posicion === "top-right"
                ? "top-20 right-4"
                : "right-4 bottom-4 flex-col-reverse"
            }`}
            role="region"
            aria-live="polite"
            aria-label="Notificaciones"
          >
            <AnimatePresence initial={false}>
              {grupo.map((toast) => (
                <motion.div
                  key={toast.id}
                  layout
                  className={cn(
                    "pointer-events-auto min-w-[280px] max-w-[400px] rounded-xl border px-4 py-3 shadow-lg will-change-transform",
                    bgClasses[toast.type],
                  )}
                  role="alert"
                  initial={
                    reducirMovimiento
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          x: deslizamiento,
                        }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    reducirMovimiento
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          x: deslizamiento,
                          transition: {
                            duration: 0.26,
                            ease: [0.4, 0, 1, 1],
                          },
                        }
                  }
                  transition={
                    reducirMovimiento
                      ? { duration: 0.15, ease: "easeOut" }
                      : {
                          type: "spring",
                          stiffness: 460,
                          damping: 34,
                          mass: 0.7,
                          opacity: { duration: 0.18, ease: "easeOut" },
                        }
                  }
                >
                  <div className="flex items-center gap-3">
                    {toast.type !== "success" && toast.type !== "error" && (
                      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          toast.type === "error" ? "text-white" : "text-text",
                        )}
                      >
                        {toast.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={cn(
                        "relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
                        toast.type === "error"
                          ? "text-white/80 hover:text-white"
                          : "text-text-muted hover:text-text",
                      )}
                      onClick={() => onDismiss(toast.id)}
                      aria-label="Cerrar notificación"
                    >
                      {(toast.type === "success" || toast.type === "error") && (
                        <AnilloProgreso
                          duracionMs={toast.duration}
                          sobreOscuro={toast.type === "error"}
                        />
                      )}
                      <X size={15} className="pointer-events-none" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}