import type { ReactNode } from "react";
import { ContadorCaracteres } from "../../../shared/ui/ContadorCaracteres";

interface Props {
  /** Mapa de errores del formulario (igual clave que ErrorMsg). */
  errors?: Record<string, string>;
  /** Clave del error de este campo. */
  clave?: string;
  /** Aviso adicional (p. ej. el estado de la cédula consultada). */
  aviso?: ReactNode;
  actual: number;
  maximo: number;
  unidad?: string;
}

/**
 * Pie de cada campo: el mensaje de validación a la izquierda y el contador de
 * caracteres a la derecha, en la misma fila y con altura fija, para que nada
 * salte de lugar cuando el aviso aparece o desaparece.
 */
export function PieDeCampo({ errors, clave, aviso, actual, maximo, unidad }: Props) {
  const mensaje = clave ? errors?.[clave] : undefined;
  return (
    <div className="flex min-h-5 items-baseline justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        {aviso}
        {mensaje && (
          <span className="text-xs leading-4 font-semibold text-red-500 dark:text-[#e66a6a]">
            ⚠ {mensaje}
          </span>
        )}
      </div>
      <ContadorCaracteres
        actual={actual}
        maximo={maximo}
        unidad={unidad}
        className="shrink-0 whitespace-nowrap"
      />
    </div>
  );
}
