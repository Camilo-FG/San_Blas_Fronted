import { useQuery } from "@tanstack/react-query";
import {
  idPorNombre,
  obtenerCantonesCR,
  obtenerDistritosCR,
  obtenerProvinciasCR,
  type OpcionUbicacion,
} from "../../services/ubicacionesCostaRica";

const STALE_MS = 1000 * 60 * 60 * 24; // 24 h

export function useProvinciasCR() {
  return useQuery({
    queryKey: ["ubicaciones-cr", "provincias"],
    queryFn: obtenerProvinciasCR,
    staleTime: STALE_MS,
    retry: 1,
  });
}

export function useCantonesCR(provinciaId: string | undefined) {
  return useQuery({
    queryKey: ["ubicaciones-cr", "cantones", provinciaId],
    queryFn: () => obtenerCantonesCR(provinciaId!),
    enabled: Boolean(provinciaId),
    staleTime: STALE_MS,
    retry: 1,
  });
}

export function useDistritosCR(
  provinciaId: string | undefined,
  cantonId: string | undefined,
) {
  return useQuery({
    queryKey: ["ubicaciones-cr", "distritos", provinciaId, cantonId],
    queryFn: () => obtenerDistritosCR(provinciaId!, cantonId!),
    enabled: Boolean(provinciaId && cantonId),
    staleTime: STALE_MS,
    retry: 1,
  });
}

export function resolverIdPorNombre(
  opciones: OpcionUbicacion[] | undefined,
  nombre: string,
): string | undefined {
  if (!opciones?.length || !nombre.trim()) return undefined;
  return idPorNombre(opciones, nombre);
}
