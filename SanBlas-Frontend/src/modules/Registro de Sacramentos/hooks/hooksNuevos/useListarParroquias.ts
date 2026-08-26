import { useQuery } from '@tanstack/react-query';
import { listarParroquias } from '../../services/sacramentosNuevosService';

export const useListarParroquias = () => {
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'parroquias'],
    queryFn: listarParroquias,
  });
};