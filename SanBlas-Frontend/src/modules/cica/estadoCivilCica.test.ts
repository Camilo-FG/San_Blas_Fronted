import { describe, expect, it } from "vitest";
import { mapearFormularioCica } from "./cicaMapper";
import {
  ESTADOS_CIVILES_CICA,
  ESTADOS_CON_PAREJA_CICA,
  requiereConyugeCica,
} from "./estadosCivilesCica";
import {
  MIN_CONYUGE_CICA,
  validarFormularioCica,
  type FormularioCica,
} from "./validarCica";

const formulario = (cambios: Partial<FormularioCica>): FormularioCica => ({
  nombre: "Ana",
  apellido1: "Pérez",
  apellido2: "",
  fechaNacimiento: "1990-01-01",
  cedula: "123456789",
  tipoCedula: "nacional",
  nacionalidad: "Costarricense",
  telefono: "8888-8888",
  correo: "ana@dominio.com",
  estadoCivil: "",
  conyugeNombre: "",
  conyugeApellido1: "",
  conyugeApellido2: "",
  necesitaBautizo: true,
  necesitaPrimeraComunion: false,
  necesitaConfirmacion: false,
  padreNombre: "Luis",
  padreApellido1: "Pérez",
  padreApellido2: "",
  madreNombre: "Marta",
  madreApellido1: "Gómez",
  madreApellido2: "",
  provincia: "Guanacaste",
  canton: "Nicoya",
  distrito: "Nicoya",
  direccionHogar: "Calle 1 casa 2",
  esCatolico: "si",
  otraIglesia: "",
  observacion: "",
  ...cambios,
});

describe("catálogo de estados civiles CICA", () => {
  it("incluye los seis estados del formulario", () => {
    expect(ESTADOS_CIVILES_CICA.map(({ valor }) => valor)).toEqual([
      "soltero",
      "matrimonio_civil",
      "matrimonio_catolico",
      "union_libre",
      "union_civil",
      "divorciado",
    ]);
  });

  it("exige cónyuge solo en los estados con pareja", () => {
    expect(ESTADOS_CON_PAREJA_CICA).toEqual([
      "matrimonio_civil",
      "matrimonio_catolico",
      "union_libre",
      "union_civil",
    ]);
    expect(requiereConyugeCica("matrimonio_catolico")).toBe(true);
    expect(requiereConyugeCica("union_civil")).toBe(true);
    expect(requiereConyugeCica("soltero")).toBe(false);
    expect(requiereConyugeCica("divorciado")).toBe(false);
    expect(requiereConyugeCica("")).toBe(false);
  });
});

describe("validación del cónyuge", () => {
  it("exige el nombre cuando el estado implica pareja", () => {
    const errores = validarFormularioCica(
      formulario({ estadoCivil: "matrimonio_catolico" }),
    );
    expect(errores.conyugeNombre).toBe(
      "El nombre del cónyuge o compañero(a) es obligatorio.",
    );
  });

  it("exige al menos 3 caracteres cuando es obligatorio", () => {
    const errores = validarFormularioCica(
      formulario({ estadoCivil: "union_civil", conyugeNombre: "ab" }),
    );
    expect(errores.conyugeNombre).toBe(
      `El nombre del cónyuge o compañero(a) debe tener al menos ${MIN_CONYUGE_CICA} caracteres.`,
    );
  });

  it("acepta exactamente 3 caracteres", () => {
    const errores = validarFormularioCica(
      formulario({ estadoCivil: "union_libre", conyugeNombre: "Ana" }),
    );
    expect(errores.conyugeNombre).toBeUndefined();
  });

  it("no exige cónyuge si es soltero(a)", () => {
    const errores = validarFormularioCica(formulario({ estadoCivil: "soltero" }));
    expect(errores.estadoCivil).toBeUndefined();
    expect(errores.conyugeNombre).toBeUndefined();
  });

  it("no exige cónyuge si es divorciado(a)", () => {
    const errores = validarFormularioCica(
      formulario({ estadoCivil: "divorciado" }),
    );
    expect(errores.estadoCivil).toBeUndefined();
    expect(errores.conyugeNombre).toBeUndefined();
  });

  it("no exige los apellidos del cónyuge cuando no hay pareja", () => {
    const errores = validarFormularioCica(
      formulario({ estadoCivil: "soltero" }),
    );
    expect(errores.conyugeApellido1).toBeUndefined();
    expect(errores.conyugeApellido2).toBeUndefined();
  });

  it("exige el primer apellido del cónyuge cuando hay pareja", () => {
    const errores = validarFormularioCica(
      formulario({ estadoCivil: "matrimonio_civil", conyugeNombre: "Luis" }),
    );
    expect(errores.conyugeApellido1).toBe(
      "El primer apellido del cónyuge o compañero(a) es obligatorio.",
    );
    expect(errores.conyugeApellido2).toBeUndefined();
  });
});

describe("mapeo del cónyuge", () => {
  it("omite el cónyuge si el estado no implica pareja", () => {
    const mapeado = mapearFormularioCica(
      formulario({
        estadoCivil: "divorciado",
        conyugeNombre: "Luis",
        conyugeApellido1: "Pérez",
        conyugeApellido2: "Gómez",
      }),
    );
    expect(mapeado.conyugeNombre).toBeNull();
    expect(mapeado.conyugeApellido1).toBeNull();
    expect(mapeado.conyugeApellido2).toBeNull();
  });

  it("convierte los campos vacíos del cónyuge en null", () => {
    const mapeado = mapearFormularioCica(
      formulario({ estadoCivil: "union_civil", conyugeNombre: "  " }),
    );
    expect(mapeado.conyugeNombre).toBeNull();
    expect(mapeado.conyugeApellido1).toBeNull();
    expect(mapeado.conyugeApellido2).toBeNull();
  });

  it("recorta los datos del cónyuge cuando hay pareja", () => {
    const mapeado = mapearFormularioCica(
      formulario({
        estadoCivil: "matrimonio_civil",
        conyugeNombre: "  Luis ",
        conyugeApellido1: " Pérez ",
        conyugeApellido2: " Gómez ",
      }),
    );
    expect(mapeado.conyugeNombre).toBe("Luis");
    expect(mapeado.conyugeApellido1).toBe("Pérez");
    expect(mapeado.conyugeApellido2).toBe("Gómez");
  });
});
