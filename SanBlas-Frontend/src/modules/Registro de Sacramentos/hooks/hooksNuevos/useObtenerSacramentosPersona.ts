import { useQuery } from '@tanstack/react-query';
import { obtenerSacramentosPersona } from '../../services/sacramentosNuevosService';

export const useObtenerSacramentosPersona = (cedula: string | null) => {
  return useQuery({
    queryKey: ['sacramentos-nuevos', 'persona', cedula],
    queryFn: () => obtenerSacramentosPersona(cedula as string),
    enabled: cedula !== null && cedula !== undefined && cedula.trim() !== '',
    retry: false,
  });
};