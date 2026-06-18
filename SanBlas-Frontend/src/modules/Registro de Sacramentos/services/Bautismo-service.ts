import { apiClient } from "../../../services/apiClient";
import { RegistroBautismo } from "src/types/registroSacramento";

export const fetchGetBautismo = async (): Promise<RegistroBautismo[]> => {
  const response = await apiClient.get('/Bautismo');
  return response.data;
};

export const fetchCreateBautismo = async (bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
  const response = await apiClient.post('/Bautismo', bautismo);
  return response.data;
};

export const fetchUpdateBautismo = async (bautismoActualizado: RegistroBautismo): Promise<RegistroBautismo> => {
  const response = await apiClient.put(`/Bautismo/${bautismoActualizado.id}`, bautismoActualizado);
  return response.data;
};

export const fetchDeleteBautismo = async (id: number): Promise<void> => {
  await apiClient.delete(`/Bautismo/${id}`);
};