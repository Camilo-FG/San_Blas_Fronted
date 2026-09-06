import axios, { AxiosError } from "axios";
import { API_BASE_URL, DEFAULT_HEADERS } from "../config/api";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../utils/authToken";

export { clearAuthToken, getAuthToken, setAuthToken } from "../utils/authToken";

// Sin un límite global, una petición sin respuesta deja la interfaz esperando
// de forma indefinida en lugar de mostrar un error
const TIEMPO_MAXIMO_PETICION_MS = 30_000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { ...DEFAULT_HEADERS },
  timeout: TIEMPO_MAXIMO_PETICION_MS,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      const headers = config.headers;
      if (headers && typeof headers.delete === "function") {
        headers.delete("Content-Type");
        headers.delete("content-type");
      } else if (headers) {
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Las consultas se repiten en segundo plano, así que una sesión vencida puede
// generar varios 401 seguidos. Sin este control, cada uno relanzaría la
// navegación y dejaría la pestaña bloqueada.
let redirigiendoAlLogin = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isLoginRequest = url.toLowerCase().includes("/auth/login");

      if (!isLoginRequest) {
        clearAuthToken();
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") && !redirigiendoAlLogin) {
          redirigiendoAlLogin = true;
          const redirect = encodeURIComponent(currentPath);
          window.location.assign(`/login?redirect=${redirect}`);
        }
      }
    }

    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  status: number;
  errores?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errores?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errores = errores;
  }
}

const MENSAJE_FALTA_CONEXION =
  "No hay conexión a Internet, inténtalo más tarde.";

const esMensajeFaltaConexion = (mensaje: string | undefined | null): boolean =>
  !!mensaje &&
  /conexi[oó]n/i.test(mensaje) &&
  /(servicio de datos|no disponible|no hay conexi[oó]n|sin conexi[oó]n a internet|internet)/i.test(
    mensaje,
  );

const mensajePorEstado = (status: number): string => {
  switch (status) {
    case 400:
      return "Los datos enviados no son válidos. Revise el formulario.";
    case 401:
      return "Su sesión ha expirado o no está autenticado. Inicie sesión nuevamente.";
    case 403:
      return "No tiene permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no fue encontrado.";
    case 429:
      return "Demasiadas solicitudes. Espere un momento e intente de nuevo.";
    case 503:
      return "El servicio no está disponible en este momento. Intente más tarde.";
    case 500:
      return "Ocurrió un error en el servidor. Intente más tarde.";
    default:
      return "Ocurrió un error al procesar la solicitud.";
  }
};

export const handleApiError = (error: unknown): never => {
  if (!axios.isAxiosError(error)) {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      0,
    );
  }

  const axiosError = error as AxiosError<{
    mensaje?: string;
    message?: string;
    title?: string;
    errores?: Record<string, string[]>;
    errors?: Record<string, string[]>;
  }>;

  if (!axiosError.response) {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      0,
    );
  }

  const { status, data } = axiosError.response;
  const erroresBackend = data?.errores ?? data?.errors;
  const mensajesValidacion = erroresBackend
    ? Object.values(erroresBackend)
        .flat()
        .filter(
          (mensaje) =>
            mensaje &&
            mensaje !== "The dto field is required." &&
            !mensaje.startsWith("The JSON value could not be converted"),
        )
    : [];

  const mensajeBackend =
    data?.mensaje ??
    (typeof data?.message === "string" && !isTechnicalApiMessage(data.message)
      ? data.message
      : undefined) ??
    (mensajesValidacion.length > 0
      ? mensajesValidacion.join(" ")
      : data?.title);

  throw new ApiError(
    esMensajeFaltaConexion(mensajeBackend)
      ? MENSAJE_FALTA_CONEXION
      : (mensajeBackend ?? mensajePorEstado(status)),
    status,
    erroresBackend,
  );
};

const isTechnicalApiMessage = (message: string): boolean =>
  /(query failed|syntax error|typeorm|exception|stack|sql|postgres|ECONN|internal server error|at \w+\()/i.test(
    message,
  );
