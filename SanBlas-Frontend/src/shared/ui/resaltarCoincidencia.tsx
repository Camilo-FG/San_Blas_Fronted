import type { ReactNode } from "react";

export function resaltarCoincidencia(
  texto: string,
  termino: string,
): ReactNode {
  const term = (termino || "").trim();
  if (!term || !texto) return texto;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  const partes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > lastIndex) {
      partes.push(texto.slice(lastIndex, match.index));
    }

    partes.push(
      <mark
        key={i}
        className="rounded-sm bg-yellow-200 px-0.5 font-semibold text-inherit"
      >
        {match[0]}
      </mark>,
    );
    i += 1;
    lastIndex = match.index + match[0].length;

    if (match[0].length === 0) {
      regex.lastIndex += 1;
    }
  }

  if (lastIndex < texto.length) {
    partes.push(texto.slice(lastIndex));
  }

  return partes.length > 0 ? partes : texto;
}
