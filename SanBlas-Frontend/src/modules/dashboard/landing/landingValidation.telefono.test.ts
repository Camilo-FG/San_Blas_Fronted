import { describe, expect, it } from "vitest";
import { validarFormularioLanding } from "./landingValidation";

const contacto = {
  eyebrow: "Contacto",
  title: "Contacto",
  intro: "Texto de introducción.",
  telefono: "8888-8888",
  correo: "parroquia@example.com",
  ubicacion: "San Ramón",
  horariosAtencion: "Lunes :: 8:00 - 12:00",
  mapaUrl: "https://maps.google.com/maps?q=San+Blas",
};

const donaciones = {
  title: "Donaciones",
  intro: "Texto de introducción.",
  sinpe: "88888888",
  cuentaBancaria: "CR67015100012345678901",
  banco: "Banco Nacional",
};

describe("Celular que empieza con 0", () => {
  it("rechaza el teléfono de contacto que empieza con 0", () => {
    for (const telefono of ["0888-8888", "00506 8888 8888", "0"]) {
      const errores = validarFormularioLanding("contacto", {
        ...contacto,
        telefono,
      });
      expect(errores.telefono).toBe("El número no puede empezar con 0.");
    }
  });

  it("rechaza el SINPE que empieza con 0", () => {
    for (const sinpe of ["08888888", "00506 8888 8888", "0"]) {
      const errores = validarFormularioLanding("donaciones", {
        ...donaciones,
        sinpe,
      });
      expect(errores.sinpe).toBe("El número no puede empezar con 0.");
    }
  });

  it("acepta teléfonos con prefijo +506 y sin cero inicial", () => {
    for (const telefono of [
      "+506 8888-8888",
      "8888-8888",
      "2685-3540",
      "8888 8888",
    ]) {
      const errores = validarFormularioLanding("contacto", {
        ...contacto,
        telefono,
      });
      expect(errores.telefono).toBeUndefined();
    }
  });

  it("acepta SINPE sin cero inicial", () => {
    for (const sinpe of ["88888888", "8888-1234"]) {
      const errores = validarFormularioLanding("donaciones", {
        ...donaciones,
        sinpe,
      });
      expect(errores.sinpe).toBeUndefined();
    }
  });

  it("ignora espacios iniciales antes del cero", () => {
    const errores = validarFormularioLanding("contacto", {
      ...contacto,
      telefono: " 0888-8888",
    });
    expect(errores.telefono).toBe("El número no puede empezar con 0.");
  });

  it("sigue mostrando el error de formato cuando no empieza con 0", () => {
    const errores = validarFormularioLanding("contacto", {
      ...contacto,
      telefono: "abc",
    });
    expect(errores.telefono).toBe("El teléfono no tiene un formato válido.");
  });
});
