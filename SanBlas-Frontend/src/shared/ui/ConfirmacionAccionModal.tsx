import { Loader2 } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { LineaDoradaTitulo } from "./LineaDoradaTitulo";

type ConfirmacionAccionModalProps = {
  open: boolean;
  title: string;
  parteSubrayada: string;
  resto?: string;
  mensaje: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
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
}: ConfirmacionAccionModalProps) {
  if (!open) return null;

  return (
    <Modal
      onClose={onCancel}
      title={title}
      sinFondo
      cerrarAlClicFuera={false}
    >
      <div className="flex min-h-44 flex-col">
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
            variant="royal"
            className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
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
