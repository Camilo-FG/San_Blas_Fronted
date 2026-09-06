export const MENSAJES_APROBACION = {
  servidor: "No hay conexión a Internet, inténtalo más tarde.",
  timeout: "El servidor tardó demasiado en responder, intentá de nuevo",
  sinConexion: "No hay conexión a Internet, inténtalo más tarde.",
} as const;

export type TipoErrorAprobacion = "servidor" | "timeout";

export interface ErrorComoAxios {
  code?: string;
  message?: string;
}

export const clasificarErrorAprobacion = (
  error: unknown,
): TipoErrorAprobacion => {
  const posibleAxios = error as ErrorComoAxios | null | undefined;
  const codigo = posibleAxios?.code;
  const mensaje = String(posibleAxios?.message ?? "");

  if (codigo === "ECONNABORTED" || /timeout/i.test(mensaje)) {
    return "timeout";
  }
  return "servidor";
};
