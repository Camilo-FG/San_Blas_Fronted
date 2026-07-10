export const FILIALES_CATEQUESIS = [
  "Curime",
  "Casitas",
  "Piedra Blanca",
  "Río Grande",
  "Los Ángeles",
  "Guadalupano",
] as const;

export type FilialCatequesis = (typeof FILIALES_CATEQUESIS)[number];
