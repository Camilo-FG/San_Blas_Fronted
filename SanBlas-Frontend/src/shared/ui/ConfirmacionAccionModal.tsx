import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { LineaDoradaTitulo } from "./LineaDoradaTitulo";
import { cn } from "./cn";

type ConfirmacionAccionModalProps = {
  open: boolean;
  title: string;
  parteSubrayada: string;
  resto?: string;
  mensaje: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  // opcionales para acciones destructivas (p. ej. eliminar): icono de advertencia y botón rojo
  iconoAdvertencia?: boolean;
  confirmVariant?: "danger" | "royal";
  // opcionales para personalizar el contenedor (p. ej. modo oscuro por llamada)
  className?: string;
  overlayClassName?: string;
  // opcional para personalizar el botón Cancelar por llamada
  cancelClassName?: string;
  // opcional para personalizar el botón Confirmar por llamada
  confirmClassName?: string;
  // contenido extra, por ejemplo el motivo del rechazo
  children?: ReactNode;
  confirmDisabled?: boolean;
};

export function ConfirmacionAccionModal({
  open,
  title,
  parteSubrayada,
  resto,
  mensaje,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  onCancel,
  iconoAdvertencia = false,
  confirmVariant = "royal",
  className,
  overlayClassName,
  cancelClassName,
  confirmClassName,
  children,
  confirmDisabled = false,
}: ConfirmacionAccionModalProps) {
  if (!open) return null;

  const esDestructivo = confirmVariant === "danger";

  return (
    <Modal
      onClose={onCancel}
      title={title}
      sinFondo
      cerrarAlClicFuera={false}
      className={cn(
        "border-border bg-surface dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa]",
        className,
      )}
      overlayClassName={
        overlayClassName ??
        "fixed inset-0 z-[1350] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
      }
    >
      <div className="flex min-h-44 flex-col">
        {iconoAdvertencia && (
          <div className="flex shrink-0 items-center justify-center pt-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger dark:bg-[rgba(230,106,106,0.14)] dark:text-[#e66a6a]">
              <AlertTriangle size={24} aria-hidden="true" />
            </span>
          </div>
        )}
        <LineaDoradaTitulo
          parteSubrayada={parteSubrayada}
          resto={resto}
        />
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-4 text-center">
          <p className="text-sm leading-relaxed text-text-secondary dark:text-[#b7c3d4]">
            {mensaje}
          </p>
          {children}
        </div>
        <div className="flex shrink-0 justify-end gap-2">
          <Button
            variant={confirmVariant}
            className={cn(
              esDestructivo
                ? "rounded-lg! duration-400 ease-in-out dark:bg-[#b91c1c] dark:hover:bg-[#991b1b]"
                : "rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]",
              confirmClassName,
            )}
            onClick={onConfirm}
            disabled={isPending || confirmDisabled}
          >
            {isPending ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
          <Button
            variant="secondary"
            className={cn(
              "rounded-lg! duration-150 ease-out dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!",
              cancelClassName,
            )}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
