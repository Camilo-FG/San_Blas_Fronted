import { apiClient } from "./apiClient";

const consultasCedula = new Map<string, Promise<DatosCedula | null>>();

export const existeCedula = async (cedula: string): Promise<boolean> => {
  const { data } = await apiClient.get(`/usuario/cedula/${cedula}`);
  return Boolean(data) && Object.keys(data).length > 0;
};

export interface DatosCedula {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

const capitalizarNombre = (valor: string): string =>
  valor
    .split(" ")
    .filter(Boolean)
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase(),
    )
    .join(" ");

const parsearNombre = (valor: string): DatosCedula | null => {
  const parts = valor.trim().split(" ").filter(Boolean);

  if (parts.length < 2) return null;

  const cantidadApellidos = parts.length >= 3 ? 2 : 1;
  const indexSurnames = parts.length - cantidadApellidos;

  const givenNames = parts.slice(0, indexSurnames).join(" ");
  const surnames = parts.slice(indexSurnames).join(" ");

  return {
    nombre: capitalizarNombre(givenNames),
    primerApellido: capitalizarNombre(surnames.split(" ")[0] ?? ""),
    segundoApellido: capitalizarNombre(
      surnames.split(" ").slice(1).join(" "),
    ),
  };
};

export const obtenerDatosCedula = async (cedula: string): Promise<DatosCedula | null> => {
  const cedulaNormalizada = cedula.replace(/\D/g, "");
  const consultaEnCurso = consultasCedula.get(cedulaNormalizada);
  if (consultaEnCurso) return consultaEnCurso;

  const consulta = apiClient
    .get<unknown>(`/usuario/cedula/${cedulaNormalizada}`)
    .then(({ data }) => {
      if (!data) return null;

      // El backend mantiene texto plano para no romper los consumidores existentes.
      if (typeof data === "string") return parsearNombre(data);

      return null;
    })
    .catch((error) => {
      consultasCedula.delete(cedulaNormalizada); // un fallo de red no se guarda para poder reintentar
      throw error;
    });

  consultasCedula.set(cedulaNormalizada, consulta);
  return consulta;
};
