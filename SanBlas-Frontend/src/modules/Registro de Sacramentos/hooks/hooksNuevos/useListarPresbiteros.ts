import { useQuery } from '@tanstack/react-query';
import { listarPresbiteros } from '../../services/sacramentosNuevosService';

export const useListarPresbiteros = () => {
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'presbiteros'],
    queryFn: listarPresbiteros,
  });
};