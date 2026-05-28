import { RegistroComunion } from "../../../types/registroSacramento";
import { apiComunion } from "../Api/ApiConfigComunion";

const BIN_ID = import.meta.env.VITE_COMUNION_BIN_ID;

export const fetchGetComunion = async (): Promise<RegistroComunion[]> => {
  const response = await apiComunion.get(`/b/${BIN_ID}/latest?meta=false`);
  return response.data; 
};

export const fetchCreateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
  const current = await fetchGetComunion();
  const newComunion = { ...comunion, id: Date.now() };
  await apiComunion.put(`/b/${BIN_ID}`, [...current, newComunion]);
  return newComunion;
};

export const fetchDeleteComunion = async (id: number): Promise<void> => {
  const current = await fetchGetComunion();
  await apiComunion.put(`/b/${BIN_ID}`, current.filter(b => b.id !== id));
};

export const fetchUpdateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
  const current = await fetchGetComunion();
  const updated = current.map(b => b.id === comunion.id ? comunion : b);
  await apiComunion.put(`/b/${BIN_ID}`, updated);
  return comunion;
};