import axios, { AxiosError } from "axios";
import { API_BASE_URL, DEFAULT_HEADERS } from "../config/api";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../utils/authToken";

export { clearAuthToken, getAuthToken, setAuthToken } from "../utils/authToken";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { ...DEFAULT_HEADERS },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isLoginRequest = url.includes("/Auth/login");

      if (!isLoginRequest) {
        clearAuthToken();
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login")) {
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
    data?.message ??
    (mensajesValidacion.length > 0
      ? mensajesValidacion.join(" ")
      : data?.title);

  throw new ApiError(
    mensajeBackend ?? mensajePorEstado(status),
    status,
    erroresBackend,
  );
};
