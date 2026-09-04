import type { ReactNode } from "react";
import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { motion } from "framer-motion";
import { cn } from "./cn";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  title?: string;
  sinFondo?: boolean;
  overlayClassName?: string;
  cerrarAlClicFuera?: boolean;
};

export function Modal({
  children,
  onClose,
  className,
  title,
  sinFondo,
  overlayClassName,
  cerrarAlClicFuera = true,
}: ModalProps) {
  const clasesContenido = sinFondo
    ? "fixed top-1/2 left-1/2 z-[1400] max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-[0_22px_55px_rgba(6,15,32,0.45)]"
    : "relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl";

  const contenido = (
    <div
      className={cn(clasesContenido, className)}
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className={cn(
          "absolute top-4 right-4 inline-flex size-10 cursor-pointer items-center justify-center transition-colors duration-150 ease-out focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none",
          sinFondo
            ? "rounded-[6px] bg-white text-black hover:bg-slate-100"
            : "rounded-xl border border-border-strong bg-surface-muted text-slate-600 hover:bg-slate-100",
        )}
        onClick={onClose}
        aria-label="Cerrar modal"
      >
        <X size={20} />
      </button>

      {children}
    </div>
  );

  const focoAtrapado = (
    <FocusTrap
      focusTrapOptions={{
        clickOutsideDeactivates: false,
        escapeDeactivates: false,
        allowOutsideClick: () => true,
      }}
    >
      {contenido}
    </FocusTrap>
  );

  if (sinFondo) {
    return (
      <>
        <motion.div
          className={
            overlayClassName ??
            "fixed inset-0 z-[1350] bg-[#060f20]/35 backdrop-blur-[6px]"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={cerrarAlClicFuera ? onClose : undefined}
          role="presentation"
        />
        {focoAtrapado}
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/55 p-4"
      onClick={cerrarAlClicFuera ? onClose : undefined}
      role="presentation"
    >
      {focoAtrapado}
    </div>
  );
}