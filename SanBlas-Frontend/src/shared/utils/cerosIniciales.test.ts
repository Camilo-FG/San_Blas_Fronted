import { describe, expect, it } from "vitest";
import { filtrarTelefonoCica, TELEFONO_CICA } from "../../modules/cica/validarCica";
import { filtrarTelefonoBautismo, TELEFONO_BAUTISMO } from "../../modules/catequesisBautismo/validarCatequesisBautismo";

describe("teléfonos sin cero inicial", () => {
  for (const [nombre, filtrar, patron] of [
    ["CICA", filtrarTelefonoCica, TELEFONO_CICA],
    ["Bautismo", filtrarTelefonoBautismo, TELEFONO_BAUTISMO],
  ] as const) {
    it(nombre, () => {
      expect(filtrar("0")).toBe("");
      expect(filtrar("00080001234")).toBe("8000-1234");
      expect(patron.test("0123-4567")).toBe(false);
      expect(patron.test("8000-1234")).toBe(true);
    });
  }
});
