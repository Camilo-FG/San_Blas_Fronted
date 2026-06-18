import { apiClient } from '../../../services/apiClient';
import { RegistroConfirmacion } from "src/types/registroSacramento";

export const fetchGetConfirma = async (): Promise<RegistroConfirmacion[]> => {
  const response = await apiClient.get('/Confirmacion');
  return response.data;
};

export const fetchCreateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
  const response = await apiClient.post('/Confirmacion', confirma);
  return response.data;
};

export const fetchUpdateConfirma = async (ConfirmaActualizado: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
  const response = await apiClient.put(`/Confirmacion/${ConfirmaActualizado.id}`, ConfirmaActualizado);
  return response.data;
};

export const fetchDeleteConfirma = async (id: number): Promise<void> => {
  await apiClient.delete(`/Confirmacion/${id}`);
};