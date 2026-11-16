import { describe, expect, it, vi } from "vitest";
import { crearSacramentos } from "./sacramentosNuevosService";
import type { CrearSacramentoInput } from "../../../types/sacramentosNuevos";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("../../../services/apiClient", () => ({ apiClient: { post } }));

describe("envío atómico de actas", () => {
  it("usa una sola petición en lugar de guardar cada sacramento por separado", async () => {
    const actas: CrearSacramentoInput[] = [
      { tipo: "bautismo", idParroquia: 1, fechaSacramento: "2026-01-01", bautismo: { bautizado: { nombre: "Ana", primerApellido: "Prueba" } } },
      { tipo: "comunion", idParroquia: 1, fechaSacramento: "2026-02-01", comunion: { persona: { nombre: "Ana", primerApellido: "Prueba" } } },
    ];
    post.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    await expect(crearSacramentos(actas)).resolves.toEqual([{ id: 1 }, { id: 2 }]);
    expect(post).toHaveBeenCalledExactlyOnceWith("/Sacramentos-nuevos/lote", { sacramentos: actas });
  });
});
