import type { ParentescoAbuelo } from "../../../types/sacramentosNuevos";

export const PARENTESCOS_ABUELOS: ParentescoAbuelo[] = [
  "abuelo_paterno",
  "abuela_paterna",
  "abuelo_materno",
  "abuela_materna",
];

export const ETIQUETAS_PARENTESCO_ABUELO: Record<ParentescoAbuelo, string> = {
  abuelo_paterno: "Abuelo paterno",
  abuela_paterna: "Abuela paterna",
  abuelo_materno: "Abuelo materno",
  abuela_materna: "Abuela materna",
};

export const opcionesParentescoAbuelo = (
  usados: ParentescoAbuelo[],
  actual: ParentescoAbuelo,
): { label: string; value: ParentescoAbuelo }[] =>
  PARENTESCOS_ABUELOS.filter(
    (parentesco) => parentesco === actual || !usados.includes(parentesco),
  ).map((parentesco) => ({
    label: ETIQUETAS_PARENTESCO_ABUELO[parentesco],
    value: parentesco,
  }));
