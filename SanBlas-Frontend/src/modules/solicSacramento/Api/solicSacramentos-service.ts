import { FormSacramento } from "../../../types/formSacramento";
import { apiClient } from "./apiConfig";

//usando Axios

// POST deshabilitado para evitar crear bins nuevos en JSONBin.
// La solicitud se agrega al arreglo existente y se guarda con PUT en el bin fijo.
export async function CreateSolicSacramento(sacramento: FormSacramento) {
  const currentSolicitudes = await getSolicitudes();
  const nextSolicitud = {
    ...sacramento,
    id: sacramento.id ?? Date.now(),
  };
  const updatedSolicitudes = Array.isArray(currentSolicitudes)
    ? [...currentSolicitudes, nextSolicitud]
    : [nextSolicitud];

  const response = await apiClient.put('/', updatedSolicitudes);
  return response.data.record; // JSONBin envuelve en "record"
}

// GET — Leer datos
export const getSolicitudes = async () => {
  const response = await apiClient.get(`/latest`);
  return response.data.record; // JSONBin envuelve en "record"
};

// PUT — Guardar/actualizar datos
export const saveSolicitud = async (data: any) => {
  const response = await apiClient.put('/', data);
  return response.data.record;
};
