import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  obtenerDatosCedula,
  type ResultadoCedula,
} from "../../services/cedulaService";
import { useAutocompletarCedula } from "./useAutocompletarCedula";

vi.mock("../../services/cedulaService", () => ({
  obtenerDatosCedula: vi.fn(),
}));
const datos = {
  nombre: "Ana María",
  primerApellido: "Pérez",
  segundoApellido: "Solís",
};
const encontrada: ResultadoCedula = { estado: "encontrada", datos };

beforeEach(() => vi.mocked(obtenerDatosCedula).mockReset());

describe("Autocompletar identificación sin storage", () => {
  it("consulta solo al completar nueve dígitos nacionales", async () => {
    vi.mocked(obtenerDatosCedula).mockResolvedValue(encontrada);
    const completar = vi.fn();
    const { result } = renderHook(() => useAutocompletarCedula());
    await act(() => result.current.verificar("10234", "nacional", completar));
    expect(obtenerDatosCedula).not.toHaveBeenCalled();
    await act(() =>
      result.current.verificar("102340567", "nacional", completar),
    );
    expect(completar).toHaveBeenCalledWith(datos);
    expect(result.current.estado).toBe("encontrada");
  });

  it("permite llenar extranjeras sin consultar el padrón ni escribir en storage", async () => {
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const completar = vi.fn();
    const { result } = renderHook(() => useAutocompletarCedula());
    await act(() =>
      result.current.verificar("123456789012", "extranjera", completar),
    );
    expect(obtenerDatosCedula).not.toHaveBeenCalled();
    expect(completar).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
    expect(result.current.estado).toBe("inactiva");
  });

  it("ignora respuestas atrasadas cuando cambia la cédula", async () => {
    let resolver!: (valor: ResultadoCedula) => void;
    vi.mocked(obtenerDatosCedula).mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );
    vi.mocked(obtenerDatosCedula).mockResolvedValueOnce(encontrada);
    const completar = vi.fn();
    const { result } = renderHook(() => useAutocompletarCedula());
    act(() => {
      void result.current.verificar("102340568", "nacional", completar);
    });
    await act(() =>
      result.current.verificar("102340567", "nacional", completar),
    );
    await act(async () => {
      resolver({ estado: "encontrada", datos: { ...datos, nombre: "Otra persona" } });
    });
    expect(completar).toHaveBeenCalledTimes(1);
    expect(completar).toHaveBeenCalledWith(datos);
  });

  it("invalida una consulta al pasar a extranjera o borrar dígitos", async () => {
    let resolver!: (valor: ResultadoCedula) => void;
    vi.mocked(obtenerDatosCedula).mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );
    const completar = vi.fn();
    const { result } = renderHook(() => useAutocompletarCedula());
    act(() => {
      void result.current.verificar("102340567", "nacional", completar);
    });
    await act(() => result.current.verificar("", "extranjera", completar));
    await act(async () => {
      resolver(encontrada);
    });
    expect(completar).not.toHaveBeenCalled();
    expect(result.current.estado).toBe("inactiva");
  });

  it("distingue cédula no encontrada de error de red y deja reintentar", async () => {
    vi.mocked(obtenerDatosCedula)
      .mockResolvedValueOnce({ estado: "no_encontrada" })
      .mockRejectedValueOnce(new Error("sin red"))
      .mockResolvedValueOnce(encontrada);
    const completar = vi.fn();
    const { result } = renderHook(() => useAutocompletarCedula());
    await act(() =>
      result.current.verificar("102340567", "nacional", completar),
    );
    expect(result.current.estado).toBe("no_encontrada");
    await act(() =>
      result.current.verificar("102340567", "nacional", completar),
    );
    expect(result.current.estado).toBe("error");
    await act(() =>
      result.current.verificar("102340567", "nacional", completar),
    );
    await waitFor(() => expect(result.current.estado).toBe("encontrada"));
  });

  it("no completa el formulario después de desmontarlo", async () => {
    let resolver!: (valor: ResultadoCedula) => void;
    vi.mocked(obtenerDatosCedula).mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );
    const completar = vi.fn();
    const { result, unmount } = renderHook(() => useAutocompletarCedula());
    act(() => {
      void result.current.verificar("102340567", "nacional", completar);
    });
    unmount();
    await act(async () => {
      resolver(encontrada);
    });
    expect(completar).not.toHaveBeenCalled();
  });
});
