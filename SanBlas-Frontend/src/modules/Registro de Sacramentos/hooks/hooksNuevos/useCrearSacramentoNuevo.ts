import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearSacramento } from '../../services/sacramentosNuevosService';
import { CrearSacramentoInput } from '../../../../types/sacramentosNuevos';

export const useCrearSacramentoNuevo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearSacramento,
    mutationKey: ['sacramentos-nuevos', 'crear'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos', 'buscar'] });
    },
  });
};

// Tipo auxiliar para poder tipar el uso del hook desde los componentes.
export type UseCrearSacramentoVariables = CrearSacramentoInput;