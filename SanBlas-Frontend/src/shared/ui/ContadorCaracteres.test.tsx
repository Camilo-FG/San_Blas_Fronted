import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContadorCaracteres } from "./ContadorCaracteres";

describe("ContadorCaracteres", () => {
  it("muestra el conteo actual sobre el máximo", () => {
    render(<ContadorCaracteres actual={12} maximo={30} />);
    expect(screen.getByText("12/30 caracteres")).toBeInTheDocument();
  });

  it("se actualiza cuando cambia el valor", () => {
    const { rerender } = render(<ContadorCaracteres actual={0} maximo={6} />);
    expect(screen.getByText("0/6 caracteres")).toBeInTheDocument();

    rerender(<ContadorCaracteres actual={6} maximo={6} />);
    expect(screen.getByText("6/6 caracteres")).toBeInTheDocument();
  });
});
