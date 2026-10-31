import { useEffect, useState } from "react";

// Conserva la barra existente, pero el arreglo recibido ya es una página del servidor.
export function usePaginacionServidor(filtro: string) {
  const [estado, setEstado] = useState({ filtro, pagina: 1, limite: 10 });
  // Recordar también el filtro evita restaurar la página vieja al volver a una búsqueda anterior.
  if (estado.filtro !== filtro) setEstado({ ...estado, filtro, pagina: 1 });
  const pagina = estado.filtro === filtro ? estado.pagina : 1;
  const [total, setTotal] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(total / estado.limite));

  // Si aprobar/eliminar vacía la última página, se vuelve a una página válida.
  useEffect(() => {
    if (pagina > totalPaginas)
      setEstado((actual) => ({ ...actual, filtro, pagina: totalPaginas }));
  }, [pagina, totalPaginas, filtro]);

  const ir = (nueva: number) =>
    setEstado((actual) => ({
      ...actual,
      filtro,
      pagina: Math.max(1, Math.min(nueva, totalPaginas)),
    }));
  return {
    pagina,
    registrosPorPagina: estado.limite,
    totalRegistros: total,
    totalPaginas,
    desde: total ? (pagina - 1) * estado.limite + 1 : 0,
    hasta: Math.min(pagina * estado.limite, total),
    puedeAnterior: pagina > 1,
    puedeSiguiente: pagina < totalPaginas,
    anterior: () => ir(pagina - 1),
    siguiente: () => ir(pagina + 1),
    cambiarRegistrosPorPagina: (limite: number) =>
      setEstado({ filtro, pagina: 1, limite }),
    setTotal,
  };
}
