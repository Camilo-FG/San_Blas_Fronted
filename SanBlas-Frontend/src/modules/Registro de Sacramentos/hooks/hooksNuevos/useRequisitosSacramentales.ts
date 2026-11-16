import { useQuery } from '@tanstack/react-query';
import { buscarSacramentos, obtenerSacramentosPersona } from '../../services/sacramentosNuevosService';

// Consulta el expediente exacto de la persona, nunca el bautismo de otro registro de la tabla.
export const useRequisitosSacramentales = (cedula: string, abierto: boolean) => {
  const normalizada = cedula.replace(/[-\s]/g, '');
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'requisitos', normalizada],
    enabled: abierto && normalizada.length === 9,
    retry: false,
    queryFn: async () => {
      const pagina = await buscarSacramentos({ cedula: normalizada, page: 1, pageSize: 200 });
      const acta = pagina.items.find((item) => item.cedula?.replace(/[-\s]/g, '') === normalizada);
      return acta ? obtenerSacramentosPersona(acta.id) : null;
    },
  }); // sin placeholderData: al cambiar de cédula no se reutilizan los requisitos de la persona anterior
};
