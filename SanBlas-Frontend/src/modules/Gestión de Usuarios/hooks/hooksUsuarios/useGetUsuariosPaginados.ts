// Hook para la lista paginada de usuarios con búsqueda server-side.
// Mantiene página/límite/búsqueda y refresca automáticamente cuando cambian.
import { useCallback, useEffect, useState } from 'react';
import type { Usuario } from '../../../../types/Usuario';
import { getUsersPaginados } from '../../services/userServices';

const LIMITE_INICIAL = 10;

export const useGetUsuariosPaginados = () => {
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(LIMITE_INICIAL);
  const [busqueda, setBusqueda] = useState('');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (p: number, l: number, b: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUsersPaginados(p, l, b.length > 0 ? b : undefined);
        setUsers(res.data);
        setTotal(res.total);
        setTotalPages(Math.max(1, res.pages));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar los usuarios.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void cargar(pagina, limite, busqueda);
  }, [pagina, limite, busqueda, cargar]);

  // tras eliminar/filtrar, si la página actual quedó vacía volvemos a la primera
  useEffect(() => {
    if (users.length === 0 && total > 0 && pagina > 1) {
      setPagina(1);
    }
  }, [users, total, pagina]);

  // al cambiar la búsqueda siempre reiniciamos la paginación
  const cambiarBusqueda = useCallback((valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  }, []);

  // al cambiar la cantidad por página también volvemos a la primera
  const cambiarLimite = useCallback((valor: number) => {
    setLimite(valor);
    setPagina(1);
  }, []);

  return {
    users,
    total,
    totalPages,
    loading,
    error,
    pagina,
    limite,
    busqueda,
    setPagina,
    setLimite: cambiarLimite,
    setBusqueda: cambiarBusqueda,
    refetch: () => cargar(pagina, limite, busqueda),
  };
};