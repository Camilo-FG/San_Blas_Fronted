import { ReactNode } from "react";
import { X } from "lucide-react";
import "./ModalSimple.css";

interface ModalSimpleProps {
  children: ReactNode;
  onClose: () => void;
}

function ModalSimple({ children, onClose }: ModalSimpleProps) {
  return (
    <div
      className="modal-simple__overlay"
      onClick={onClose}
    >
      <div
        className="modal-simple__content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-simple__close"
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

export default ModalSimple;
