export const ESTADOS_CIVILES_BAUTISMO = [
  "soltero", "matrimonio_catolico", "union_civil", "union_libre", "divorciado",
] as const;

export type EstadoCivilBautismo = (typeof ESTADOS_CIVILES_BAUTISMO)[number];

export const ETIQUETA_ESTADO_CIVIL: Record<EstadoCivilBautismo, string> = {
  soltero: "Soltero(a)",
  matrimonio_catolico: "Matrimonio católico",
  union_civil: "Unión civil",
  union_libre: "Unión libre",
  divorciado: "Divorciado(a)",
};
