import { RegistroBautismo } from "../../../types/registroSacramento";
import { apiBautismo } from "../Api/ApiConfigBautismo";

const BIN_ID = import.meta.env.VITE_BAUTISMO_BIN_ID;

export const fetchGetBautismo = async (): Promise<RegistroBautismo[]> => {
  const response = await apiBautismo.get(`/b/${BIN_ID}/latest?meta=false`);
  return response.data; // Directamente el array
};

export const fetchCreateBautismo = async (bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
  const current = await fetchGetBautismo();
  const newBautismo = { ...bautismo, id: Date.now() };
  await apiBautismo.put(`/b/${BIN_ID}`, [...current, newBautismo]);
  return newBautismo;
};

export const fetchDeleteBautismo = async (id: number): Promise<void> => {
  const current = await fetchGetBautismo();
  await apiBautismo.put(`/b/${BIN_ID}`, current.filter(b => b.id !== id));
};

export const fetchUpdateBautismo = async (bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
  const current = await fetchGetBautismo();
  const updated = current.map(b => b.id === bautismo.id ? bautismo : b);
  await apiBautismo.put(`/b/${BIN_ID}`, updated);
  return bautismo;
};