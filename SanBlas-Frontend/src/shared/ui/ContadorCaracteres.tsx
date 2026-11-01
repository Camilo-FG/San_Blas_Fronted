import { cn } from "./cn";

interface Props {
  actual: number;
  maximo: number;
  /** Palabra final del contador; por defecto "caracteres" (p. ej. "dígitos" para cédulas). */
  unidad?: string;
  className?: string;
}

/**
 * Contador de caracteres para inputs con maxLength.
 * Mantiene el mismo estilo en todos los formularios: pequeño, gris y a la derecha.
 */
export function ContadorCaracteres({ actual, maximo, unidad = 'caracteres', className }: Props) {
  return (
    <p
      className={cn(
        "m-0 text-right text-xs text-slate-400 dark:text-[#7f8da3]",
        className,
      )}
    >
      {actual}/{maximo} {unidad}
    </p>
  );
}
