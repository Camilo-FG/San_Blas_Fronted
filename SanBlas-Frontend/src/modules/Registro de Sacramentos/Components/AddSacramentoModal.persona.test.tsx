import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddSacramentoModal from "./AddSacramentoModal";

const { toast, requisitos } = vi.hoisted(() => ({ toast: vi.fn(), requisitos: vi.fn() }));
vi.mock("../../../shared/ui", async (original) => ({
  ...(await original<typeof import("../../../shared/ui")>()),
  useToast: () => ({ showToast: toast }),
}));
vi.mock("../../../shared/hooks/useFocusTrap", () => ({ useFocusTrap: () => undefined }));
vi.mock("../hooks/hooksNuevos/useRequisitosSacramentales", () => ({ useRequisitosSacramentales: requisitos }));
vi.mock("../hooks/hooksNuevos/useListarParroquias", () => ({
  useListarParroquias: () => ({ data: [{ id: 1, nombre: "Filial de prueba" }], isPending: false }),
}));
vi.mock("../hooks/hooksNuevos/useListarPresbiteros", () => ({
  useListarPresbiteros: () => ({ data: [{ id: 2, nombre: "Pedro", primerApellido: "Prueba" }], isPending: false }),
}));

const vacia = { cedula: "", nombre: "", primerApellido: "", segundoApellido: "" };
const bautizado = { cedula: "1-2345-6789", nombre: "Ana", primerApellido: "Prueba", segundoApellido: "Local" };
const detalleCompleto = { fechaNacimiento: "2000-01-01", horaNacimiento: "10:00", lugarNacimiento: "Nicoya", libro: "1", folio: "2", asiento: "3" };
const celebracion = (fechaSacramento = "2026-01-01") => ({ idParroquia: "1", idPresbitero: "2", fechaSacramento });
const celebracionesVacias = () => Object.fromEntries(["bautismo", "comunion", "confirmacion", "matrimonio"]
  .map((tipo) => [tipo, { idParroquia: "", idPresbitero: "", fechaSacramento: "" }]));

// Conserva compatibilidad con borradores antiguos y permite preparar varias pestañas.
const guardarBorrador = (cambios: Record<string, unknown> = {}) => {
  localStorage.setItem("sanblas.borrador.registro-sacramentos", JSON.stringify({
    tipo: "bautismo", idParroquia: "", idPresbitero: "", fechaSacramento: "",
    observaciones: "", bautizado, padre: vacia, madre: vacia, padrino: vacia, madrina: vacia,
    abuelos: [], persona: vacia, contrayente1: vacia, contrayente2: vacia,
    detalleBautismo: { fechaNacimiento: "", horaNacimiento: "", lugarNacimiento: "", libro: "", folio: "", asiento: "" },
    detalleMatrimonio: { libro: "", folio: "" },
    ...cambios,
  }));
};

