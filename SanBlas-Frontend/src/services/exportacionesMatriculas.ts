import axios from "axios";
import { ApiError, apiClient, handleApiError } from "./apiClient";

export type ModuloExportacionMatriculas = "cica" | "bautismo";
export type EstadoExportacionMatriculas =
  "todos" | "Pendiente" | "Aprobada" | "Rechazada";
export type OpcionesExportacionMatriculas = {
  estado: EstadoExportacionMatriculas;
  desde: string;
  hasta: string;
};

const CONFIGURACION = {
  cica: { ruta: "/cica/exportar" },
  bautismo: { ruta: "/catequesis-bautismo/exportar" },
} as const;

// El fallback cubre servidores que no exponen Content-Disposition por CORS.
function nombreArchivo(
  header: unknown,
  modulo: ModuloExportacionMatriculas,
  opciones: OpcionesExportacionMatriculas,
): string {
  if (typeof header === "string") {
    const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    const ascii = header.match(/filename="?([^";]+)"?/i)?.[1];
    try {
      const nombre = utf8 ? decodeURIComponent(utf8) : ascii;
      if (nombre) return nombre.split(/[\\/]/).pop()!;
    } catch {
      // Un header mal codificado no debe impedir una descarga válida.
    }
  }
  const filtros = [
    opciones.desde ? `desde_${opciones.desde}` : "",
    opciones.hasta ? `hasta_${opciones.hasta}` : "",
    opciones.estado,
  ]
    .filter((valor) => valor && valor !== "todos")
    .map((valor) => valor.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase());
  const fecha = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Costa_Rica",
  });
  return [`inscripciones_${modulo}`, ...filtros, fecha].join("_") + ".xlsx";
}

// La exportación consulta todos los coincidentes: nunca envía la página ni la búsqueda del listado.
export async function exportarMatriculas(
  modulo: ModuloExportacionMatriculas,
  opciones: OpcionesExportacionMatriculas,
): Promise<void> {
  const configuracion = CONFIGURACION[modulo];
  try {
    const respuesta = await apiClient.get<Blob>(configuracion.ruta, {
      params: {
        ...(opciones.estado !== "todos" ? { estado: opciones.estado } : {}),
        ...(opciones.desde ? { desde: opciones.desde } : {}),
        ...(opciones.hasta ? { hasta: opciones.hasta } : {}),
      },
      responseType: "blob",
    });
    const url = URL.createObjectURL(respuesta.data);
    const enlace = document.createElement("a");
    try {
      enlace.href = url;
      enlace.download = nombreArchivo(
        respuesta.headers["content-disposition"],
        modulo,
        opciones,
      );
      enlace.rel = "noopener";
      document.body.appendChild(enlace);
      enlace.click();
    } finally {
      enlace.remove();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      let payload: { mensaje?: string; message?: string } | null = null;
      try {
        payload = JSON.parse(await error.response.data.text());
      } catch {
        // Si no es JSON, se conserva el mensaje seguro que corresponde al estado HTTP.
      }
      const mensaje = payload?.mensaje ?? payload?.message;
      if (typeof mensaje === "string")
        throw new ApiError(mensaje, error.response.status);
    }
    handleApiError(error);
  }
}
