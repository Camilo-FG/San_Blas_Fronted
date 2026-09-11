import { apiClient, handleApiError } from "./apiClient";

export type LandingSectionKey =
  | "hero"
  | "sobre-nosotros"
  | "historia"
  | "contacto"
  | "horarios"
  | "bautizos";

export interface LandingSectionResponse<T = Record<string, unknown>> {
  sectionKey: LandingSectionKey;
  data: T;
  updatedAt?: string | null;
}

const BASE = "/landing";

export const obtenerSeccionesLanding = async (): Promise<
  LandingSectionResponse[]
> => {
  try {
    const { data } = await apiClient.get<LandingSectionResponse[]>(BASE);
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
      `${BASE}/${sectionKey}`,
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarSeccionLanding = async <T = Record<string, unknown>>(
  sectionKey: LandingSectionKey,
  data: T,
  archivo?: File | null,
  archivos?: Record<string, File | undefined>,
): Promise<LandingSectionResponse<T>> => {
  try {
    const tieneArchivosNombrados = Boolean(
      archivos?.headerImageUrl || archivos?.quoteImageUrl,
    );

    if (sectionKey === "historia") {
      if (tieneArchivosNombrados) {
        const formData = new FormData();
        formData.append("Payload", JSON.stringify({ data }));
        if (archivos?.headerImageUrl) {
          formData.append("archivoEncabezado", archivos.headerImageUrl);
        }
        if (archivos?.quoteImageUrl) {
          formData.append("archivoCita", archivos.quoteImageUrl);
        }
        const { data: response } = await apiClient.put<
          LandingSectionResponse<T>
        >(`${BASE}/historia/con-imagen`, formData);
        return response;
      }

      const { data: response } = await apiClient.put<LandingSectionResponse<T>>(
        `${BASE}/historia`,
        data,
      );
      return response;
    }

    if (
      (sectionKey === "hero" || sectionKey === "sobre-nosotros") &&
      archivo
    ) {
      const formData = new FormData();
      formData.append("Payload", JSON.stringify({ data }));
      formData.append("archivo", archivo);
      const { data: response } = await apiClient.put<LandingSectionResponse<T>>(
        `${BASE}/${sectionKey}/con-imagen`,
        formData,
      );
      return response;
    }

    const { data: response } = await apiClient.put<LandingSectionResponse<T>>(
      `${BASE}/${sectionKey}`,
      data,
    );
    return response;
  } catch (error) {
    handleApiError(error);
  }
};
