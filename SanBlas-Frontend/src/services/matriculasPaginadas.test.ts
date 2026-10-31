import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";
import { listarPaginaMatriculas } from "./matriculasPaginadas";
import { listarInscripcionesCica } from "../modules/cica/cicaService";
import { listarInscripcionesCatequesisBautismo } from "../modules/catequesisBautismo/catequesisBautismoService";

vi.mock("./apiClient", () => ({
  apiClient: { get: vi.fn() },
  handleApiError: (error: unknown) => {
    throw error;
  },
}));
beforeEach(() => vi.clearAllMocks());

describe("contratos de matrículas", () => {
  it.each(["/cica", "/catequesis-bautismo"])(
    "envía filtros y paginación sin renombrar %s",
    async (ruta) => {
      const pagina = {
        data: [{ id: 1 }],
        total: 35,
        page: 2,
        limit: 10,
        totales: { pendientes: 35, aprobadas: 6, rechazadas: 4 },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: pagina });
      const params = {
        vista: "solicitudes" as const,
        busqueda: "Ana",
        page: 2,
        limit: 10,
      };
      expect(await listarPaginaMatriculas(ruta, params)).toEqual(pagina);
      expect(apiClient.get).toHaveBeenCalledWith(ruta, { params });
    },
  );
  it("conserva los servicios antiguos que esperan arreglos", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
    });
    expect(await listarInscripcionesCica("solicitudes")).toHaveLength(2);
    expect(
      await listarInscripcionesCatequesisBautismo("historial"),
    ).toHaveLength(2);
  });
  it("propaga errores en vez de presentarlos como una lista vacía", async () => {
    const error = new Error("Sin conexión");
    vi.mocked(apiClient.get).mockRejectedValue(error);
    await expect(
      listarPaginaMatriculas("/cica", {
        vista: "solicitudes",
        page: 1,
        limit: 10,
      }),
    ).rejects.toBe(error);
  });
});
