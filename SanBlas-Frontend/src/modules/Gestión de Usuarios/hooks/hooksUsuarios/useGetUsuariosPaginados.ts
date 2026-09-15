import { useCallback, useEffect, useState } from 'react';
import type { Usuario } from '../../../../types/Usuario';
import { getUsersPaginados } from '../../services/userServices';

const LIMITE_INICIAL = 10;

export interface FiltrosAvanzados {
  role?: string;
  state?: string;
}

export const useGetUsuariosPaginados = () => {
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(LIMITE_INICIAL);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({});
  const [users, setUsers] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (p: number, l: number, b: string, f: FiltrosAvanzados) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUsersPaginados(
          p,
          l,
          b.length > 0 ? b : undefined,
          f.role,
          f.state,
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
    void cargar(pagina, limite, busqueda, filtros);
  }, [pagina, limite, busqueda, filtros, cargar]);

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
    setPagina,
    setLimite: cambiarLimite,
    setBusqueda: cambiarBusqueda,
    aplicarFiltros,
    limpiarFiltros,
    refetch: () => cargar(pagina, limite, busqueda, filtros),
  };
};
