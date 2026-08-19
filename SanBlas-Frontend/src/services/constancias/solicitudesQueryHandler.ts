import { ApiError } from "../apiClient";

const TECHNICAL_MESSAGE_PATTERN =
  /(query failed|syntax error|typeorm|exception|stack|sql|postgres|ECONN|internal server error|at \w+\()/i;

export const MENSAJES_CONSULTA_SOLICITUDES = {
  conexion:
    "No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.",
  consulta:
    "No fue posible consultar las solicitudes sacramentales. Intente más tarde.",
  respuestaInvalida:
    "La respuesta del servidor no es válida. Intente recargar la página.",
  generico: "Ocurrió un error al cargar las solicitudes. Intente nuevamente.",
} as const;

const isTechnicalMessage = (message: string): boolean =>
  TECHNICAL_MESSAGE_PATTERN.test(message);

export const toFriendlySolicitudesMessage = (
  error: unknown,
  fallback = MENSAJES_CONSULTA_SOLICITUDES.generico,
): string => {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return MENSAJES_CONSULTA_SOLICITUDES.conexion;
    }

    if (error.status === 503) {
      return MENSAJES_CONSULTA_SOLICITUDES.consulta;
    }

    if (error.message && !isTechnicalMessage(error.message)) {
      return error.message;
    }

    if (error.status >= 500) {
      return MENSAJES_CONSULTA_SOLICITUDES.consulta;
    }
  }

  return fallback;
};

export const logSolicitudesQueryError = (
  context: string,
  error: unknown,
): void => {
  if (import.meta.env.DEV) {
    console.error(`[solicitudes-sacramentales:${context}]`, error);
  }
};

export const assertSolicitudesResponse = (
  data: unknown,
): data is {
  data: Record<string, unknown>[];
  total: number;
} => {
  if (!data || typeof data !== "object") return false;
  const response = data as Record<string, unknown>;
  return Array.isArray(response.data) && typeof response.total === "number";
};
