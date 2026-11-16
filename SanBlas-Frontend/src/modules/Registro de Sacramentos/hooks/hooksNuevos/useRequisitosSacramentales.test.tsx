import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useRequisitosSacramentales } from "./useRequisitosSacramentales";

const mocks = vi.hoisted(() => ({ buscar: vi.fn(), obtener: vi.fn() }));
vi.mock("../../services/sacramentosNuevosService", () => ({
  buscarSacramentos: mocks.buscar,
  obtenerSacramentosPersona: mocks.obtener,
}));

// Cada prueba arranca sin caché para no acreditar sacramentos de otro expediente.
const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("consulta de requisitos por identidad", () => {
  beforeEach(() => {
    mocks.buscar.mockReset();
    mocks.obtener.mockReset();
  });

  it("normaliza la cédula y consulta únicamente el acta que coincide exactamente", async () => {
    mocks.buscar.mockResolvedValue({ items: [
      { id: 99, cedula: "1-2345-6780" }, { id: 10, cedula: "1 2345 6789" },
    ] });
    mocks.obtener.mockResolvedValue({ persona: { nombre: "Ana" }, bautismo: { id: 10 } });
    const { result } = renderHook(() => useRequisitosSacramentales("1-2345-6789", true), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.buscar).toHaveBeenCalledWith({ cedula: "123456789", page: 1, pageSize: 200 });
    expect(mocks.obtener).toHaveBeenCalledExactlyOnceWith(10);
  });

  it("no acredita un Bautismo ajeno cuando la búsqueda no tiene coincidencia exacta", async () => {
    mocks.buscar.mockResolvedValue({ items: [{ id: 99, cedula: "9-9999-9999" }] });
    const { result } = renderHook(() => useRequisitosSacramentales("1-2345-6789", true), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(mocks.obtener).not.toHaveBeenCalled();
  });

  it("no conserva los requisitos de la cédula anterior mientras consulta otra", async () => {
    mocks.buscar.mockResolvedValueOnce({ items: [{ id: 10, cedula: "1-2345-6789" }] })
      .mockImplementationOnce(() => new Promise(() => undefined));
    mocks.obtener.mockResolvedValue({ bautismo: {}, comunion: {}, confirmacion: {} });
    const { result, rerender } = renderHook(
      ({ cedula }) => useRequisitosSacramentales(cedula, true),
      { initialProps: { cedula: "123456789" }, wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ cedula: "234567890" });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(true);
  });

  it.each([["123", true], ["123456789", false]] as const)(
    "no consulta con cédula incompleta o modal cerrado (%s, %s)", (cedula, abierto) => {
      renderHook(() => useRequisitosSacramentales(cedula, abierto), { wrapper: wrapper() });
      expect(mocks.buscar).not.toHaveBeenCalled();
    },
  );
});
