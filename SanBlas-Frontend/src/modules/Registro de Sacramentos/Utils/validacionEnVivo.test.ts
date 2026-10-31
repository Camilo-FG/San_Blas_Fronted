import { describe, expect, it } from "vitest";
import { erroresVisibles, marcarTocado } from "./validacionEnVivo";

describe("erroresVisibles", () => {
  it("no muestra errores de campos que el usuario no ha tocado", () => {
    expect(erroresVisibles({ libro: "Falta" }, {}, {}, false)).toEqual({});
  });

  it("muestra el error de un campo tocado", () => {
    expect(erroresVisibles({ libro: "Falta" }, {}, { libro: true }, false)).toEqual({
      libro: "Falta",
    });
  });

  it("mantiene visible un error que ya estaba aunque el campo no esté marcado como tocado", () => {
    expect(erroresVisibles({ folio: "Falta" }, { folio: "Falta" }, {}, false)).toEqual({
      folio: "Falta",
    });
  });

  it("desaparece cuando el campo se corrige", () => {
    expect(erroresVisibles({}, { libro: "Falta" }, { libro: true }, false)).toEqual({});
  });

  it("tras intentar guardar, todos los errores son visibles", () => {
    expect(erroresVisibles({ libro: "Falta", folio: "Falta" }, {}, {}, true)).toEqual({
      libro: "Falta",
      folio: "Falta",
    });
  });
});

describe("marcarTocado", () => {
  it("agrega la clave tocada", () => {
    expect(marcarTocado({}, "libro")).toEqual({ libro: true });
  });

  it("no cambia la referencia si la clave ya estaba tocada", () => {
    const tocados = { libro: true };
    expect(marcarTocado(tocados, "libro")).toBe(tocados);
  });
});
