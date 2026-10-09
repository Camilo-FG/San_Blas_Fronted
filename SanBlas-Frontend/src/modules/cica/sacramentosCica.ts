export const SACRAMENTOS_CICA = [
  { clave: "necesitaBautizo", etiqueta: "Bautizo" },
  { clave: "necesitaPrimeraComunion", etiqueta: "Primera comunión" },
  { clave: "necesitaConfirmacion", etiqueta: "Confirmación" },
] as const;

export type ClaveSacramentoCica = (typeof SACRAMENTOS_CICA)[number]["clave"];
