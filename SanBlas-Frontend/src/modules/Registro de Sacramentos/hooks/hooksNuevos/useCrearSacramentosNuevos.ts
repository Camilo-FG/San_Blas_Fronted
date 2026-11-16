import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearSacramentos } from '../../services/sacramentosNuevosService';

// Un solo envío evita dejar actas parciales cuando se rechaza alguno de los sacramentos.
export const useCrearSacramentosNuevos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearSacramentos,
    mutationKey: ['sacramentos-nuevos', 'crear-lote'],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos'] }),
  });
};
