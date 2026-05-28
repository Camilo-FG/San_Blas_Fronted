import React from "react";
import "./ModalSimple.css";

interface ModalSimpleProps {
  onClose: () => void;
  children: React.ReactNode;
}

function ModalSimple({ onClose, children }: ModalSimpleProps) {
  return (
    <div className="modal-simple">
      <div className="modal-simple__content">
        <div className="modal-simple__header">
          <button
            type="button"
            className="modal-simple__close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="modal-simple__body">{children}</div>
      </div>
    </div>
  );
}

export default ModalSimple;
