import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalSimpleProps {
  children: ReactNode;
  onClose: () => void;
}

function ModalSimple({ children, onClose }: ModalSimpleProps) {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-slate-900/65 p-3 py-[18px] backdrop-blur-sm sm:p-5 sm:py-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1000px] max-h-[calc(100vh-36px)] overflow-y-auto rounded-[18px] bg-[#fffdf7] p-[22px] shadow-[0_25px_80px_rgba(15,23,42,0.35)] animate-modal-simple-fade sm:max-h-[calc(100vh-80px)] sm:rounded-3xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="sticky top-0 z-10 ml-auto flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-none bg-[#f8ead1] text-[#4b2e12] hover:bg-royal-gold hover:text-white"
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
