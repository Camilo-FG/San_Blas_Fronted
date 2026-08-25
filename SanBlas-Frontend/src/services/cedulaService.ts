import { apiClient } from "./apiClient";

export const existeCedula = async (cedula: string): Promise<boolean> => {
  const { data } = await apiClient.get(`/usuario/cedula/${cedula}`);
  return Boolean(data) && Object.keys(data).length > 0;
};
