import { useQuery } from '@tanstack/react-query';
import { buscarSacramentos } from '../../services/sacramentosNuevosService';
import { BuscarSacramentosParams } from '../../../../types/sacramentosNuevos';

export const useBuscarSacramentosNuevos = (filtros: BuscarSacramentosParams) => {
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'buscar', filtros],
    queryFn: () => buscarSacramentos(filtros),
    placeholderData: (prev) => prev,
  });
};