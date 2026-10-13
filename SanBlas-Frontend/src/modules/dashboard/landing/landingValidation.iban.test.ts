import { describe, expect, it } from "vitest";
import { validarFormularioLanding } from "./landingValidation";

const base = {
  title: "Donaciones",
  intro: "Texto de introducción.",
  sinpe: "88888888",
  banco: "Banco Nacional",
};

describe("IBAN de Costa Rica en donaciones", () => {
  it("acepta el ejemplo CR + 20 dígitos", () => {
    const errores = validarFormularioLanding("donaciones", {
      ...base,
      cuentaBancaria: "CR67015100012345678901",
    });
    expect(errores.cuentaBancaria).toBeUndefined();
  });

  it("acepta el mismo IBAN en minúsculas", () => {
    const errores = validarFormularioLanding("donaciones", {
      ...base,
      cuentaBancaria: "cr67015100012345678901",
    });
    expect(errores.cuentaBancaria).toBeUndefined();
  });

  it("bloquea longitud, país o caracteres inválidos y muestra el ejemplo", () => {
    for (const cuenta of [
      "CR6701510001234567890",
      "ES67015100012345678901",
      "CR6701510001234567890A",
      "CR67 015100012345678901",
    ]) {
      const errores = validarFormularioLanding("donaciones", {
        ...base,
        cuentaBancaria: cuenta,
      });
      expect(errores.cuentaBancaria).toContain("CR67015100012345678901");
    }
  });

  it("bloquea el campo vacío", () => {
    const errores = validarFormularioLanding("donaciones", {
      ...base,
      cuentaBancaria: "   ",
    });
    expect(errores.cuentaBancaria).toBe("La cuenta bancaria es obligatoria.");
  });
});
