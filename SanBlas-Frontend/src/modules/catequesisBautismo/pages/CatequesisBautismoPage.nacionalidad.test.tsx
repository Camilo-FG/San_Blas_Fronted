import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CatequesisBautismoPage from "./CatequesisBautismoPage";
import {
  filtrarNacionalidadBautismo,
  MAX_NACIONALIDAD_BAUTISMO,
  validarFormularioCatequesisBautismo,
  type FormularioCatequesisBautismo,
} from "../validarCatequesisBautismo";
import { mapearFormularioBautismo } from "../bautismoMapper";

vi.mock("../../../seo/SeoHead", () => ({ default: () => null }));
vi.mock("../catequesisBautismoService", () => ({
  crearInscripcionCatequesisBautismo: vi.fn(),
  consultarInscripcionCatequesisBautismo: vi.fn(),
}));
vi.mock("../../../shared/hooks/useAutocompletarCedula", () => ({
  useAutocompletarCedula: () => ({ estado: "encontrada", verificar: vi.fn() }),
}));
vi.mock("../../../shared/components/UbicacionCostaRicaCampos", () => ({
  UbicacionCostaRicaCampos: () => null,
}));

const base: FormularioCatequesisBautismo = {
  nombre: "Ana", apellido1: "Pérez", apellido2: "", fechaNacimiento: "1990-01-01",
  cedula: "102340567", tipoCedula: "nacional", nacionalidad: "Costarricense",
  telefono: "8888-8888", estadoCivil: "soltero", condicion: "padre_madre",
  parroquiaOrigen: "San Blas", provincia: "Guanacaste", canton: "Nicoya",
  distrito: "Nicoya", barrio: "Centro",
};

describe("nacionalidad en la inscripción de catequesis para el bautismo", () => {
  it("nace Costarricense con cédula nacional y se limpia al cambiar a extranjera", () => {
    render(<CatequesisBautismoPage />);
    const nacionalidad = screen.getByPlaceholderText("Ej: Costarricense");
    expect(nacionalidad).toHaveValue("Costarricense");

    const tipo = screen.getByLabelText(/^Tipo de cédula/);
    fireEvent.change(tipo, { target: { value: "extranjera" } });
    expect(nacionalidad).toHaveValue("");

    fireEvent.change(tipo, { target: { value: "nacional" } });
    expect(nacionalidad).toHaveValue("Costarricense");
  });

  it("filtra caracteres no alfabéticos y respeta el límite de longitud", () => {
    expect(filtrarNacionalidadBautismo("Costa R1ca#")).toBe("Costa Rca");
    expect(filtrarNacionalidadBautismo("a".repeat(30))).toHaveLength(
      MAX_NACIONALIDAD_BAUTISMO,
    );
  });

  it("no exige nacionalidad y valida el formato solo cuando se indica", () => {
    expect(
      validarFormularioCatequesisBautismo({ ...base, nacionalidad: "" }),
    ).toEqual({});

    const errores = validarFormularioCatequesisBautismo({
      ...base,
      nacionalidad: "Costarr1cense#",
    });
    expect(errores.nacionalidad).toBe("La nacionalidad solo puede contener letras.");
  });

  it("envía la nacionalidad al backend y null cuando queda vacía", () => {
    expect(mapearFormularioBautismo(base).nacionalidad).toBe("Costarricense");
    expect(
      mapearFormularioBautismo({ ...base, nacionalidad: "  " }).nacionalidad,
    ).toBeNull();
  });
});
