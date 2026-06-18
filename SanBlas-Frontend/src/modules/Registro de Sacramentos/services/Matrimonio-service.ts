import { apiConfig } from '../../../api/apiConfig';
import { RegistroMatrimonio } from "src/types/registroSacramento";

export const fetchGetMatrimonio = async (): Promise<RegistroMatrimonio[]> => {
  const response = await apiConfig.get('/Matrimonio');
  return response.data;
};

export const fetchCreateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
  const response = await apiConfig.post('/Matrimonio', matrimonio);
  return response.data;
};

export const fetchUpdateMatrimonio = async (MatrimonioActualizado: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
  const response = await apiConfig.put(`/Matrimonio/${MatrimonioActualizado.id}`, MatrimonioActualizado);
  return response.data;
};

export const fetchDeleteMatrimonio = async (id: number): Promise<void> => {
  await apiConfig.delete(`/Matrimonio/${id}`);
};