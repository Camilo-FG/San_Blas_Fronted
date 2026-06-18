import { apiClient, handleApiError } from "./apiClient";

export type LandingSectionKey =
  | "hero"
  | "sobre-nosotros"
  | "contacto"
  | "horarios"
  | "bautizos";

export interface LandingSectionResponse<T = Record<string, unknown>> {
  sectionKey: LandingSectionKey;
  data: T;
  updatedAt?: string;
}

export const obtenerSeccionesLanding = async (): Promise<
  LandingSectionResponse[]
> => {
  try {
    const { data } = await apiClient.get<LandingSectionResponse[]>("/landing");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerSeccionLanding = async <T = Record<string, unknown>>(
  sectionKey: LandingSectionKey,
): Promise<LandingSectionResponse<T>> => {
  try {
    const { data } = await apiClient.get<LandingSectionResponse<T>>(
      `/landing/${sectionKey}`,
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarSeccionLanding = async <T = Record<string, unknown>>(
  sectionKey: LandingSectionKey,
  data: T,
): Promise<LandingSectionResponse<T>> => {
  try {
    const { data: response } = await apiClient.put<LandingSectionResponse<T>>(
      `/landing/${sectionKey}`,
      { data },
    );
    return response;
  } catch (error) {
    handleApiError(error);
  }
};
