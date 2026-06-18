import { apiClient } from '../../../services/apiClient';
import { RegistroComunion } from "src/types/registroSacramento";

export const fetchGetComunion = async (): Promise<RegistroComunion[]> => {
  const response = await apiClient.get('/Comunion');
  return response.data;
};

export const fetchCreateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
  const response = await apiClient.post('/Comunion', comunion);
  return response.data;
};

export const fetchUpdateComunion = async (ComunionActualizado: RegistroComunion): Promise<RegistroComunion> => {
  const response = await apiClient.put(`/Comunion/${ComunionActualizado.id}`, ComunionActualizado);
  return response.data;
};

export const fetchDeleteComunion = async (id: number): Promise<void> => {
  await apiClient.delete(`/Comunion/${id}`);
};
