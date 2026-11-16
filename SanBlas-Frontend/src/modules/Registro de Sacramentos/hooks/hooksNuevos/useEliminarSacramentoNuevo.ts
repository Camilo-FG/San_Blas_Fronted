import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarSacramento } from '../../services/sacramentosNuevosService';

export const useEliminarSacramentoNuevo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarSacramento,
    mutationKey: ['sacramentos-nuevos', 'eliminar'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos', 'buscar'] });
      queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos', 'persona'] });
      queryClient.invalidateQueries({ queryKey: ['sacramentos-nuevos', 'requisitos'] }); // un acta eliminada deja de cumplir requisitos
    },
  });
};
