import { useCallback, useEffect, useState } from "react";

// Hook de paginación en cliente: pagina un arreglo ya filtrado y se asegura de que la página siempre sea válida.
// Antes cada página hacía esto a mano con un Math.min solo al render, y el estado quedaba desincronizado
// (el "Siguiente" no avanzaba tras aprobar/rechazar porque el dataset encogía).
export const usePaginacionCliente = <T,>(
  items: T[],
  registrosPorPaginaInicial = 10,
) => {
  const [pagina, setPagina] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(
    registrosPorPaginaInicial,
  );

  const totalRegistros = items.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina));

  // Si el dataset se encoge (filtros, aprobar, rechazar), la página puede quedar fuera de rango:
  // ajustamos el estado de verdad, no solo el render como se hacía antes.
  useEffect(() => {
    setPagina((actual) => Math.min(actual, totalPaginas));
  }, [totalPaginas]);

  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = items.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina,
  );

  // Rango visible para el "Mostrando X-Y de Z registros" del pie.
  const desde =
    totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1;
  const hasta = Math.min(paginaActual * registrosPorPagina, totalRegistros);

  // Clampeamos al rango válido para que nadie pueda mandar una página inexistente.
  const irAPagina = (nueva: number) =>
    setPagina(Math.min(Math.max(1, nueva), totalPaginas));

  return {
    visibles,
    pagina: paginaActual,
    totalPaginas,
    totalRegistros,
    desde,
    hasta,
    registrosPorPagina,
    puedeAnterior: paginaActual > 1,
    puedeSiguiente: paginaActual < totalPaginas,
    anterior: () => irAPagina(paginaActual - 1),
    siguiente: () => irAPagina(paginaActual + 1),
    // useCallback para que las páginas puedan meterlo en un useEffect de reset sin re-dispararlo en cada render.
    reiniciar: useCallback(() => setPagina(1), []),
    // Al cambiar el tamaño de página volvemos a la primera, igual que en catequesis, para no perder el rumbo.
    cambiarRegistrosPorPagina: (nuevo: number) => {
      setRegistrosPorPagina(nuevo);
      setPagina(1);
    },
  };
};
