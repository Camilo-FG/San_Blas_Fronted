import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { LineaDoradaTitulo } from "./LineaDoradaTitulo";

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
}: ConfirmacionAccionModalProps) {
  if (!open) return null;

  const esDestructivo = confirmVariant === "danger";

  return (
    <Modal
      onClose={onCancel}
      title={title}
      sinFondo
      cerrarAlClicFuera={false}
    >
      <div className="flex min-h-44 flex-col">
        {iconoAdvertencia && (
          <div className="flex shrink-0 items-center justify-center pt-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger">
              <AlertTriangle size={24} aria-hidden="true" />
            </span>
          </div>
        )}
        <LineaDoradaTitulo
          parteSubrayada={parteSubrayada}
          resto={resto}
        />
        <div className="flex flex-1 items-center justify-center px-8 py-4 text-center">
          <p className="text-sm leading-relaxed text-text-secondary">
            {mensaje}
          </p>
        </div>
        <div className="flex shrink-0 justify-end gap-2">
          <Button
            variant={confirmVariant}
            className={
              esDestructivo
                ? "rounded-lg! duration-400 ease-in-out"
                : "rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
            }
            onClick={onConfirm}
            disabled={isPending}
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
            className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
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
