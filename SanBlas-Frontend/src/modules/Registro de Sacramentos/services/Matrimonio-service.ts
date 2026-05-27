import { RegistroConfirmacion, RegistroMatrimonio } from "../../../types/registroSacramento";
import { apiConfirma } from "../Api/ApiConfigConfirma";
import { apiMatrimonio } from "../Api/ApiConfigMatrimonio";

const BIN_ID = import.meta.env.VITE_MATRIMONIO_BIN_ID;

export const fetchGetMatrimonio = async (): Promise<RegistroMatrimonio[]> => {
  const response = await apiMatrimonio.get(`/b/${BIN_ID}/latest?meta=false`);
  return response.data; // Directamente el array
};

export const fetchCreateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
  const current = await fetchGetMatrimonio();
  const newMatrimonio = { ...matrimonio, id: Date.now() };
  await apiMatrimonio.put(`/b/${BIN_ID}`, [...current, newMatrimonio]);
  return matrimonio;
};

export const fetchDeleteMatrimonio = async (id: number): Promise<void> => {
  const current = await fetchGetMatrimonio();
  await apiMatrimonio.put(`/b/${BIN_ID}`, current.filter(b => b.id !== id));
};

export const fetchUpdateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
  const current = await fetchGetMatrimonio();
  const updated = current.map(b => b.id === matrimonio.id ? matrimonio : b);
  await apiMatrimonio.put(`/b/${BIN_ID}`, updated);
  return matrimonio;
};