import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportarMatriculas } from "./exportacionesMatriculas";
import { ApiError } from "./apiClient";

const { get, crearUrl, revocarUrl } = vi.hoisted(() => ({
  get: vi.fn(),
  crearUrl: vi.fn(() => "blob:prueba"),
  revocarUrl: vi.fn(),
}));
vi.mock("./apiClient", async (original) => ({
  ...(await original<typeof import("./apiClient")>()),
  apiClient: { get },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = crearUrl;
      static revokeObjectURL = revocarUrl;
    },
  );
  get.mockResolvedValue({
    data: new Blob(["xlsx"]),
    headers: {
      "content-disposition": 'attachment; filename="inscripciones.xlsx"',
    },
  });
});

describe("descarga de matrículas", () => {
  it.each([
    ["cica", "/cica/exportar"],
    ["bautismo", "/catequesis-bautismo/exportar"],
  ] as const)(
    "%s envía los filtros propios y descarga el archivo sin paginación",
    async (modulo, ruta) => {
      const click = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(function (this: HTMLAnchorElement) {
          expect(this.download).toBe("inscripciones.xlsx");
          expect(this.href).toBe("blob:prueba");
          expect(this.isConnected).toBe(true);
        });
      await exportarMatriculas(modulo, {
        estado: "Aprobada",
        desde: "2026-10-01",
        hasta: "2026-10-28",
      });
      expect(get).toHaveBeenCalledWith(ruta, {
        params: {
          estado: "Aprobada",
          desde: "2026-10-01",
          hasta: "2026-10-28",
        },
        responseType: "blob",
      });
      expect(click).toHaveBeenCalledTimes(1);
      expect(revocarUrl).toHaveBeenCalledWith("blob:prueba");
      expect(document.querySelector("a[download]")).toBeNull();
    },
  );

  it("Todos no envía filtros y el nombre de respaldo usa el módulo correcto", async () => {
    get.mockResolvedValue({ data: new Blob(["xlsx"]), headers: {} });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toMatch(
        /^inscripciones_bautismo_\d{4}-\d{2}-\d{2}\.xlsx$/,
      );
    });
    await exportarMatriculas("bautismo", {
      estado: "todos",
      desde: "",
      hasta: "",
    });
    expect(get).toHaveBeenCalledWith("/catequesis-bautismo/exportar", {
      params: {},
      responseType: "blob",
    });
  });

  it("acepta el nombre UTF-8 del servidor", async () => {
    get.mockResolvedValue({
      data: new Blob(["xlsx"]),
      headers: {
        "content-disposition":
          "attachment; filename*=UTF-8''inscripci%C3%B3n.xlsx",
      },
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe("inscripción.xlsx");
    });
    await exportarMatriculas("cica", { estado: "todos", desde: "", hasta: "" });
  });

  it("muestra el error JSON aunque Axios lo entregue como Blob y no descarga un falso Excel", async () => {
    const mensaje = "No hay solicitudes para los filtros seleccionados.";
    const blob = new Blob([], { type: "application/json" });
    Object.defineProperty(blob, "text", {
      value: () => Promise.resolve(JSON.stringify({ mensaje })),
    });
    get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: blob },
    });
    await expect(
      exportarMatriculas("cica", {
        estado: "Pendiente",
        desde: "2026-10-01",
        hasta: "2026-10-28",
      }),
    ).rejects.toMatchObject({ message: mensaje, status: 404 });
    expect(crearUrl).not.toHaveBeenCalled();
  });

  it("conserva un error seguro de red", async () => {
    get.mockRejectedValue(new Error("sin conexión"));
    await expect(
      exportarMatriculas("cica", { estado: "todos", desde: "", hasta: "" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(crearUrl).not.toHaveBeenCalled();
  });

  it.each([
    { desde: "2026-10-01", hasta: "" },
    { desde: "", hasta: "2026-10-28" },
  ])("envía solo el extremo de fecha seleccionado: %j", async (fechas) => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await exportarMatriculas("cica", { estado: "todos", ...fechas });
    expect(get).toHaveBeenCalledWith("/cica/exportar", {
      params: Object.fromEntries(
        Object.entries(fechas).filter(([, valor]) => valor),
      ),
      responseType: "blob",
    });
  });
});
