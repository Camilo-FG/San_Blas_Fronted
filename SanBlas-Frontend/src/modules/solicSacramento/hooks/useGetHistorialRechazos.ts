import { useQuery } from "@tanstack/react-query";
import { obtenerHistorialRechazos } from "../../../services/constancias/constanciasService";

export const useGetHistorialRechazos = () => {
  return useQuery({
    queryKey: ["historialRechazos"],
    queryFn: obtenerHistorialRechazos,
  });
};