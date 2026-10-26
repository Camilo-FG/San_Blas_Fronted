import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CatequesisBautismoPage from "./CatequesisBautismoPage";
import { crearInscripcionCatequesisBautismo } from "../catequesisBautismoService";
import { AYUDA_CONDICION_BAUTISMO, CONDICIONES_BAUTISMO } from "../condicionesBautismo";

vi.mock("../../../seo/SeoHead", () => ({ default: () => null }));
vi.mock("../catequesisBautismoService", () => ({
  crearInscripcionCatequesisBautismo: vi.fn(), consultarInscripcionCatequesisBautismo: vi.fn(),
}));
vi.mock("../../../shared/hooks/useAutocompletarCedula", () => ({
  useAutocompletarCedula: () => ({ estado: "encontrada", verificar: vi.fn() }),
}));
// Estas pruebas se centran en los dos selectores, sin acceso a red.
vi.mock("../../../shared/components/UbicacionCostaRicaCampos", () => ({ UbicacionCostaRicaCampos: () => null }));

describe("estado civil y condición en pantalla", () => {
  it("bloquea un formulario vacío, enfoca la cédula y no muestra un resumen", () => {
    const { container } = render(<CatequesisBautismoPage />);
    const cedula = screen.getByRole("textbox", { name: /^Cédula/ });
    const scroll = vi.fn();
    cedula.scrollIntoView = scroll;
    fireEvent.submit(container.querySelector("form")!);
    expect(crearInscripcionCatequesisBautismo).not.toHaveBeenCalled();
    expect(cedula).toHaveFocus();
    expect(cedula).toHaveAttribute("aria-invalid", "true");
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(screen.getByText("La cédula es obligatoria.")).toBeInTheDocument();
    expect(screen.queryByText(/Complete o corrija/)).not.toBeInTheDocument();
  });

  it("presenta desplegables con opciones y sin elección automática", () => {
    render(<CatequesisBautismoPage />);
    const civil = screen.getByRole("combobox", { name: /^Estado civil/ });
    const condicion = screen.getByRole("combobox", { name: /^Condición/ });
    expect(civil).toHaveValue("");
    expect(condicion).toHaveValue("");
    expect(within(civil).getAllByRole("option")).toHaveLength(6);
    expect(within(condicion).getAllByRole("option")).toHaveLength(4);
  });

  it.each(CONDICIONES_BAUTISMO)("muestra ayuda de %s sin bloquear por estado civil", (valor) => {
    render(<CatequesisBautismoPage />);
    fireEvent.change(screen.getByLabelText(/^Estado civil/), { target: { value: "divorciado" } });
    fireEvent.change(screen.getByLabelText(/^Condición/), { target: { value: valor } });
    expect(screen.getByText(AYUDA_CONDICION_BAUTISMO[valor])).toBeInTheDocument();
    expect(screen.getByLabelText(/^Condición/)).toHaveValue(valor);
  });

  it("cambia la ayuda al cambiar la condición", () => {
    render(<CatequesisBautismoPage />);
    const selector = screen.getByLabelText(/^Condición/);
    fireEvent.change(selector, { target: { value: "padrino_madrina" } });
    fireEvent.change(selector, { target: { value: "formacion_catequetica" } });
    expect(screen.queryByText(AYUDA_CONDICION_BAUTISMO.padrino_madrina)).not.toBeInTheDocument();
    expect(screen.getByText(AYUDA_CONDICION_BAUTISMO.formacion_catequetica)).toBeInTheDocument();
  });

  it("marca los faltantes, hace scroll al primero y no envía", () => {
    const { container } = render(<CatequesisBautismoPage />);
    // Completa identificación para que el primer error sea estado civil.
    const identificacion = container.querySelector("fieldset")!;
    for (const input of identificacion.querySelectorAll('input')) {
      const valor = input.type === "date" ? "1990-01-01"
        : input.placeholder.includes("8888") ? "88888888"
        : input.inputMode === "numeric" ? "102340567" : "Ana";
      fireEvent.change(input, { target: { value: valor } });
    }
    const scroll = vi.fn();
    const civil = screen.getByLabelText(/^Estado civil/);
    civil.scrollIntoView = scroll;
    fireEvent.submit(container.querySelector("form")!);
    expect(civil).toHaveAttribute("aria-invalid", "true");
    expect(civil).toHaveFocus();
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(screen.getByLabelText(/^Condición/)).toHaveAttribute("aria-invalid", "true");
    expect(crearInscripcionCatequesisBautismo).not.toHaveBeenCalled();
    fireEvent.change(civil, { target: { value: "soltero" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(screen.getByLabelText(/^Condición/)).toHaveFocus();
  });
});
