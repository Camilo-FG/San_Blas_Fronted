import { describe, expect, it } from "vitest";
import { ESTADOS_CIVILES_BAUTISMO } from "./estadosCivilesBautismo";
import { CONDICIONES_BAUTISMO, AYUDA_CONDICION_BAUTISMO } from "./condicionesBautismo";
import { validarFormularioCatequesisBautismo, type FormularioCatequesisBautismo } from "./validarCatequesisBautismo";
import { mapearFormularioBautismo } from "./bautismoMapper";

const valido: FormularioCatequesisBautismo = {
  nombre: "Ana", apellido1: "Pérez", apellido2: "", fechaNacimiento: "1990-01-01",
  cedula: "102340567", tipoCedula: "nacional", nacionalidad: "Costarricense", telefono: "8888-8888",
  estadoCivil: "soltero", condicion: "padre_madre", parroquiaOrigen: "San Blas",
  provincia: "Guanacaste", canton: "Nicoya", distrito: "Nicoya", barrio: "Centro",
};

describe("catálogos de bautismo", () => {
  it("mantiene las cinco opciones de estado civil y las tres condiciones", () => {
    expect(ESTADOS_CIVILES_BAUTISMO).toEqual(["soltero", "matrimonio_catolico", "union_civil", "union_libre", "divorciado"]);
    expect(CONDICIONES_BAUTISMO).toEqual(["padre_madre", "padrino_madrina", "formacion_catequetica"]);
    expect(Object.keys(AYUDA_CONDICION_BAUTISMO)).toEqual([...CONDICIONES_BAUTISMO]);
  });

  it.each(["", "   ", "desconocido"])("bloquea valores vacíos o fuera del catálogo: %j", (valor) => {
    const form = { ...valido, estadoCivil: valor, condicion: valor } as FormularioCatequesisBautismo;
    const errores = validarFormularioCatequesisBautismo(form);
    expect(errores.estadoCivil).toBeTruthy();
    expect(errores.condicion).toBeTruthy();
  });

  for (const estadoCivil of ESTADOS_CIVILES_BAUTISMO) {
    it.each(CONDICIONES_BAUTISMO)(`valida y mapea ${estadoCivil} con %s sin cambiar el contrato`, (condicion) => {
      const form = { ...valido, estadoCivil, condicion };
      expect(validarFormularioCatequesisBautismo(form)).toEqual({});
      expect(mapearFormularioBautismo(form)).toMatchObject({ estadoCivil, condicion });
    });
  }
});
