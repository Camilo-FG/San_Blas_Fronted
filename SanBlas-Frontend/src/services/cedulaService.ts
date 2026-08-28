import { apiClient } from "./apiClient";

export const existeCedula = async (cedula: string): Promise<boolean> => {
  const { data } = await apiClient.get(`/usuario/cedula/${cedula}`);
  return Boolean(data) && Object.keys(data).length > 0;
};

export interface DatosCedula {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

const parsearNombre = (valor: string): DatosCedula | null => {
  const parts = valor.trim().split(" ");

  if (parts.length >= 2) {
    const firstName = parts[0];
    const middleName = parts.length >= 3 ? parts[1] : "";
    const surnames = parts.slice(parts.length >= 3 ? 2 : 1).join(" ");

    return {
      nombre: `${firstName} ${middleName}`.trim(),
      primerApellido: surnames.split(" ")[0] ?? "",
      segundoApellido: surnames.split(" ").slice(1).join(" ") ?? "",
    };
  }

  return null;
};

export const obtenerDatosCedula = async (cedula: string): Promise<DatosCedula | null> => {
  const { data } = await apiClient.get<unknown>(`/usuario/cedula/${cedula}`);

  if (!data) return null;

  // Respuesta en texto plano del backend: "FIRSTNAME MIDDLENAME SURNAME1 SURNAME2"
  if (typeof data === "string") {
    return parsearNombre(data);
  }

  return null;
};
