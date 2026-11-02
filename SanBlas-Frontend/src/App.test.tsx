import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("@tanstack/react-router", () => ({
  RouterProvider: () => (
    <form aria-label="Formulario de prueba" onSubmit={(event) => event.preventDefault()}>
      <input aria-label="Campo inválido" aria-invalid="true" />
      <button type="submit">Enviar</button>
    </form>
  ),
}));
vi.mock("./context/AuthContext", () => {
  /** @param {{ children: import("react").ReactNode }} props */
  const AuthProvider = (props) => props.children;
  return { AuthProvider };
});
vi.mock("./context/ThemeContext", () => {
  /** @param {{ children: import("react").ReactNode }} props */
  const ThemeProvider = (props) => props.children;
  return { ThemeProvider };
});
vi.mock("./shared/ui", () => {
  /** @param {{ children: import("react").ReactNode }} props */
  const ToastProvider = (props) => props.children;
  return { ToastProvider };
});
vi.mock("./routes/router", () => ({ router: {} }));

describe("App", () => {
  it("enfoca y desplaza al primer campo inválido del formulario enviado", async () => {
    const scrollIntoView = vi.fn();
    render(<App />);
    const campoInvalido = screen.getByRole("textbox", { name: "Campo inválido" });
    Object.defineProperty(campoInvalido, "scrollIntoView", { value: scrollIntoView });

    fireEvent.submit(screen.getByRole("form", { name: "Formulario de prueba" }));

    await waitFor(() => expect(campoInvalido).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
  });
});
