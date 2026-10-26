import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CicaPage from "./CicaPage";
import { crearInscripcionCica } from "../cicaService";

vi.mock("../../../seo/SeoHead", () => ({ default: () => null }));
vi.mock("../cicaService", () => ({ crearInscripcionCica: vi.fn(), consultarInscripcionCica: vi.fn() }));
vi.mock("../../../shared/hooks/useAutocompletarCedula", () => ({
  useAutocompletarCedula: () => ({ estado: "encontrada", verificar: vi.fn() }),
}));
vi.mock("../../../shared/hooks/useUbicacionesCostaRica", () => ({
  useProvinciasCR: () => ({ data: [{ id: "5", nombre: "Guanacaste" }] }),
  useCantonesCR: () => ({ data: [{ id: "01", nombre: "Nicoya" }] }),
  useDistritosCR: () => ({ data: [{ id: "01", nombre: "Nicoya" }] }),
  resolverIdPorNombre: (opciones: { id: string; nombre: string }[], nombre: string) => opciones.find((o) => o.nombre === nombre)?.id,
}));

beforeEach(() => vi.mocked(crearInscripcionCica).mockReset());

function completar(container: HTMLElement) {
  const cambiar = (etiqueta: RegExp, valor: string) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  cambiar(/^Cédula/, "102340567");
  cambiar(/^Nombre\s*\*$/, "Ana");
  cambiar(/^Primer apellido\s*\*$/, "Pérez");
  cambiar(/^Fecha de nacimiento/, "1990-01-01");
  cambiar(/^Nacionalidad/, "Costarricense");
  cambiar(/^Teléfono/, "88888888");
  cambiar(/^Correo/, "ana@example.com");
  cambiar(/^Estado civil/, "soltero");
  fireEvent.click(screen.getByRole("checkbox", { name: "Bautizo" }));
  cambiar(/^Nombre del padre/, "Luis");
  cambiar(/^Primer apellido del padre/, "Pérez");
  cambiar(/^Nombre de la madre/, "María");
  cambiar(/^Primer apellido de la madre/, "Solís");
  const ubicacion = Array.from(container.querySelectorAll("select")).filter((s) => !s.id);
  for (const [i, valor] of ["Guanacaste", "Nicoya", "Nicoya"].entries()) {
    fireEvent.change(ubicacion[i], { target: { value: valor } });
  }
  cambiar(/^Dirección exacta/, "Frente a la iglesia");
  fireEvent.click(screen.getByRole("radio", { name: "Católico" }));
}

describe("envío CICA y resumen de obligatorios", () => {
  it("bloquea el formulario vacío sin resumen y enfoca la cédula", () => {
    const scroll = vi.fn();
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scroll;
    try {
      const { container } = render(<CicaPage />);
      fireEvent.submit(container.querySelector("form")!);
      expect(crearInscripcionCica).not.toHaveBeenCalled();
      expect(screen.getByRole("textbox", { name: /^Cédula/ })).toHaveFocus();
      expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
      expect(screen.queryByRole("alert", { name: "Resumen de errores" })).not.toBeInTheDocument();
    } finally {
      HTMLElement.prototype.scrollIntoView = original;
    }
  });

  it("envía una solicitud válida sin exigir campos opcionales", async () => {
    vi.mocked(crearInscripcionCica).mockResolvedValue({ id: 1, mensaje: "Solicitud registrada", estado: "Pendiente" });
    const { container } = render(<CicaPage />);
    completar(container);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(crearInscripcionCica).toHaveBeenCalledTimes(1));
    expect(crearInscripcionCica).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Ana", conyugeNombre: null, provincia: "Guanacaste" }));
    expect(await screen.findByText("Solicitud registrada")).toBeInTheDocument();
  });

  it("enfoca el primer dato inválido, aunque también haya errores de cónyuge", () => {
    const { container } = render(<CicaPage />);
    completar(container);
    fireEvent.change(screen.getByLabelText(/^Nombre\s*\*$/), { target: { value: " " } });
    fireEvent.change(screen.getByLabelText(/^Estado civil/), { target: { value: "union_libre" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(crearInscripcionCica).not.toHaveBeenCalled();
    const input = screen.getByPlaceholderText("Ej: Ana María");
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
