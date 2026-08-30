import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./cn";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

const TOAST_DURATION_MS = 6000;
const RADIO_ANILLO = 12;
const CIRCUNFERENCIA_ANILLO = 2 * Math.PI * RADIO_ANILLO;

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    idCounter.current += 1;
    const id = idCounter.current;
    setToasts((prev) => [...prev, { id, message, type, duration: TOAST_DURATION_MS }]);
    // Las notificaciones desaparecen automáticamente después de 6 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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

  return (
    <div
      className="fixed top-4 right-4 z-[1400] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={cn(
              "pointer-events-auto min-w-[280px] max-w-[400px] rounded-xl border px-4 py-3 shadow-lg",
              bgClasses[toast.type],
            )}
            role="alert"
            initial={{ opacity: 0, x: 90 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 110 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
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
}