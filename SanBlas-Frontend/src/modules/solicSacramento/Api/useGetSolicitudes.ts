import { useQuery } from "@tanstack/react-query";
import { getSolicitudes } from "./solicSacramentos-service";

// useGetSolicitudes.ts
export const useGetSolicitudes = () => {
  return useQuery({
    queryKey: ['solicitudes'], 
    queryFn: getSolicitudes,
  });
};