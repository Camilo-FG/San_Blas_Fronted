import { RegistroConfirmacion } from "src/types/registroSacramento";
import { apiConfirma } from "../Api/ApiConfigConfirma";

const BIN_ID = import.meta.env.VITE_CONFIRMACION_BIN_ID;

export const fetchGetConfirma = async (): Promise<RegistroConfirmacion[]> => {
  const response = await apiConfirma.get(`/b/${BIN_ID}/latest?meta=false`);
  return response.data; // Directamente el array
};

export const fetchCreateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
  const current = await fetchGetConfirma();
  const newConfirma = { ...confirma, id: Date.now() };
  await apiConfirma.put(`/b/${BIN_ID}`, [...current, newConfirma]);
  return newConfirma;
};

export const fetchDeleteConfirma = async (id: number): Promise<void> => {
  const current = await fetchGetConfirma();
  await apiConfirma.put(`/b/${BIN_ID}`, current.filter(b => b.id !== id));
};

export const fetchUpdateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
  const current = await fetchGetConfirma();
  const updated = current.map(b => b.id === confirma.id ? confirma : b);
  await apiConfirma.put(`/b/${BIN_ID}`, updated);
  return confirma;
};