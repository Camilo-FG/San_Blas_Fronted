import { describe, expect, it } from "vitest";
import { obtenerFaltantesBautismo } from "./faltantesBautismo";
import { validarFormularioCatequesisBautismo, type FormularioCatequesisBautismo } from "./validarCatequesisBautismo";

const valido: FormularioCatequesisBautismo = {
  nombre: "Ana", apellido1: "Pérez", apellido2: "", fechaNacimiento: "1990-01-01",
  cedula: "102340567", tipoCedula: "nacional", telefono: "8888-8888",
  estadoCivil: "soltero", condicion: "padre_madre", parroquiaOrigen: "San Blas",
  provincia: "Guanacaste", canton: "Nicoya", distrito: "Nicoya", barrio: "Centro",
};

describe("obligatorios de la inscripción de bautismo", () => {
  it("acepta todos los obligatorios sin exigir segundo apellido", () => {
    expect(obtenerFaltantesBautismo(valido)).toEqual([]);
    expect(validarFormularioCatequesisBautismo(valido)).toEqual({});
  });

  it.each(["cedula", "nombre", "apellido1", "fechaNacimiento", "telefono", "estadoCivil", "condicion", "parroquiaOrigen", "provincia", "canton", "distrito", "barrio"] as const)(
    "detecta %s vacío y solo espacios", (campo) => {
      for (const valor of ["", "   "]) {
        const form = { ...valido, [campo]: valor };
        const faltantes = obtenerFaltantesBautismo(form).flatMap((s) => s.campos);
        expect(faltantes).toHaveLength(1);
        expect(faltantes[0].campo).toBe(campo);
        expect(validarFormularioCatequesisBautismo(form)[campo]).toBe(faltantes[0].mensaje);
      }
    },
  );

  it("agrupa los faltantes por sección y en orden visual", () => {
    const form = { ...valido, cedula: "", nombre: "", estadoCivil: "", condicion: "", parroquiaOrigen: "", distrito: "" } as FormularioCatequesisBautismo;
    const faltantes = obtenerFaltantesBautismo(form);
    expect(faltantes.map((s) => s.seccion)).toEqual(["Identificación", "Estado civil", "Condición", "Procedencia"]);
    expect(faltantes[0].campos.map((c) => c.campo)).toEqual(["cedula", "nombre"]);
    expect(faltantes[3].campos.map((c) => c.campo)).toEqual(["parroquiaOrigen", "distrito"]);
  });

  it("mantiene las validaciones de formato aunque no falten datos", () => {
    const form = { ...valido, telefono: "123", fechaNacimiento: "2099-01-01" };
    expect(obtenerFaltantesBautismo(form)).toEqual([]);
    expect(validarFormularioCatequesisBautismo(form)).toMatchObject({
      telefono: "El formato debe ser 8888-8888.",
      fechaNacimiento: "La fecha de nacimiento no puede ser futura.",
    });
  });
});
