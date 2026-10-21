import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentificacionCedula } from "./IdentificacionCedula";

describe("Indicador de búsqueda de cédula", () => {
  it("gira mientras consulta y desaparece al terminar", () => {
    const props = {
      tipo: "nacional" as const,
      valor: "102340567",
      onTipo: vi.fn(),
      onValor: vi.fn(),
      onReintentar: vi.fn(),
    };
    const { container, rerender } = render(
      <IdentificacionCedula {...props} estado="buscando" />,
    );

    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Verificando cédula...");

    rerender(<IdentificacionCedula {...props} estado="encontrada" />);

    expect(container.querySelector("svg.animate-spin")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "false");
    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(container.querySelector("svg.text-green-500")).toBeInTheDocument();
  });
});
