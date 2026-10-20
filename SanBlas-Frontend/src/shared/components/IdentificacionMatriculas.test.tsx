import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CicaPage from "../../modules/cica/pages/CicaPage";
import CatequesisBautismoPage from "../../modules/catequesisBautismo/pages/CatequesisBautismoPage";
import { obtenerDatosCedula } from "../../services/cedulaService";
import {
  consultarInscripcionCica,
  crearInscripcionCica,
} from "../../modules/cica/cicaService";
import {
  consultarInscripcionCatequesisBautismo,
  crearInscripcionCatequesisBautismo,
} from "../../modules/catequesisBautismo/catequesisBautismoService";

vi.mock("../../seo/SeoHead", () => ({ default: () => null }));
vi.mock("../../services/cedulaService", () => ({
  obtenerDatosCedula: vi.fn(),
}));
vi.mock("../../modules/cica/cicaService", () => ({
  consultarInscripcionCica: vi.fn(),
  crearInscripcionCica: vi.fn(),
}));
vi.mock("../../modules/catequesisBautismo/catequesisBautismoService", () => ({
  consultarInscripcionCatequesisBautismo: vi.fn(),
  crearInscripcionCatequesisBautismo: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(obtenerDatosCedula).mockReset();
  vi.mocked(obtenerDatosCedula).mockResolvedValue({
    nombre: "Ana María",
    primerApellido: "Pérez",
    segundoApellido: "Solís",
  });
});

for (const [nombre, Pagina, consultar] of [
  ["CICA", CicaPage, consultarInscripcionCica],
  ["Bautismo", CatequesisBautismoPage, consultarInscripcionCatequesisBautismo],
] as const) {
  describe(`Identificación en la pantalla de ${nombre}`, () => {
    it("autocompleta, limpia los nombres al cambiar la cédula y no usa storage", async () => {
      const storage = vi.spyOn(Storage.prototype, "setItem");
      render(<Pagina />);
      fireEvent.change(screen.getByRole("textbox", { name: /^Cédula/ }), {
        target: { value: "102340567" },
      });
      await screen.findByDisplayValue("Ana María");
      expect(screen.getByDisplayValue("Pérez")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Solís")).toBeInTheDocument();
      fireEvent.change(screen.getByRole("textbox", { name: /^Cédula/ }), {
        target: { value: "10234" },
      });
      expect(screen.queryByDisplayValue("Ana María")).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue("Pérez")).not.toBeInTheDocument();
      expect(storage).not.toHaveBeenCalled();
    });

    it("conserva doce dígitos extranjeros sin llamar al padrón", () => {
      render(<Pagina />);
      fireEvent.change(
        screen.getByLabelText("Tipo de cédula", { exact: false }),
        { target: { value: "extranjera" } },
      );
      const input = screen.getByRole("textbox", { name: /^Cédula/ });
      fireEvent.change(input, { target: { value: "012345678901" } });
      expect(input).toHaveValue("012345678901");
      expect(obtenerDatosCedula).not.toHaveBeenCalled();
      expect(
        screen.getByText("Complete el nombre y los apellidos manualmente."),
      ).toBeInTheDocument();
    });

    it("envía la matrícula extranjera completa y sin escribir en storage", async () => {
      const crear = nombre === "CICA" ? crearInscripcionCica : crearInscripcionCatequesisBautismo;
      vi.mocked(crear).mockResolvedValue({ id: 1, mensaje: "Registrada", estado: "Pendiente" });
      const storage = vi.spyOn(Storage.prototype, "setItem");
      const { container } = render(<Pagina />);
      fireEvent.change(screen.getByLabelText("Tipo de cédula", { exact: false }), { target: { value: "extranjera" } });
      fireEvent.change(screen.getByRole("textbox", { name: /^Cédula/ }), { target: { value: "012345678901" } });
      // Completa los demás obligatorios para probar el envío real del formulario, no solo el input.
      for (const input of Array.from(container.querySelectorAll<HTMLInputElement>('input[type="text"]'))) {
        if (!input.value) fireEvent.change(input, { target: { value: "Prueba" } });
      }
      fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: "1990-01-01" } });
      fireEvent.change(screen.getByPlaceholderText("Ej: 8888-8888"), { target: { value: "88881234" } });
      if (nombre === "CICA") {
        fireEvent.change(container.querySelector("#cica-estado-civil-select")!, { target: { value: "soltero" } });
        fireEvent.change(screen.getByPlaceholderText("Ej: ana.solis@correo.com"), { target: { value: "prueba@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Ej: 200 m norte de la iglesia, Nicoya"), { target: { value: "Frente a la iglesia" } });
        fireEvent.click(screen.getByRole("checkbox", { name: "Bautizo" }));
        fireEvent.click(screen.getByRole("radio", { name: "Católico" }));
      } else {
        fireEvent.click(screen.getByRole("radio", { name: "Soltero(a)" }));
        fireEvent.click(screen.getByRole("radio", { name: "Padre/Madre" }));
        fireEvent.change(container.querySelector('select:not([id])')!, { target: { value: "Guanacaste" } });
      }
      fireEvent.submit(container.querySelector("form")!);
      await waitFor(() => expect(crear).toHaveBeenCalledWith(expect.objectContaining({ cedula: "012345678901", tipoCedula: "extranjera" })));
      expect(storage).not.toHaveBeenCalled();
      expect(obtenerDatosCedula).not.toHaveBeenCalled();
    });

    it("deja reintentar una verificación que falló", async () => {
      vi.mocked(obtenerDatosCedula).mockRejectedValueOnce(new Error("sin red"));
      render(<Pagina />);
      fireEvent.change(screen.getByRole("textbox", { name: /^Cédula/ }), {
        target: { value: "102340567" },
      });
      fireEvent.click(
        await screen.findByRole("button", { name: "Reintentar verificación" }),
      );
      await screen.findByDisplayValue("Ana María");
      expect(obtenerDatosCedula).toHaveBeenCalledTimes(2);
    });

    it("no permite enviar una nacional no encontrada", async () => {
      vi.mocked(obtenerDatosCedula).mockResolvedValueOnce(null);
      const { container } = render(<Pagina />);
      fireEvent.change(screen.getByRole("textbox", { name: /^Cédula/ }), {
        target: { value: "102340567" },
      });
      await screen.findByText("La cédula ingresada no existe.");
      fireEvent.submit(container.querySelector("form")!);
      expect(crearInscripcionCica).not.toHaveBeenCalled();
      expect(crearInscripcionCatequesisBautismo).not.toHaveBeenCalled();
    });

    it("consulta el estado con la cédula extranjera completa", async () => {
      vi.mocked(consultar).mockResolvedValue([]);
      render(<Pagina />);
      fireEvent.click(screen.getByRole("button", { name: "Consultar estado" }));
      fireEvent.change(screen.getByPlaceholderText("Ej: 102340567"), {
        target: { value: "012345678901" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /^Consultar$/ }),
      );
      await waitFor(() =>
        expect(consultar).toHaveBeenCalledWith("012345678901"),
      );
    });
  });
}
