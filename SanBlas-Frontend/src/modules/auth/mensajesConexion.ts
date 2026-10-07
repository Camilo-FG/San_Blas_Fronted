import { ApiError } from "../../services/apiClient";

export const MENSAJE_SIN_INTERNET =
  "No hay conexión a internet. Su contraseña no se ha cambiado; revise su conexión e intente de nuevo.";

export const MENSAJE_SIN_INTERNET_ENLACE =
  "No hay conexión a internet. Revise su conexión e intente de nuevo.";

export const MENSAJE_CONEXION_PERDIDA =
  "Se perdió la conexión antes de recibir respuesta. Revise su internet y vuelva a pulsar el botón.";

export const esErrorDeRed = (err: unknown): boolean =>
  err instanceof ApiError && err.status === 0;
