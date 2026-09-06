import type { ParroquiaCatalogo } from "../../../types/sacramentosNuevos";

export const FILIALES_CELEBRACION_SACRAMENTAL = [
  "Río Grande",
  "Tierra Blanca",
  "Pedernal",
  "Casitas",
  "Curime",
  "Centro San Blas",
  "Los Ángeles",
] as const;

export type FilialCelebracionSacramental =
  (typeof FILIALES_CELEBRACION_SACRAMENTAL)[number];

const normalizarFilial = (valor: string): string =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const aliasFilial = (valor: string): string => {
  const normalizado = normalizarFilial(valor);
  if (normalizado === "san blas") return "centro san blas";
  return normalizado;
};

export const coincideFilial = (nombreParroquia: string, filial: string): boolean =>
  aliasFilial(nombreParroquia) === aliasFilial(filial);

export const opcionesLugarCelebracion = (
  parroquias: ParroquiaCatalogo[] | undefined,
  extra?: { id: number; nombre: string } | null,
): { id: number; nombre: string }[] => {
  const catalogo = parroquias ?? [];
  const opciones: { id: number; nombre: string }[] = [];

  for (const filial of FILIALES_CELEBRACION_SACRAMENTAL) {
    const match = catalogo.find((parroquia) =>
      coincideFilial(parroquia.nombre, filial),
    );
    if (match) {
      opciones.push({ id: match.id, nombre: filial });
    }
  }

  if (extra && !opciones.some((opcion) => opcion.id === extra.id)) {
    opciones.push({ id: extra.id, nombre: extra.nombre });
  }

  return opciones;
};
