import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "./cn";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useState(0)[0];

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
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

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <AlertCircle size={20} className="text-danger" />,
    warning: <AlertTriangle size={20} className="text-warning" />,
    info: <AlertCircle size={20} className="text-info" />,
  };

  const bgClasses = {
    success: "bg-success-bg border-success",
    error: "bg-danger-bg border-danger",
    warning: "bg-warning-bg border-warning",
    info: "bg-info-bg border-info",
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[1400] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto min-w-[280px] max-w-[400px] rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-right duration-300",
            bgClasses[toast.type],
          )}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{toast.message}</p>
            </div>
            <button
              type="button"
              className="flex-shrink-0 text-text-muted hover:text-text transition-colors"
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar notificación"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}