import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePaginacionServidor } from "./usePaginacionServidor";

describe("paginación del servidor", () => {
  it("usa el total global, avanza y reinicia al cambiar filtros o tamaño", async () => {
    const { result, rerender } = renderHook(
      ({ filtro }) => usePaginacionServidor(filtro),
      { initialProps: { filtro: "solicitudes" } },
    );
    act(() => result.current.setTotal(21));
    expect(result.current.totalPaginas).toBe(3);
    act(() => result.current.siguiente());
    expect(result.current.pagina).toBe(2);
    expect(result.current.desde).toBe(11);
    expect(result.current.hasta).toBe(20);
    rerender({ filtro: "historial" });
    expect(result.current.pagina).toBe(1);
    rerender({ filtro: "solicitudes" });
    expect(result.current.pagina).toBe(1);
    act(() => result.current.cambiarRegistrosPorPagina(25));
    expect(result.current.registrosPorPagina).toBe(25);
    expect(result.current.pagina).toBe(1);
    await waitFor(() => expect(result.current.totalPaginas).toBe(1));
  });
  it("corrige la última página al aprobar o eliminar su último registro", async () => {
    const { result } = renderHook(() => usePaginacionServidor("solicitudes"));
    act(() => result.current.setTotal(11));
    act(() => result.current.siguiente());
    expect(result.current.pagina).toBe(2);
    act(() => result.current.setTotal(10));
    await waitFor(() => expect(result.current.pagina).toBe(1));
    act(() => result.current.setTotal(0));
    expect(result.current.desde).toBe(0);
    expect(result.current.hasta).toBe(0);
    expect(result.current.puedeSiguiente).toBe(false);
  });
});
