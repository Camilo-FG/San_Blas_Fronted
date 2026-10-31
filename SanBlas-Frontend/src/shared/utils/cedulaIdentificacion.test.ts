import { describe, expect, it } from "vitest";
import {
  limpiarCedula,
  PATRON_CEDULA,
  validarCedulaIdentificacion,
} from "./cedulaIdentificacion";
import {
  validarFormularioCica,
  type FormularioCica,
} from "../../modules/cica/validarCica";
import {
  validarFormularioCatequesisBautismo,
  type FormularioCatequesisBautismo,
} from "../../modules/catequesisBautismo/validarCatequesisBautismo";
import { mapearFormularioCica } from "../../modules/cica/cicaMapper";
import { mapearFormularioBautismo } from "../../modules/catequesisBautismo/bautismoMapper";

describe("Cédulas nacionales y extranjeras de catequesis", () => {
  it("valida según el tipo y rechaza longitudes intermedias o letras", () => {
    expect(validarCedulaIdentificacion("102340567", "nacional")).toBeNull();
    expect(
      validarCedulaIdentificacion("112345678901", "extranjera"),
    ).toBeNull();
    expect(
      validarCedulaIdentificacion("012345678901", "nacional"),
    ).not.toBeNull();
    expect(
      validarCedulaIdentificacion("102340567", "extranjera"),
    ).not.toBeNull();
    for (const cedula of ["1234567890", "12345678901", "12345678A", ""]) {
      expect(PATRON_CEDULA.test(cedula)).toBe(false);
    }
  });

  it("elimina separadores y ceros iniciales sin quitar ceros internos", () => {
    expect(limpiarCedula("1-0234-0567", "nacional")).toBe("102340567");
    expect(limpiarCedula("00123456789012", "extranjera")).toBe("123456789012");
    expect(limpiarCedula("000", "nacional")).toBe("");
    expect(validarCedulaIdentificacion("012345678901", "extranjera")).toBe("La cédula no puede iniciar con cero.");
    expect(validarCedulaIdentificacion("012345678", "nacional")).toBe("La cédula no puede iniciar con cero.");
    expect(PATRON_CEDULA.test("012345678901")).toBe(false);
  });

  it("CICA valida y envía completa la cédula extranjera", () => {
    const form = Object.fromEntries([
      ...[
        "nombre",
        "apellido1",
        "apellido2",
        "fechaNacimiento",
        "nacionalidad",
        "telefono",
        "correo",
        "estadoCivil",
        "conyugeNombre",
        "conyugeApellido1",
        "conyugeApellido2",
        "padreNombre",
        "padreApellido1",
        "padreApellido2",
        "madreNombre",
        "madreApellido1",
        "madreApellido2",
        "direccionHogar",
        "esCatolico",
        "otraIglesia",
        "observacion",
      ].map((clave) => [clave, ""]),
      ["cedula", "112345678901"],
      ["tipoCedula", "extranjera"],
      ["provincia", "Guanacaste"],
      ["canton", "Nicoya"],
      ["distrito", "Nicoya"],
    ]) as FormularioCica;
    expect(validarFormularioCica(form).cedula).toBeUndefined();
    expect(mapearFormularioCica(form)).toMatchObject({
      cedula: "112345678901",
      tipoCedula: "extranjera",
    });
  });

  it("Bautismo valida y envía completa la cédula extranjera", () => {
    const form = {
      nombre: "",
      apellido1: "",
      apellido2: "",
      fechaNacimiento: "",
      cedula: "112345678901",
      tipoCedula: "extranjera",
      nacionalidad: "",
      telefono: "",
      estadoCivil: "",
      parroquiaOrigen: "",
      provincia: "",
      canton: "",
      distrito: "",
      barrio: "",
      condicion: "",
    } satisfies FormularioCatequesisBautismo;
    expect(validarFormularioCatequesisBautismo(form).cedula).toBeUndefined();
    expect(mapearFormularioBautismo(form)).toMatchObject({
      cedula: "112345678901",
      tipoCedula: "extranjera",
    });
  });
});
