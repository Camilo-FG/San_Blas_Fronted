import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  title?: string;
};

export function Modal({ children, onClose, className, title }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/55 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          "relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className="absolute top-4 right-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-surface-muted text-slate-600 transition-colors hover:bg-slate-100 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}
