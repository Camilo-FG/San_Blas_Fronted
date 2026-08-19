import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../services/apiClient";
import { obtenerSolicitudesSacramentos } from "../../../services/constancias/constanciasService";

export const useGetSolicitudes = (filters?: {
  nombre?: string;
  cedula?: string;
  estado?: string;
}) => {
  return useQuery({
    queryKey: ["solicitudes", filters],
    queryFn: () => obtenerSolicitudesSacramentos(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof ApiError) {
        if (error.status === 429 || error.status === 0 || error.status >= 500) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
};
