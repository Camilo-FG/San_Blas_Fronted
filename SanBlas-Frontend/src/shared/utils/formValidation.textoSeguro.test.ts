import { describe, expect, it } from "vitest";
import { soloTextoSeguro, textoSeguroValido } from "./formValidation";

describe("Sanitización de texto libre", () => {
  it("conserva letras, acentos, números y puntuación básica", () => {
    const texto = "San José, Alajuela (casa 5) - Costa Rica";
    expect(soloTextoSeguro(texto)).toBe(texto);
    expect(textoSeguroValido(texto)).toBe(true);
  });

  it("elimina caracteres usados en inyecciones SQL y HTML", () => {
    const entrada = `Robert'); DROP TABLE personas;-- <script>alert("x")</script>`;
    const salida = soloTextoSeguro(entrada);

    expect(salida).not.toMatch(/[<>"';\\]/);
    expect(salida).not.toContain("--");
    expect(textoSeguroValido(salida)).toBe(true);
  });

  it("rechaza texto con caracteres peligrosos aunque no pase por el filtro", () => {
    expect(textoSeguroValido("O'Brien")).toBe(false);
    expect(textoSeguroValido("Casa <b>5</b>")).toBe(false);
    expect(textoSeguroValido("nota; DROP TABLE")).toBe(false);
    expect(textoSeguroValido("valor -- comentario")).toBe(false);
  });

  it("respeta el límite de caracteres indicado", () => {
    expect(soloTextoSeguro("123456789", 5)).toBe("12345");
    expect(textoSeguroValido("123456", 5)).toBe(false);
  });
});
