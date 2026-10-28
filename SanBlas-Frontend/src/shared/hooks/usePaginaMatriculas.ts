import { useQuery } from "@tanstack/react-query";
import {
  listarPaginaMatriculas,
  type FiltrosMatriculas,
} from "../../services/matriculasPaginadas";

// Los filtros forman parte de la clave: una respuesta vieja no reemplaza otra búsqueda.
export function usePaginaMatriculas<T>(
  clave: string,
  ruta: string,
  filtros: FiltrosMatriculas,
) {
  return useQuery({
    queryKey: [clave, filtros],
    queryFn: () => listarPaginaMatriculas<T>(ruta, filtros),
    refetchOnWindowFocus: false,
  });
}
