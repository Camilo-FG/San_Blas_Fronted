import { apiConfig } from '../../../api/apiConfig';
import { RegistroConfirmacion } from "src/types/registroSacramento";

export const fetchGetConfirma = async (): Promise<RegistroConfirmacion[]> => {
  const response = await apiConfig.get('/Confirmacion');
  return response.data;
};

export const fetchCreateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
  const response = await apiConfig.post('/Confirmacion', confirma);
  return response.data;
};

export const fetchUpdateConfirma = async (ConfirmaActualizado: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
  const response = await apiConfig.put(`/Confirmacion/${ConfirmaActualizado.id}`, ConfirmaActualizado);
  return response.data;
};

export const fetchDeleteConfirma = async (id: number): Promise<void> => {
  await apiConfig.delete(`/Confirmacion/${id}`);
};