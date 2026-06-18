import { apiConfig } from '../../../api/apiConfig';
import { RegistroBautismo } from "src/types/registroSacramento";

export const fetchGetBautismo = async (): Promise<RegistroBautismo[]> => {
  const response = await apiConfig.get('/Bautismo');
  return response.data;
};

export const fetchCreateBautismo = async (bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
  const response = await apiConfig.post('/Bautismo', bautismo);
  return response.data;
};

export const fetchUpdateBautismo = async (bautismoActualizado: RegistroBautismo): Promise<RegistroBautismo> => {
  const response = await apiConfig.put(`/Bautismo/${bautismoActualizado.id}`, bautismoActualizado);
  return response.data;
};

export const fetchDeleteBautismo = async (id: number): Promise<void> => {
  await apiConfig.delete(`/Bautismo/${id}`);
};