describe("envío conjunto de sacramentos", () => {
  beforeEach(() => {
    localStorage.clear();
    toast.mockClear();
    requisitos.mockReturnValue({ data: null, isFetching: false, isError: false });
  });

  it("quita el texto informativo y permite visitar todas las pestañas sin bloquear el botón de envío", () => {
    render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={vi.fn()} />);
    expect(screen.queryByText(/Los sacramentos previos deben estar guardados/)).not.toBeInTheDocument();
    for (const nombre of [/bautismo/i, /comunión/i, /confirmación/i, /matrimonio/i]) {
      expect(screen.getByRole("button", { name: nombre })).toBeEnabled();
    }
    fireEvent.click(screen.getByRole("button", { name: /matrimonio/i }));
    expect(screen.getByRole("button", { name: /inscribir acta/i })).toBeEnabled();
  });

  it("envía Bautismo y Comunión juntos con fechas independientes y la misma persona", async () => {
    guardarBorrador({
      celebraciones: { ...celebracionesVacias(), bautismo: celebracion(), comunion: celebracion("2026-02-01") },
      detalleBautismo: detalleCompleto,
    });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /comunión/i }));
    expect(container.querySelector('[name="fechaSacramento"]')).toHaveValue("2026-02-01");
    fireEvent.click(screen.getByRole("button", { name: /bautismo/i }));
    expect(container.querySelector('[name="fechaSacramento"]')).toHaveValue("2026-01-01");
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith([
      expect.objectContaining({ tipo: "bautismo", fechaSacramento: "2026-01-01" }),
      expect.objectContaining({ tipo: "comunion", fechaSacramento: "2026-02-01", comunion: { persona: bautizado } }),
    ]));
    await waitFor(() => expect(localStorage.getItem("sanblas.borrador.registro-sacramentos")).toBeNull());
  });

  it("permite enviar las cuatro actas sin exigir que los requisitos ya estuvieran guardados", async () => {
    guardarBorrador({
      celebraciones: { bautismo: celebracion(), comunion: celebracion(), confirmacion: celebracion(), matrimonio: celebracion() },
      detalleBautismo: detalleCompleto,
      contrayente2: { ...vacia, nombre: "Luis", primerApellido: "Prueba" },
      detalleMatrimonio: { libro: "1", folio: "2" },
    });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].map((acta: { tipo: string }) => acta.tipo))
      .toEqual(["bautismo", "comunion", "confirmacion", "matrimonio"]);
  });

  it("combina requisitos persistidos con Comunión y Confirmación del mismo envío", async () => {
    guardarBorrador({
      celebraciones: { ...celebracionesVacias(), comunion: celebracion(), confirmacion: celebracion() },
    });
    requisitos.mockReturnValue({ data: { persona: bautizado, bautismo: {} }, isFetching: false, isError: false });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith([
      expect.objectContaining({ tipo: "comunion", comunion: { persona: bautizado } }),
      expect.objectContaining({ tipo: "confirmacion", confirmacion: { persona: bautizado } }),
    ]));
  });

  it("muestra toast y no envía nada al llenar Matrimonio teniendo solo Bautismo", () => {
    guardarBorrador({ tipo: "matrimonio", ...celebracion() });
    requisitos.mockReturnValue({ data: { persona: bautizado, bautismo: {} }, isFetching: false, isError: false });
    const onSave = vi.fn();
    const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
    fireEvent.submit(container.querySelector("form")!);
    expect(onSave).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/Comunión.*Confirmación.*Matrimonio/), "error");
  });

  it("no ignora una pestaña Matrimonio parcialmente llena cuando se envía desde Bautismo", () => {
    guardarBorrador({ ...celebracion(), detalleBautismo: detalleCompleto, detalleMatrimonio: { libro: "1", folio: "" } });
    const onSave = vi.fn();
    const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
    fireEvent.submit(container.querySelector("form")!);
    expect(onSave).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/Comunión.*Confirmación/), "error");
  });

  it("un requisito incluido pero incompleto tampoco permite enviar el lote", () => {
    guardarBorrador({
      celebraciones: { ...celebracionesVacias(), confirmacion: { ...celebracion(), idPresbitero: "" }, matrimonio: celebracion() },
      contrayente2: { ...vacia, nombre: "Luis", primerApellido: "Prueba" },
      detalleMatrimonio: { libro: "1", folio: "2" },
    });
    requisitos.mockReturnValue({ data: { persona: bautizado, bautismo: {}, comunion: {} }, isFetching: false, isError: false });
    const onSave = vi.fn();
    const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
    fireEvent.submit(container.querySelector("form")!);
    expect(onSave).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/obligatorios de Confirmación/), "error");
  });

  it.each([{ isFetching: true, isError: false }, { isFetching: false, isError: true }])(
    "avisa por toast si no se pueden verificar los requisitos: %j", (estado) => {
      guardarBorrador({ tipo: "comunion", ...celebracion() });
      requisitos.mockReturnValue({ data: { persona: bautizado, bautismo: {} }, ...estado });
      const onSave = vi.fn();
      const { container } = render(<AddSacramentoModal isOpen onClose={() => undefined} onSave={onSave} />);
      fireEvent.submit(container.querySelector("form")!);
      expect(onSave).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(expect.stringContaining("verificar"), "error");
    },
  );

  it("conserva todas las pestañas y el borrador cuando el backend rechaza el lote", async () => {
    guardarBorrador({ ...celebracion(), detalleBautismo: detalleCompleto });
    const onSave = vi.fn().mockRejectedValue({ response: { status: 400, data: { mensaje: "Falta un requisito" } } });
    const onClose = vi.fn();
    const { container } = render(<AddSacramentoModal isOpen onClose={onClose} onSave={onSave} />);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(toast).toHaveBeenCalledWith("Falta un requisito", "error"));
    expect(onClose).not.toHaveBeenCalled();
    expect(container.querySelector('[name="fechaSacramento"]')).toHaveValue("2026-01-01");
    expect(localStorage.getItem("sanblas.borrador.registro-sacramentos")).not.toBeNull();
  });
});
