import { useQuery } from '@tanstack/react-query';
import { obtenerSacramentosPersona } from '../../services/sacramentosNuevosService';

// Agregado sacramental de la persona dueña del acta indicada (por id).
export const useObtenerSacramentosPersona = (sacramentoId: number | null) => {
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'persona', sacramentoId],
    queryFn: () => obtenerSacramentosPersona(sacramentoId as number),
    enabled: sacramentoId !== null && sacramentoId !== undefined,
    retry: false,
  });
};
