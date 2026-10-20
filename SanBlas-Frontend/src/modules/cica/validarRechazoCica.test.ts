import { describe, expect, it } from "vitest";
import {
  MOTIVO_RECHAZO_MAXIMO,
  MOTIVO_RECHAZO_MINIMO,
  validarMotivoRechazo,
} from "./validarRechazoCica";

describe("validarMotivoRechazo", () => {
  it("exige el motivo cuando está vacío", () => {
    expect(validarMotivoRechazo("")).toBe(
      "La observación es obligatoria al rechazar.",
    );
  });

  it("trata el motivo con solo espacios como vacío", () => {
    expect(validarMotivoRechazo("     ")).toBe(
      "La observación es obligatoria al rechazar.",
    );
  });

  it("exige al menos 5 caracteres", () => {
    expect(validarMotivoRechazo("abcd")).toBe(
      `El motivo debe tener al menos ${MOTIVO_RECHAZO_MINIMO} caracteres.`,
    );
  });

  it("acepta exactamente 5 caracteres", () => {
    expect(validarMotivoRechazo("abcde")).toBeNull();
  });

  it("acepta un motivo válido y recorta los espacios", () => {
    expect(validarMotivoRechazo("  motivo válido  ")).toBeNull();
  });

  it("rechaza un motivo de más de 500 caracteres", () => {
    expect(validarMotivoRechazo("x".repeat(MOTIVO_RECHAZO_MAXIMO + 1))).toBe(
      `El motivo no puede superar los ${MOTIVO_RECHAZO_MAXIMO} caracteres.`,
    );
  });
});
