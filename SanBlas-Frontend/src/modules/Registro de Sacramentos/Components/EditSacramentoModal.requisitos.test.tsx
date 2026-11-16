import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditSacramentoModal from "./EditSacramentoModal";

const mocks = vi.hoisted(() => ({ ficha: vi.fn(), detalle: vi.fn(), toast: vi.fn() }));
vi.mock("../../../shared/ui", async (original) => ({
  ...(await original<typeof import("../../../shared/ui")>()),
  useToast: () => ({ showToast: mocks.toast }),
}));
vi.mock("../../../shared/hooks/useFocusTrap", () => ({ useFocusTrap: () => undefined }));
vi.mock("../hooks/hooksNuevos/useObtenerSacramentosPersona", () => ({ useObtenerSacramentosPersona: mocks.ficha }));
vi.mock("../hooks/hooksNuevos/useObtenerSacramentoNuevo", () => ({ useObtenerSacramentoNuevo: mocks.detalle }));
vi.mock("../hooks/hooksNuevos/useListarParroquias", () => ({ useListarParroquias: () => ({ data: [] }) }));
vi.mock("../hooks/hooksNuevos/useListarPresbiteros", () => ({ useListarPresbiteros: () => ({ data: [] }) }));

const persona = { id: 1, cedula: "1-2345-6789", nombre: "Ana", primerApellido: "Prueba", segundoApellido: "Local" };
const base = { fechaSacramento: "2026-01-01", parroquia: { id: 1 }, presbitero: { id: 2 }, observaciones: null };
const bautismo = {
  ...base, id: 10, tipo: "bautismo",
  detalle: { bautizado: persona, padre: null, madre: null, padrino: null, madrina: null,
    abuelos: [], fechaNacimiento: "2000-01-01", horaNacimiento: "10:00", lugarNacimiento: "Nicoya", libro: "1", folio: "2", asiento: "3" },
};
const comunion = { ...base, id: 20, tipo: "comunion", detalle: { persona } };
const matrimonio = {
  ...base, id: 40, tipo: "matrimonio",
  detalle: { contrayente1: persona, contrayente2: { ...persona, id: 2, nombre: "Luis", cedula: "2-3456-7890" }, libro: "1", folio: "2" },
};

describe("requisitos al editar el expediente", () => {
  beforeEach(() => {
    mocks.toast.mockClear();
    mocks.detalle.mockReturnValue({ data: bautismo, isPending: false, error: null });
    mocks.ficha.mockReturnValue({
      data: { persona, bautismo, comunion, confirmacion: null, matrimonio: null },
      isPending: false, isFetching: false, error: null, refetch: vi.fn(),
    });
  });

  it("no permite agregar Matrimonio mientras falta Confirmación", () => {
    render(<EditSacramentoModal isOpen onClose={() => undefined} sacramentoId={10} onCreate={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByRole("button", { name: "CONFIRMACIÓN", exact: true })).toBeEnabled();
    expect(screen.getByRole("button", { name: "MATRIMONIO", exact: true })).toBeDisabled();
  });

  it("tampoco deja guardar un matrimonio histórico que no tiene Confirmación", async () => {
    mocks.detalle.mockReturnValue({ data: matrimonio, isPending: false, error: null });
    mocks.ficha.mockReturnValue({
      data: { persona, bautismo, comunion, confirmacion: null, matrimonio },
      isPending: false, isFetching: false, error: null,
    });
    const onUpdate = vi.fn();
    const onCreate = vi.fn();
    const { container } = render(<EditSacramentoModal isOpen onClose={() => undefined} sacramentoId={40} onCreate={onCreate} onUpdate={onUpdate} />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Confirmación"));
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeDisabled();
    fireEvent.submit(container.querySelector("form")!);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("permite registrar la Confirmación faltante y luego habilita Matrimonio", async () => {
    const expediente = { persona, bautismo, comunion, confirmacion: null as object | null, matrimonio: null };
    const ficha = { data: expediente, isPending: false, isFetching: false, error: null, refetch: vi.fn().mockResolvedValue(undefined) };
    mocks.ficha.mockReturnValue(ficha);
    const onCreate = vi.fn().mockImplementation(async () => {
      expediente.confirmacion = { ...base, id: 30, tipo: "confirmacion", detalle: { persona } };
    });
    const { container } = render(<EditSacramentoModal isOpen onClose={() => undefined} sacramentoId={10} onCreate={onCreate} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "CONFIRMACIÓN", exact: true }));
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ tipo: "confirmacion" })));
    await waitFor(() => expect(screen.getByRole("button", { name: "MATRIMONIO", exact: true })).toBeEnabled());
    expect(ficha.refetch).toHaveBeenCalledTimes(1);
  });
});
