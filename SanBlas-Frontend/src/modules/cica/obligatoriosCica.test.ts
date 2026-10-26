import { describe, expect, it } from "vitest";
import { obtenerFaltantesCica, validarFormularioCica, type FormularioCica } from "./validarCica";

const formValido: FormularioCica = {
  nombre: "Ana", apellido1: "Pérez", apellido2: "", fechaNacimiento: "1990-01-01",
  cedula: "102340567", tipoCedula: "nacional", nacionalidad: "Costarricense",
  telefono: "8888-8888", correo: "ana@example.com", estadoCivil: "soltero",
  conyugeNombre: "", conyugeApellido1: "", conyugeApellido2: "",
  necesitaBautizo: true, necesitaPrimeraComunion: false, necesitaConfirmacion: false,
  padreNombre: "Luis", padreApellido1: "Pérez", padreApellido2: "",
  madreNombre: "María", madreApellido1: "Solís", madreApellido2: "",
  provincia: "Guanacaste", canton: "Nicoya", distrito: "Nicoya",
  direccionHogar: "Frente a la iglesia", esCatolico: "si", otraIglesia: "", observacion: "",
};

describe("obligatorios CICA", () => {
  it("acepta un formulario válido sin campos opcionales", () => {
    expect(obtenerFaltantesCica(formValido)).toEqual([]);
    expect(validarFormularioCica(formValido)).toEqual({});
  });

  it.each(["nombre", "apellido1", "fechaNacimiento", "cedula", "nacionalidad", "telefono", "correo", "estadoCivil", "padreNombre", "padreApellido1", "madreNombre", "madreApellido1", "provincia", "canton", "distrito", "direccionHogar", "esCatolico"] as const)(
    "considera faltante %s vacío o con espacios", (campo) => {
      for (const valor of ["", "   "]) {
        const form = { ...formValido, [campo]: valor };
        expect(obtenerFaltantesCica(form).flatMap((s) => s.campos).map((c) => c.campo)).toContain(campo);
        expect(validarFormularioCica(form)[campo]).toBeTruthy();
      }
    },
  );

  it.each(["matrimonio_civil", "matrimonio_catolico", "union_libre", "union_civil"] as const)("exige cónyuge en %s", (estadoCivil) => {
    const campos = obtenerFaltantesCica({ ...formValido, estadoCivil }).flatMap((s) => s.campos).map((c) => c.campo);
    expect(campos).toEqual(["conyugeNombre", "conyugeApellido1"]);
  });

  it.each(["soltero", "divorciado"] as const)("no exige cónyuge en %s", (estadoCivil) => {
    expect(obtenerFaltantesCica({ ...formValido, estadoCivil })).toEqual([]);
  });

  it("exige otra religión solo cuando corresponde", () => {
    expect(obtenerFaltantesCica({ ...formValido, esCatolico: "no", otraIglesia: "   " })[0].campos[0].campo).toBe("otraIglesia");
    expect(obtenerFaltantesCica({ ...formValido, esCatolico: "no", otraIglesia: "Evangélica" })).toEqual([]);
  });

  it("exige al menos un sacramento y acepta cualquiera de los tres", () => {
    expect(validarFormularioCica({ ...formValido, necesitaBautizo: false }).sacramentos).toBeTruthy();
    for (const campo of ["necesitaBautizo", "necesitaPrimeraComunion", "necesitaConfirmacion"] as const) {
      expect(validarFormularioCica({ ...formValido, necesitaBautizo: false, [campo]: true }).sacramentos).toBeUndefined();
    }
  });

  it("agrupa faltantes en orden visual por sección", () => {
    const grupos = obtenerFaltantesCica({ ...formValido, cedula: "", nombre: "", estadoCivil: "", necesitaBautizo: false, distrito: "", esCatolico: "" });
    expect(grupos.map((s) => s.seccion)).toEqual(["Identificación", "Estado civil", "Sacramentos", "Padres y hogar", "Religión"]);
    expect(grupos[0].campos.map((c) => c.campo)).toEqual(["cedula", "nombre"]);
  });
});
