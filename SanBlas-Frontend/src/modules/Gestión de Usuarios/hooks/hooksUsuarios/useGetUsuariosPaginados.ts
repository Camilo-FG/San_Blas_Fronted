import { useCallback, useEffect, useState } from 'react';
import type { Usuario } from '../../../../types/Usuario';
import { getUsersPaginados, type OrdenUsuarios } from '../../services/userServices';

const LIMITE_INICIAL = 10;

// el orden por defecto es el más reciente primero, igual que el backend
const ORDEN_INICIAL: OrdenUsuarios = { campo: 'createdAt', direccion: 'desc' };

export interface FiltrosAvanzados {
  role?: string;
  state?: string;
}

export const useGetUsuariosPaginados = () => {
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(LIMITE_INICIAL);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({});
  const [orden, setOrden] = useState<OrdenUsuarios>(ORDEN_INICIAL);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (
      p: number,
      l: number,
      b: string,
      f: FiltrosAvanzados,
      o: OrdenUsuarios,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUsersPaginados(
          p,
          l,
          b.length > 0 ? b : undefined,
          f.role,
          f.state,
          o,
        );
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
    void cargar(pagina, limite, busqueda, filtros, orden);
  }, [pagina, limite, busqueda, filtros, orden, cargar]);

  useEffect(() => {
    if (users.length === 0 && total > 0 && pagina > 1) {
      setPagina(1);
    }
  }, [users, total, pagina]);

  const cambiarBusqueda = useCallback((valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  }, []);

  const cambiarLimite = useCallback((valor: number) => {
    setLimite(valor);
    setPagina(1);
  }, []);

  const aplicarFiltros = useCallback((nuevosFiltros: FiltrosAvanzados) => {
    setFiltros(nuevosFiltros);
    setPagina(1);
  }, []);

  // al reordenar volvemos a la primera página: ordenar la página 4 suelta no tendría sentido
  const cambiarOrden = useCallback((nuevoOrden: OrdenUsuarios) => {
    setOrden(nuevoOrden);
    setPagina(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({});
    setBusqueda('');
    setPagina(1);
  }, []);

  const filtrosActivos = Object.values(filtros).filter(
    (v) => v !== undefined && v !== '',
  ).length + (busqueda.trim() ? 1 : 0);

  return {
    users,
    total,
    totalPages,
    loading,
    error,
    pagina,
    limite,
    busqueda,
    filtros,
    filtrosActivos,
    orden,
    setPagina,
    setLimite: cambiarLimite,
    setBusqueda: cambiarBusqueda,
    setOrden: cambiarOrden,
    aplicarFiltros,
    limpiarFiltros,
    refetch: () => cargar(pagina, limite, busqueda, filtros, orden),
  };
};
