import axios, { AxiosError } from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY, DEFAULT_HEADERS } from "../config/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { ...DEFAULT_HEADERS },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const getAuthToken = (): string | null =>
  localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

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
  }>;

  if (!axiosError.response) {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      0,
    );
  }

  const { status, data } = axiosError.response;
  const mensajeBackend = data?.mensaje ?? data?.message ?? data?.title;

  throw new ApiError(
    mensajeBackend ?? mensajePorEstado(status),
    status,
    data?.errores,
  );
};
