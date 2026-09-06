import {
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
  autoExpand?: boolean;
  minRows?: number;
  maxRows?: number;
};

function alturaPorLineas(campo: HTMLTextAreaElement, lineas: number) {
  const estilos = getComputedStyle(campo);
  const fontSize = Number.parseFloat(estilos.fontSize);
  const lineHeightRaw = Number.parseFloat(estilos.lineHeight);
  const lineHeight =
    Number.isFinite(lineHeightRaw) && lineHeightRaw > 0
      ? lineHeightRaw
      : fontSize * 1.5;
  const extra =
    Number.parseFloat(estilos.paddingTop) +
    Number.parseFloat(estilos.paddingBottom) +
    Number.parseFloat(estilos.borderTopWidth) +
    Number.parseFloat(estilos.borderBottomWidth);

  return lineHeight * lineas + extra;
}

export function Textarea({
  className,
  hasError,
  autoExpand = false,
  minRows = 1,
  maxRows = 8,
  onChange,
  rows,
  value,
  ...props
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const inicioAplicado = useRef(false);
  const filasIniciales = autoExpand ? (rows ?? 1) : rows;

  const aplicarLimites = (
    campo: HTMLTextAreaElement,
    usarContenido: boolean,
  ) => {
    const minima = alturaPorLineas(campo, minRows);
    const maxima = alturaPorLineas(campo, maxRows);
    campo.style.minHeight = `${minima}px`;
    campo.style.maxHeight = `${maxima}px`;

    if (!usarContenido) return;

    campo.style.height = "auto";
    const objetivo = Math.min(maxima, Math.max(minima, campo.scrollHeight));
    campo.style.height = `${objetivo}px`;
    campo.style.overflowY = campo.scrollHeight > maxima + 1 ? "auto" : "hidden";
  };

  useLayoutEffect(() => {
    const campo = ref.current;
    if (!autoExpand || !campo) return;

    if (!inicioAplicado.current) {
      const minima = alturaPorLineas(campo, minRows);
      const maxima = alturaPorLineas(campo, maxRows);
      const inicial = alturaPorLineas(campo, filasIniciales ?? minRows);
      campo.style.minHeight = `${minima}px`;
      campo.style.maxHeight = `${maxima}px`;
      campo.style.height = `${Math.min(maxima, Math.max(inicial, campo.scrollHeight))}px`;
      campo.style.overflowY =
        campo.scrollHeight > maxima + 1 ? "auto" : "hidden";
      inicioAplicado.current = true;
      return;
    }

    aplicarLimites(campo, true);
  }, [autoExpand, filasIniciales, maxRows, minRows, value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    if (autoExpand) aplicarLimites(event.currentTarget, true);
  };

  return (
    <textarea
      ref={ref}
      rows={filasIniciales}
      value={value}
      className={cn(
        "w-full rounded-xl border bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        autoExpand ? "resize-y" : "min-h-28",
        hasError ? "border-red-400 bg-danger-bg" : "border-border-strong",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
}
