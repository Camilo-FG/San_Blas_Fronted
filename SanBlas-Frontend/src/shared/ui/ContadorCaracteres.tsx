import { cn } from "./cn";

interface Props {
  actual: number;
  maximo: number;
  className?: string;
}

/**
 * Contador de caracteres para inputs con maxLength.
 * Mantiene el mismo estilo en todos los formularios: pequeño, gris y a la derecha.
 */
export function ContadorCaracteres({ actual, maximo, className }: Props) {
  return (
    <p
      className={cn(
        "m-0 mt-1 text-right text-xs text-slate-400 dark:text-[#7f8da3]",
        className,
      )}
    >
      {actual}/{maximo} caracteres
    </p>
  );
}
