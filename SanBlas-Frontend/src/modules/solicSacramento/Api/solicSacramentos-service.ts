import { FormSacramento } from "src/types/formSacramento";
import { apiClient } from "./apiConfig";

//usando Axios

const BIN_ID = '6a122ded6610dd3ae895173d';

//Post — Crear nuevo producto
export async function CreateSolicSacramento(sacramento: FormSacramento) {
  // Usar POST a /v3/b para crear un nuevo bin (la Access Key permite POST)
  const response = await apiClient.post(`/`, sacramento);
  return response.data.record; // JSONBin envuelve en "record"
}

// GET — Leer datos
export const getSolicitudes = async () => {
  const response = await apiClient.get(`/${BIN_ID}/latest`);
  return response.data.record; // JSONBin envuelve en "record"
};

// PUT — Guardar/actualizar datos
export const saveSolicitud = async (data: any) => {
  const response = await apiClient.put(`/${BIN_ID}`, data);
  return response.data.record;
};
