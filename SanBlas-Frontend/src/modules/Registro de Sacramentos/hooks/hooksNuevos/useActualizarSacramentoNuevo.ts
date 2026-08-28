import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarSacramento } from '../../services/sacramentosNuevosService';
import { ActualizarSacramentoInput } from '../../../../types/sacramentosNuevos';

export const useActualizarSacramentoNuevo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarSacramentoInput }) =>
      actualizarSacramento({ id, dto }),
    mutationKey: ['sacramentos-nuevos', 'actualizar'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos', 'buscar'] });
      queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos', 'detalle'] });
    },
  });
};