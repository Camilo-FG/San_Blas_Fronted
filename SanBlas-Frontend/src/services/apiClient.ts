import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5146/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const handleApiError = (error: unknown): never => {
  if (!axios.isAxiosError(error)) {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      0,
    );
  }

  const axiosError = error as AxiosError<{
    mensaje?: string;
    errores?: Record<string, string[]>;
  }>;

  if (!axiosError.response) {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      0,
    );
  }

  const { status, data } = axiosError.response;

  throw new ApiError(
    data?.mensaje ?? "Ocurrió un error al procesar la solicitud.",
    status,
    data?.errores,
  );
};
