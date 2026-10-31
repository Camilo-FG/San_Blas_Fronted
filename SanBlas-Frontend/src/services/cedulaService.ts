import { apiClient } from "./apiClient";

// Respuesta del backend: distingue "no existe" de "el proveedor falló".
type RespuestaBackend =
  | { estado: "encontrada"; nombre: string }
  | { estado: "no_encontrada" }
  | { estado: "error" };

export interface DatosCedula {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

export type ResultadoCedula =
  | { estado: "encontrada"; datos: DatosCedula }
  | { estado: "no_encontrada" }
  | { estado: "error" };

// Dedupe de consultas en curso por cédula. Solo se conservan los aciertos;
// los negativos se sueltan para permitir reintentar (el backend los cachea 5 min).
const consultasCedula = new Map<string, Promise<ResultadoCedula>>();

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

const consultarCedula = async (
  cedulaNormalizada: string,
): Promise<ResultadoCedula> => {
  const { data } = await apiClient.get<RespuestaBackend | string | null>(
    `/usuario/cedula/${cedulaNormalizada}`,
  );

  // Compatibilidad con la respuesta anterior (texto plano) mientras el backend
  // nuevo termina de desplegarse.
  if (typeof data === "string") {
    const datos = parsearNombre(data);
    return datos
      ? { estado: "encontrada", datos }
      : { estado: "no_encontrada" };
  }

  if (data && data.estado === "encontrada") {
    const datos = parsearNombre(data.nombre);
    return datos
      ? { estado: "encontrada", datos }
      : { estado: "no_encontrada" };
  }

  if (data && data.estado === "error") return { estado: "error" };

  return { estado: "no_encontrada" };
};

export const obtenerDatosCedula = async (
  cedula: string,
): Promise<ResultadoCedula> => {
  const cedulaNormalizada = cedula.replace(/\D/g, "");
  const enCurso = consultasCedula.get(cedulaNormalizada);
  if (enCurso) return enCurso;

  const consulta = consultarCedula(cedulaNormalizada)
    .catch((): ResultadoCedula => ({ estado: "error" }))
    .then((resultado) => {
      if (resultado.estado !== "encontrada") {
        consultasCedula.delete(cedulaNormalizada);
      }
      return resultado;
    });

  consultasCedula.set(cedulaNormalizada, consulta);
  return consulta;
};
