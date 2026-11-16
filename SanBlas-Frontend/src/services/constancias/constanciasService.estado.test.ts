import { beforeEach, describe, expect, it, vi } from "vitest";
import { rechazarSolicitudSacramento } from "./constanciasService";

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("../apiClient", async (original) => ({
  ...(await original<typeof import("../apiClient")>()),
  apiClient: { get, patch },
}));

describe("respuesta de rechazo sacramental", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lee el registro después de la confirmación en vez de mapear un mensaje como solicitud", async () => {
    patch.mockResolvedValue({ data: { mensaje: "Solicitud rechazada exitosamente", estado: "Rechazado" } });
    get.mockResolvedValue({
      data: { id: 7, PrimerNombre: "Ana", PrimerApellido: "Prueba", Estado: "Rechazado", FechaSolicitud: "2026-11-01" },
    });
    const solicitud = await rechazarSolicitudSacramento(7, "Datos incorrectos");
    expect(patch).toHaveBeenCalledWith("/solic-sacramento/7/rechazar",
      { motivoRechazo: "Datos incorrectos", detalleRechazo: undefined }, { timeout: 15000 });
    expect(get).toHaveBeenCalledWith("/solic-sacramento/7");
    expect(solicitud).toMatchObject({ id: 7, Nombre: "Ana", Estado: "Rechazado" });
  });
});
