import { apiClient, handleApiError } from "../../services/apiClient";
import type {
  CertificarCatequesisBautismo,
  CrearInscripcionCatequesisBautismo,
  InscripcionCatequesisBautismo,
} from "./types";

export const crearInscripcionCatequesisBautismo = async (
  datos: CrearInscripcionCatequesisBautismo,
) => {
  try {
    const { data } = await apiClient.post<{
      id: number;
      mensaje: string;
      estado: string;
    }>("/catequesis-bautismo", datos);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const listarInscripcionesCatequesisBautismo = async (
  vista: "solicitudes" | "historial",
  estado?: string,
) => {
  try {
    const { data } = await apiClient.get<InscripcionCatequesisBautismo[]>(
      "/catequesis-bautismo",
      { params: { vista, estado } },
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const consultarInscripcionCatequesisBautismo = async (cedula: string) => {
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
    >("/catequesis-bautismo/consulta", { params: { cedula } });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEstadoCatequesisBautismo = async (
  id: number,
  estado: "Aprobada" | "Rechazada",
  extra?: CertificarCatequesisBautismo | { observacionAdministrativa: string },
) => {
  try {
    const { data } = await apiClient.put<InscripcionCatequesisBautismo>(
      `/catequesis-bautismo/${id}/estado`,
      { estado, ...extra },
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
