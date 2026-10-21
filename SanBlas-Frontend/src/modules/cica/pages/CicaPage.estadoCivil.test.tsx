import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CicaPage from "./CicaPage";

vi.mock("../../../seo/SeoHead", () => ({ default: () => null }));
vi.mock("../cicaService", () => ({
  consultarInscripcionCica: vi.fn(),
  crearInscripcionCica: vi.fn(),
}));

// La pantalla carga provincias con react-query; en el test se resuelven sincrónicas para no depender de la red.
vi.mock("../../../shared/hooks/useUbicacionesCostaRica", () => ({
  useProvinciasCR: () => ({
    data: [{ id: "5", nombre: "Guanacaste" }],
    isPending: false,
    isFetching: false,
    isError: false,
  }),
  useCantonesCR: (provinciaId?: string) => ({
    data: provinciaId ? [{ id: "01", nombre: "Nicoya" }] : [],
    isPending: false,
    isFetching: false,
    isError: false,
  }),
  useDistritosCR: (provinciaId?: string, cantonId?: string) => ({
    data: provinciaId && cantonId ? [{ id: "01", nombre: "Nicoya" }] : [],
    isPending: false,
    isFetching: false,
    isError: false,
  }),
  resolverIdPorNombre: (
    opciones: { id: string; nombre: string }[] | undefined,
    nombre: string,
  ) =>
    opciones?.find(
      (opcion) =>
        opcion.nombre.toLowerCase() === nombre.trim().toLowerCase(),
    )?.id,
}));

const seleccionarEstadoCivil = (
  container: HTMLElement,
  valor: string,
): void => {
  const select = container.querySelector("#cica-estado-civil-select");
  expect(select).not.toBeNull();
  fireEvent.change(select as HTMLSelectElement, { target: { value: valor } });
};

const seccionConyuge = (container: HTMLElement) =>
  within(container.querySelector("#cica-estado-civil") as HTMLElement);

describe("CicaPage: sección de cónyuge según estado civil", () => {
  it("no muestra el cónyuge cuando no hay estado seleccionado", () => {
    const { container } = render(<CicaPage />);

    expect(
      seccionConyuge(container).queryByText("Cónyuge o compañero(a)"),
    ).not.toBeInTheDocument();
    expect(
      seccionConyuge(container).queryByPlaceholderText("Ej: Luis"),
    ).not.toBeInTheDocument();
  });

  it.each(["soltero", "divorciado"])(
    "no muestra el cónyuge cuando el estado es %s",
    (estado) => {
      const { container } = render(<CicaPage />);
      seleccionarEstadoCivil(container, estado);

      expect(
        seccionConyuge(container).queryByText("Cónyuge o compañero(a)"),
      ).not.toBeInTheDocument();
      expect(
        seccionConyuge(container).queryByPlaceholderText("Ej: Luis"),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    "matrimonio_civil",
    "matrimonio_catolico",
    "union_libre",
    "union_civil",
  ])("muestra el cónyuge cuando el estado es %s", (estado) => {
    const { container } = render(<CicaPage />);
    seleccionarEstadoCivil(container, estado);

    const seccion = seccionConyuge(container);
    expect(seccion.getByText("Cónyuge o compañero(a)")).toBeInTheDocument();
    expect(seccion.getByPlaceholderText("Ej: Luis")).toBeInTheDocument();
    expect(seccion.getByPlaceholderText("Ej: Pérez")).toBeInTheDocument();
    expect(seccion.getByPlaceholderText("Ej: Gómez")).toBeInTheDocument();
  });

  it("limpia los datos del cónyuge al pasar a un estado sin pareja", () => {
    const { container } = render(<CicaPage />);
    seleccionarEstadoCivil(container, "matrimonio_civil");

    fireEvent.change(seccionConyuge(container).getByPlaceholderText("Ej: Luis"), {
      target: { value: "Luis" },
    });
    expect(
      seccionConyuge(container).getByPlaceholderText("Ej: Luis"),
    ).toHaveValue("Luis");

    seleccionarEstadoCivil(container, "soltero");
    expect(
      seccionConyuge(container).queryByPlaceholderText("Ej: Luis"),
    ).not.toBeInTheDocument();

    seleccionarEstadoCivil(container, "matrimonio_civil");
    expect(
      seccionConyuge(container).getByPlaceholderText("Ej: Luis"),
    ).toHaveValue("");
  });
});
