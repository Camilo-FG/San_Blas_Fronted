import type { EstadoCivilCica } from "./types";

export const ESTADOS_CIVILES_CICA: ReadonlyArray<{
  valor: EstadoCivilCica;
  etiqueta: string;
}> = [
  { valor: "soltero", etiqueta: "Soltero(a)" },
  { valor: "matrimonio_civil", etiqueta: "Matrimonio civil" },
  { valor: "matrimonio_catolico", etiqueta: "Matrimonio católico" },
  { valor: "union_libre", etiqueta: "Unión libre" },
  { valor: "union_civil", etiqueta: "Unión civil" },
  { valor: "divorciado", etiqueta: "Divorciado(a)" },
];

export const ETIQUETA_ESTADO_CIVIL_CICA = Object.fromEntries(
  ESTADOS_CIVILES_CICA.map(({ valor, etiqueta }) => [valor, etiqueta]),
) as Record<EstadoCivilCica, string>;

// Estados civiles en los que se debe indicar el nombre del cónyuge o compañero(a).
export const ESTADOS_CON_PAREJA_CICA: ReadonlyArray<EstadoCivilCica> = [
  "matrimonio_civil",
  "matrimonio_catolico",
  "union_libre",
  "union_civil",
];

export const requiereConyugeCica = (estado: EstadoCivilCica | ""): boolean =>
  estado !== "" && ESTADOS_CON_PAREJA_CICA.includes(estado);
