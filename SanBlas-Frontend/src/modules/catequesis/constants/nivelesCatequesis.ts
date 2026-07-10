export const NIVELES_CATEQUESIS = [
  { value: "Primero", label: "Primer Nivel" },
  { value: "Sétimo", label: "Sétimo Nivel" },
] as const;

export type NivelCatequesis = (typeof NIVELES_CATEQUESIS)[number]["value"];

export const obtenerEtiquetaNivelCatequesis = (
  nivel: string | null | undefined,
): string => {
  if (!nivel) return "No registrado";

  const encontrado = NIVELES_CATEQUESIS.find(
    (opcion) => opcion.value.toLowerCase() === nivel.toLowerCase(),
  );

  return encontrado?.label ?? nivel;
};
