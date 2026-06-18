import { useQuery } from "@tanstack/react-query";
import { obtenerSolicitudesSacramentos } from "../../../services/constancias/constanciasService";

export const useGetSolicitudes = () => {
  return useQuery({
    queryKey: ["solicitudes"],
    queryFn: obtenerSolicitudesSacramentos,
  });
};
