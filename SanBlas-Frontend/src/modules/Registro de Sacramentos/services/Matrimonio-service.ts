import { apiClient } from '../../../services/apiClient';
import { RegistroMatrimonio } from "src/types/registroSacramento";

export const fetchGetMatrimonio = async (): Promise<RegistroMatrimonio[]> => {
  const response = await apiClient.get('/Matrimonio');
  return response.data;
};

export const fetchCreateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
  const response = await apiClient.post('/Matrimonio', matrimonio);
  return response.data;
};

export const fetchUpdateMatrimonio = async (MatrimonioActualizado: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
  const response = await apiClient.put(`/Matrimonio/${MatrimonioActualizado.id}`, MatrimonioActualizado);
  return response.data;
};

export const fetchDeleteMatrimonio = async (id: number): Promise<void> => {
  await apiClient.delete(`/Matrimonio/${id}`);
};