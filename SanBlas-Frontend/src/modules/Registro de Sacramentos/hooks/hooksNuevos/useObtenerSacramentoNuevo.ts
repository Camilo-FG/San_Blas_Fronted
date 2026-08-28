import { useQuery } from '@tanstack/react-query';
import { obtenerSacramento } from '../../services/sacramentosNuevosService';

export const useObtenerSacramentoNuevo = (id: number | null) => {
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'detalle', id],
    queryFn: () => obtenerSacramento(id as number),
    enabled: id !== null && id !== undefined,
  });
};