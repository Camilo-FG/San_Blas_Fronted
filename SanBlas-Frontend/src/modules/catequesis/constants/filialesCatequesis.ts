export const FILIALES_CATEQUESIS = [
  "Río Grande",
  "Tierra Blanca",
  "Pedernal",
  "Casitas",
  "Curime",
  "San Blas",
  "Los Ángeles",
] as const;

export type FilialCatequesis = (typeof FILIALES_CATEQUESIS)[number];
