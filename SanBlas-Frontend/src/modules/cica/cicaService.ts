import { apiClient, handleApiError } from "../../services/apiClient";
import type { CrearInscripcionCica, InscripcionCica } from "./types";

export const crearInscripcionCica = async (datos: CrearInscripcionCica) => {
  try {
    const { data } = await apiClient.post<{
      id: number;
      mensaje: string;
      estado: string;
    }>("/cica", datos);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const listarInscripcionesCica = async (
  vista: "solicitudes" | "historial",
  estado?: string,
) => {
  try {
    const { data } = await apiClient.get<InscripcionCica[]>("/cica", {
      params: { vista, estado },
    });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const consultarInscripcionCica = async (cedula: string) => {
  try {
    const { data } = await apiClient.get<
      {
        id: number;
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        estado: string;
        fechaSolicitud: string;
        fechaActualizacionEstado: string | null;
      }[]
    >("/cica/consulta", { params: { cedula } });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
export const actualizarEstadoCica = async (
  id: number,
  estado: "Aprobada" | "Rechazada",
  observacionAdministrativa?: string,
) => {
  try {
    const { data } = await apiClient.put<InscripcionCica>(
      `/cica/${id}/estado`,
      { estado, observacionAdministrativa },
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
