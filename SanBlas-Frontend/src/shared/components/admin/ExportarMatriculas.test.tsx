import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExportarMatriculas } from "./ExportarMatriculas";
import { ApiError } from "../../../services/apiClient";

const { exportar, showToast } = vi.hoisted(() => ({
  exportar: vi.fn(),
  showToast: vi.fn(),
}));
vi.mock("../../../services/exportacionesMatriculas", async (original) => ({
  ...(await original<
    typeof import("../../../services/exportacionesMatriculas")
  >()),
  exportarMatriculas: exportar,
}));
vi.mock("../../ui", async (original) => ({
  ...(await original<typeof import("../../ui")>()),
  useToast: () => ({ showToast }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  exportar.mockResolvedValue(undefined);
});

// Usa el selector real, no un select simulado: conserva el comportamiento del modal juvenil.
function elegir(campo: string, opcion: string) {
  const selector = screen.getByRole("button", { name: campo });
  fireEvent.click(selector);
  // El menú anterior puede seguir montado durante su animación de salida.
  fireEvent.click(
    within(selector.parentElement!).getByRole("button", {
      name: opcion,
    }),
  );
}

describe("exportación en los paneles", () => {
  it.each(["cica", "bautismo"] as const)(
    "%s replica el modal y envía sus filtros sin modificar el listado",
    async (modulo) => {
      render(<ExportarMatriculas modulo={modulo} />);
      const abrir = screen.getByRole("button", { name: "Exportar tabla" });
      expect(abrir).toHaveClass("bg-teal");
      fireEvent.click(abrir);
      const modal = screen.getByRole("dialog", { name: "Exportar tabla" });
      expect(modal).toHaveClass("max-w-xl", "dark:bg-[#0a1425]");
      expect(
        screen.queryByRole("button", { name: "Nivel" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Filial" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Sacramento" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Condición" }),
      ).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Desde"), {
        target: { value: "2026-10-01" },
      });
      fireEvent.change(screen.getByLabelText("Hasta"), {
        target: { value: "2026-10-28" },
      });
      elegir("Estado", "Aprobadas");
      const confirmar = screen.getByRole("button", {
        name: "Exportar",
      });
      expect(confirmar).toHaveClass("bg-royal-blue");
      fireEvent.click(confirmar);
      await waitFor(() =>
        expect(exportar).toHaveBeenCalledWith(modulo, {
          estado: "Aprobada",
          desde: "2026-10-01",
          hasta: "2026-10-28",
        }),
      );
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(showToast).toHaveBeenCalledWith(
        "Se exportó el archivo de Excel.",
        "success",
      );
    },
  );

  it("bloquea doble envío, filtros y cierre durante la descarga", async () => {
    let terminar!: () => void;
    exportar.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          terminar = resolve;
        }),
    );
    render(<ExportarMatriculas modulo="cica" />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar tabla" }));
    const confirmar = screen.getByRole("button", {
      name: "Exportar",
    });
    fireEvent.click(confirmar);
    fireEvent.click(confirmar);
    expect(
      screen.getByRole("button", { name: "Exportando..." }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Desde")).toBeDisabled();
    expect(screen.getByLabelText("Hasta")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Estado" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar modal" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(exportar).toHaveBeenCalledTimes(1);
    await act(async () => terminar());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sin resultados conserva el modal y los filtros para poder reintentar", async () => {
    exportar.mockRejectedValueOnce(
      new ApiError("No hay solicitudes para los filtros seleccionados.", 404),
    );
    render(<ExportarMatriculas modulo="bautismo" />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar tabla" }));
    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-10-01" },
    });
    fireEvent.change(screen.getByLabelText("Hasta"), {
      target: { value: "2026-10-28" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Exportar" }));
    await screen.findByText(
      "No hay solicitudes para los filtros seleccionados.",
    );
    expect(screen.getByLabelText("Desde")).toHaveValue("2026-10-01");
    expect(screen.getByLabelText("Hasta")).toHaveValue("2026-10-28");
    expect(showToast).toHaveBeenCalledWith(
      "No hay solicitudes para los filtros seleccionados.",
      "error",
    );
    fireEvent.click(screen.getByRole("button", { name: "Exportar" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(exportar).toHaveBeenCalledTimes(2);
  });

  it("cancelar no descarga y al reabrir vuelve a Todos como Juvenil", () => {
    render(<ExportarMatriculas modulo="cica" />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar tabla" }));
    elegir("Estado", "Rechazadas");
    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-10-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(exportar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Exportar tabla" }));
    expect(screen.getByRole("button", { name: "Estado" })).toHaveTextContent(
      "Todos",
    );
    expect(screen.getByLabelText("Desde")).toHaveValue("");
    expect(screen.getByLabelText("Hasta")).toHaveValue("");
  });

  it("no permite descargar un rango invertido y acepta fechas iguales", async () => {
    render(<ExportarMatriculas modulo="cica" />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar tabla" }));
    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-10-28" },
    });
    fireEvent.change(screen.getByLabelText("Hasta"), {
      target: { value: "2026-10-01" },
    });
    await waitFor(() =>
      expect(
        screen.getByText(
          "La fecha desde no puede ser posterior a la fecha hasta.",
        ),
      ).toBeVisible(),
    );
    const confirmar = screen.getByRole("button", { name: "Exportar" });
    expect(confirmar).toBeDisabled();
    fireEvent.click(confirmar);
    expect(exportar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Hasta"), {
      target: { value: "2026-10-28" },
    });
    expect(confirmar).toBeEnabled();
    fireEvent.click(confirmar);
    await waitFor(() =>
      expect(exportar).toHaveBeenCalledWith("cica", {
        estado: "todos",
        desde: "2026-10-28",
        hasta: "2026-10-28",
      }),
    );
  });
});
