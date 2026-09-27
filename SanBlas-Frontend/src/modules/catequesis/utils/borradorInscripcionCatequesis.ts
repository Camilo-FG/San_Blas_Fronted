import type { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";

const CLAVE = "sanblas.borrador.inscripcion-catequesis";
const VERSION = 1;

export type BorradorInscripcionCatequesis = {
  paso: number;
  aceptaLineamientos: boolean;
  tienePadre: boolean | null;
  tieneMadre: boolean | null;
  form: unknown;
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function comoPaso(valor: unknown): number | null {
  const paso = Number(valor);
  if (!Number.isInteger(paso) || paso < 1 || paso > 7) return null;
  return paso;
}

function comoBandera(valor: unknown): boolean | null {
  if (valor === true || valor === false) return valor;
  return null;
}

function sinArchivos(form: CatequesisEnrollmentData): CatequesisEnrollmentData {
  return {
    ...form,
    catequesis: { ...form.catequesis, feBautismoArchivo: null },
    inscripcion: {
      ...form.inscripcion,
      pago: { ...form.inscripcion.pago, archivoComprobante: null },
    },
  };
}

export function leerBorradorInscripcionCatequesis(): BorradorInscripcionCatequesis | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const datos = JSON.parse(crudo) as unknown;
    if (!esRegistro(datos) || datos.version !== VERSION) return null;
    const paso = comoPaso(datos.paso);
    if (paso === null || !esRegistro(datos.form)) return null;
    return {
      paso,
      aceptaLineamientos: datos.aceptaLineamientos === true,
      tienePadre: comoBandera(datos.tienePadre),
      tieneMadre: comoBandera(datos.tieneMadre),
      form: datos.form,
    };
  } catch {
    return null;
  }
}

export function guardarBorradorInscripcionCatequesis(
  borrador: {
    paso: number;
    aceptaLineamientos: boolean;
    tienePadre: boolean | null;
    tieneMadre: boolean | null;
    form: CatequesisEnrollmentData;
  },
  inicial: CatequesisEnrollmentData,
): void {
  try {
    const form = sinArchivos(borrador.form);
    const vacio =
      borrador.paso === 1 &&
      !borrador.aceptaLineamientos &&
      borrador.tienePadre === null &&
      borrador.tieneMadre === null &&
      JSON.stringify(form) === JSON.stringify(sinArchivos(inicial));

    if (vacio) {
      localStorage.removeItem(CLAVE);
      return;
    }

    localStorage.setItem(
      CLAVE,
      JSON.stringify({
        version: VERSION,
        paso: borrador.paso,
        aceptaLineamientos: borrador.aceptaLineamientos,
        tienePadre: borrador.tienePadre,
        tieneMadre: borrador.tieneMadre,
        form,
      }),
    );
  } catch {
    // El navegador puede bloquear el almacenamiento. El formulario sigue usable.
  }
}

export function borrarBorradorInscripcionCatequesis(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento disponible no hay borrador que borrar.
  }
}
