import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GestionCatequesisBautismo from "./GestionCatequesisBautismo";
import { actualizarEstadoCatequesisBautismo, listarInscripcionesCatequesisBautismo } from "../../../catequesisBautismo/catequesisBautismoService";
import type { InscripcionCatequesisBautismo } from "../../../catequesisBautismo/types";
import { ApiError } from "../../../../services/apiClient";

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("../../../../shared/ui", async (original) => ({
  ...await original<typeof import("../../../../shared/ui")>(),
  useToast: () => ({ showToast }),
}));
vi.mock("../../../catequesisBautismo/catequesisBautismoService", () => ({
  listarInscripcionesCatequesisBautismo: vi.fn(),
  actualizarEstadoCatequesisBautismo: vi.fn(),
  eliminarInscripcionCatequesisBautismo: vi.fn(),
}));

const solicitud: InscripcionCatequesisBautismo = {
  id: 7, nombre: "Ana", apellido1: "Pérez", apellido2: null,
  fechaNacimiento: "1990-01-01", cedula: "102340567", telefono: "8888-8888",
  estadoCivil: "soltero", parroquiaOrigen: "San Blas", provincia: "Guanacaste",
  canton: "Nicoya", distrito: "Nicoya", barrio: "Centro", condicion: "padre_madre",
  estado: "Pendiente", observacionAdministrativa: null, fechaInicioCatequesis: null,
  fechaFinalizacionCatequesis: null, responsableCertifica: null,
  fechaSolicitud: "2026-01-01T12:00:00Z", fechaActualizacionEstado: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listarInscripcionesCatequesisBautismo).mockImplementation(async (vista) => vista === "solicitudes" ? [{ ...solicitud }] : []);
});

async function abrir(estado = "Pendiente") {
  const registro = { ...solicitud, estado };
  vi.mocked(listarInscripcionesCatequesisBautismo).mockImplementation(async (vista) =>
    (vista === "solicitudes") === (estado === "Pendiente") ? [registro] : [],
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidar = vi.spyOn(client, "invalidateQueries");
  render(<QueryClientProvider client={client}><GestionCatequesisBautismo /></QueryClientProvider>);
  if (estado !== "Pendiente") fireEvent.click(screen.getByRole("button", { name: "Historial" }));
  const detalles = await screen.findAllByLabelText("Ver detalle de Ana Pérez");
  fireEvent.click(detalles[0]);
  return { client, invalidar };
}

describe("rechazo de solicitudes de bautismo", () => {
  it("bloquea vacío, espacios y menos de cinco caracteres", async () => {
    await abrir();
    const rechazar = screen.getByRole("button", { name: "Rechazar" });
    expect(rechazar).toHaveClass("bg-red-600");
    fireEvent.click(rechazar);
    const confirmar = screen.getByRole("button", { name: "Rechazar solicitud" });
    const motivo = screen.getByPlaceholderText("Ej: No completó las charlas.");
    expect(confirmar).toBeDisabled();
    for (const texto of ["   ", "abcd", "  ab  "]) {
      fireEvent.change(motivo, { target: { value: texto } });
      expect(confirmar).toBeDisabled();
    }
    expect(actualizarEstadoCatequesisBautismo).not.toHaveBeenCalled();
    fireEvent.change(motivo, { target: { value: "abcde" } });
    expect(confirmar).toBeEnabled();
    expect(motivo).toHaveAttribute("maxlength", "500");
  });

  it.each([400, 409])("conserva modal y motivo ante un %s", async (status) => {
    vi.mocked(actualizarEstadoCatequesisBautismo).mockRejectedValueOnce(new ApiError("No se puede rechazar", status));
    await abrir();
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    const motivo = screen.getByPlaceholderText("Ej: No completó las charlas.");
    fireEvent.change(motivo, { target: { value: "Motivo escrito" } });
    fireEvent.click(screen.getByRole("button", { name: "Rechazar solicitud" }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith("No se puede rechazar", "error"));
    expect(motivo).toHaveValue("Motivo escrito");
    expect(screen.getByRole("button", { name: "Rechazar solicitud" })).toBeInTheDocument();
    expect(screen.getAllByText("No se puede rechazar").length).toBeGreaterThan(0);
  });

  it("envía el motivo recortado, invalida ambas listas y confirma el éxito", async () => {
    vi.mocked(actualizarEstadoCatequesisBautismo).mockImplementationOnce(async () => {
      vi.mocked(listarInscripcionesCatequesisBautismo).mockImplementation(async (vista) => vista === "solicitudes" ? [] : [{ ...solicitud, estado: "Rechazada" }]);
      return { ...solicitud, estado: "Rechazada" };
    });
    const { invalidar } = await abrir();
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    fireEvent.change(screen.getByPlaceholderText("Ej: No completó las charlas."), { target: { value: "  Motivo válido  " } });
    fireEvent.click(screen.getByRole("button", { name: "Rechazar solicitud" }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith("Solicitud rechazada correctamente", "success"));
    expect(actualizarEstadoCatequesisBautismo).toHaveBeenCalledWith(7, "Rechazada", { observacionAdministrativa: "Motivo válido" });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ["catequesis-bautismo-solicitudes"] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ["catequesis-bautismo-historial"] });
    await waitFor(() => expect(screen.queryByRole("button", { name: "Rechazar solicitud" })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    expect((await screen.findAllByText("Rechazada")).length).toBeGreaterThan(0);
  });

  it.each(["Aprobada", "Rechazada"])("no permite rechazar una solicitud %s", async (estado) => {
    await abrir(estado);
    expect(screen.queryByRole("button", { name: "Rechazar" })).not.toBeInTheDocument();
  });
});
