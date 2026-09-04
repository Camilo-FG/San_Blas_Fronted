import type { ReactNode } from "react";

export function EtiquetaSeccion({ children }: { children: ReactNode }) {
  return (
    <span className="m-0 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#16243c] uppercase">
      <span className="h-3 w-px bg-[#aa7323]" aria-hidden="true" />
      {children}
    </span>
  );
}
