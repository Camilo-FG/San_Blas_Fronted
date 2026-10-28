import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider, useToast } from "./Toast";

// Dispara dos toasts de golpe y deja el resto del flujo incluido
// en el Escape a cargo de cada prueba.
function BotonToasts() {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        showToast("Primera alerta", "success");
        showToast("Segunda alerta", "error");
      }}
    >
      disparar toast
    </button>
  );
}

const montar = () =>
  render(
    <ToastProvider>
      <BotonToasts />
    </ToastProvider>,
  );

const mostrarToasts = () =>
  fireEvent.click(screen.getByRole("button", { name: "disparar toast" }));

// El evento se despacha en body con burbuja para recorrer el mismo camino
// que una pulsación real: body -> document (listener de Toast) -> window
// (listeners de modales con useEscapeKey).
const presionarEscape = () =>
  fireEvent.keyDown(document.body, { key: "Escape", bubbles: true });

describe("Toast: prioridad del Escape", () => {
  it("cada Escape descarta primero el toast más reciente", async () => {
    montar();
    mostrarToasts();
    expect(screen.getByText("Primera alerta")).toBeInTheDocument();
    expect(screen.getByText("Segunda alerta")).toBeInTheDocument();

    // El último en salir (el más reciente) termina primero…
    presionarEscape();
    await waitFor(() => {
      expect(screen.queryByText("Segunda alerta")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Primera alerta")).toBeInTheDocument();

    // …y después le toca al más antiguo.
    presionarEscape();
    await waitFor(() => {
      expect(screen.queryByText("Primera alerta")).not.toBeInTheDocument();
    });
  });

  it("con toasts visibles el Escape no cierra modales que escuchan en window", async () => {
    montar();
    mostrarToasts();

    const listenerModal = vi.fn();
    window.addEventListener("keydown", listenerModal);

    // Dos Esc solo descartan toasts; el tercero, ya sin alertas, sí llega.
    presionarEscape();
    await waitFor(() => {
      expect(screen.queryByText("Segunda alerta")).not.toBeInTheDocument();
    });
    expect(listenerModal).not.toHaveBeenCalled();

    presionarEscape();
    await waitFor(() => {
      expect(screen.queryByText("Primera alerta")).not.toBeInTheDocument();
    });
    expect(listenerModal).not.toHaveBeenCalled();

    presionarEscape();
    expect(listenerModal).toHaveBeenCalledTimes(1);

    window.removeEventListener("keydown", listenerModal);
  });

  it("sin toasts el Escape no se intercepta y llega a los modales", () => {
    montar();

    const listenerModal = vi.fn();
    window.addEventListener("keydown", listenerModal);

    presionarEscape();
    expect(listenerModal).toHaveBeenCalledTimes(1);

    window.removeEventListener("keydown", listenerModal);
  });

  it("teclas distintas a Escape no alteran las alertas activas", () => {
    montar();
    mostrarToasts();

    fireEvent.keyDown(document.body, { key: "Tab", bubbles: true });

    expect(screen.getByText("Primera alerta")).toBeInTheDocument();
    expect(screen.getByText("Segunda alerta")).toBeInTheDocument();
  });
});
