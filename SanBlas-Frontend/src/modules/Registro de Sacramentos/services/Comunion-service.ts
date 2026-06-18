import { apiConfig } from '../../../api/apiConfig';
import { RegistroComunion } from "src/types/registroSacramento";

export const fetchGetComunion = async (): Promise<RegistroComunion[]> => {
  const response = await apiConfig.get('/Comunion');
  return response.data;
};

export const fetchCreateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
  const response = await apiConfig.post('/Comunion', comunion);
  return response.data;
};

export const fetchUpdateComunion = async (ComunionActualizado: RegistroComunion): Promise<RegistroComunion> => {
  const response = await apiConfig.put(`/Comunion/${ComunionActualizado.id}`, ComunionActualizado);
  return response.data;
};

export const fetchDeleteComunion = async (id: number): Promise<void> => {
  await apiConfig.delete(`/Comunion/${id}`);
};
