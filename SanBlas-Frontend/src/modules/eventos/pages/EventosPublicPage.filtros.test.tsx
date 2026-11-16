import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventosPublicPage from "./EventosPublicPage";

vi.mock("../../../seo/SeoHead", () => ({ default: () => null }));
vi.mock("../../../shared/ui", async (original) => ({
  ...(await original<typeof import("../../../shared/ui")>()),
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../../services/eventosService", () => ({
  obtenerEventosPublicos: async () => [
    { id: 1, titulo: "waef primero", fechaInicio: "2026-11-04", hora: "08:00", descripcion: "", lugar: "San Blas" },
    { id: 2, titulo: "waef segundo", fechaInicio: "2026-11-05", hora: "09:00", descripcion: "", lugar: "San Blas" },
    { id: 3, titulo: "Futuro", fechaInicio: "2026-12-01", hora: "09:00", descripcion: "", lugar: "San Blas" },
  ],
}));

describe("filtros públicos de eventos", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-08T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("respeta el rango histórico explícito aunque se ordene por Más próximos", async () => {
    render(<EventosPublicPage />);
    await screen.findByLabelText("Buscar por nombre");
    fireEvent.change(screen.getByLabelText("Buscar por nombre"), { target: { value: "waef" } });
    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-11-04" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-11-05" } });
    fireEvent.change(screen.getByLabelText("Ordenar eventos"), { target: { value: "proximos" } });
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
    expect(screen.getAllByRole("article")[0]).toHaveTextContent("waef primero");
    expect(screen.queryByText("Futuro")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Limpiar filtros de eventos"));
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("sin fechas explícitas sigue mostrando solo los próximos", async () => {
    render(<EventosPublicPage />);
    await screen.findByLabelText("Ordenar eventos");
    fireEvent.change(screen.getByLabelText("Ordenar eventos"), { target: { value: "proximos" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("article")).toHaveTextContent("Futuro");
  });
});
