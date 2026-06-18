import type { CatequesisEnrollmentData } from "../../modules/catequesis/types/CatequesisEnrollmentData";
import type {
  CatequesisEnrollmentRecord,
  EstadoInscripcionCatequesis,
} from "../../modules/dashboard/catequesis/Types/catequesis";
import type {
  CrearInscripcionBackendRequest,
  InscripcionDetalleBackend,
  InscripcionResumenBackend,
} from "./catequesisApiTypes";

const normalizarFecha = (valor: unknown): string | null => {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "string") return valor.split("T")[0];
  if (typeof valor === "object" && "year" in (valor as object)) {
    const fecha = valor as { year: number; month: number; day: number };
    const mes = String(fecha.month).padStart(2, "0");
    const dia = String(fecha.day).padStart(2, "0");
    return `${fecha.year}-${mes}-${dia}`;
  }
  return String(valor);
};

const normalizarFechaSolicitud = (valor: string | undefined): string => {
  if (!valor) return "";
  return valor.split("T")[0];
};

const normalizarNivel = (nivel: string | null | undefined): string => {
  if (!nivel) return "";

  if (nivel.toLowerCase().startsWith("primero")) return "Primero";
  if (nivel.toLowerCase().startsWith("sétimo") || nivel.toLowerCase().startsWith("setimo"))
    return "Sétimo";

  return nivel;
};

export const mapEstadoBackendToFrontend = (
  estado: string,
): EstadoInscripcionCatequesis => {
  const estadoLower = estado.toLowerCase();

  if (estadoLower === "pendiente") return "pendiente";
  if (estadoLower === "aprobada" || estadoLower === "aprobado") return "aprobado";
  if (estadoLower === "rechazada" || estadoLower === "rechazado") return "rechazado";

  return "pendiente";
};

export const mapEstadoFrontendToBackend = (
  estado: "aprobado" | "rechazado" | "pendiente",
): string => {
  if (estado === "aprobado") return "Aprobada";
  if (estado === "rechazado") return "Rechazada";
  return "Pendiente";
};

const emptyPago = () => ({
  metodoPago: "No registrado",
  numeroComprobante: "",
  monto: 0,
  comprobanteArchivo: null,
});

const obtenerNombreArchivo = (archivo: File | string | null | undefined): string => {
  if (!archivo) return "";
  if (typeof archivo === "string") return archivo;
  return archivo.name;
};

const toNullableDate = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const mapFormToBackendRequest = (
  form: CatequesisEnrollmentData,
): CrearInscripcionBackendRequest => ({
  datosInscripcion: {
    centroCatequesis: form.catequesis.centroCatequesis ?? "",
    nivelAInscribirse: normalizarNivel(form.catequesis.nivelAInscribirse),
    feBautismoArchivo: obtenerNombreArchivo(form.catequesis.feBautismoArchivo),
  },
  datosCatequizando: {
    nombre: form.catequizando.nombre.trim(),
    apellidos: form.catequizando.apellidos.trim(),
    fechaNacimiento: form.catequizando.fechaNacimiento?.trim() ?? "",
    direccionExacta: form.catequizando.direccion.direccionExacta?.trim() ?? "",
  },
  datosBautismo: {
    parroquia: form.catequizando.bautismo.parroquia?.trim() ?? "",
    fecha: toNullableDate(form.catequizando.bautismo.fecha),
    tomo: form.catequizando.bautismo.tomo,
    folio: form.catequizando.bautismo.folio,
    asiento: form.catequizando.bautismo.asiento,
  },
  datosAdecuacion: {
    requiereAdecuacionCentroEducativo:
      form.catequizando.adecuacion.requiereAdecuacionCentroEducativo ?? false,
    descripcionAdecuacion: form.catequizando.adecuacion.descripcionAdecuacion,
  },
  datosCondicionSalud: {
    portadorEnfermedadCronica:
      form.catequizando.condicionSalud.portadorEnfermedadCronica ?? false,
    descripcionEnfermedad:
      form.catequizando.condicionSalud.descripcionEnfermedad,
  },
  datosMadre: {
    nombre: form.madreCatequizando.nombre.trim(),
    apellidos: form.madreCatequizando.apellidos.trim(),
    direccionExacta:
      form.madreCatequizando.direccion.direccionExacta?.trim() ?? "",
    ciudad: form.madreCatequizando.direccion.ciudad?.trim() ?? "",
    provincia: form.madreCatequizando.direccion.provincia?.trim() ?? "",
    telefono: form.madreCatequizando.telefono.trim(),
  },
  datosPersonaInscribe: {
    nombre: form.inscripcion.personaQueInscribe.nombre?.trim() ?? "",
    apellidos: form.inscripcion.personaQueInscribe.apellido?.trim() ?? "",
    parentesco: form.inscripcion.parentesco?.trim() ?? "",
  },
  datosPago: {
    metodoPago: "SINPE Móvil",
    numeroComprobanteSinpe: form.inscripcion.pago.numeroComprobanteSINPE.trim(),
    comprobanteArchivo: obtenerNombreArchivo(
      form.inscripcion.pago.archivoComprobante,
    ),
    monto: 5000,
  },
});

export const mapResumenToEnrollmentRecord = (
  resumen: InscripcionResumenBackend,
): CatequesisEnrollmentRecord => {
  const partesNombre = resumen.nombreCatequizando.trim().split(/\s+/);
  const nombre = partesNombre[0] ?? "";
  const apellidos = partesNombre.slice(1).join(" ");

  return {
    id: resumen.id,
    codigoSolicitud: `CAT-${resumen.id}`,
    estado: mapEstadoBackendToFrontend(resumen.estado),
    fechaSolicitud: resumen.fechaSolicitud.split("T")[0],
    catequesis: {
      centroCatequesis: resumen.centroCatequesis,
      nivelAInscribirse: resumen.nivelAInscribirse,
      feBautismoArchivo: null,
    },
    catequizando: {
      nombre,
      apellidos,
      fechaNacimiento: null,
      direccion: { direccionExacta: null },
      bautismo: {
        parroquia: null,
        fecha: null,
        tomo: null,
        folio: null,
        asiento: null,
      },
      adecuacion: {
        requiereAdecuacionCentroEducativo: null,
        descripcionAdecuacion: null,
      },
      condicionSalud: {
        portadorEnfermedadCronica: null,
        descripcionEnfermedad: null,
      },
    },
    encargado: {
      nombre: "",
      apellidos: "",
      cedula: "",
      telefono: resumen.telefonoEncargada,
      correo: "",
      direccion: { direccionExacta: null },
      parentesco: "",
    },
    pago: emptyPago(),
  };
};

export const mapDetalleToEnrollmentRecord = (
  detalle: InscripcionDetalleBackend,
): CatequesisEnrollmentRecord => ({
  id: detalle.id,
  codigoSolicitud: `CAT-${detalle.id}`,
  estado: mapEstadoBackendToFrontend(detalle.estado),
  fechaSolicitud: normalizarFechaSolicitud(detalle.fechaSolicitud),
  observacionAdministrativa: detalle.observacionAdministrativa ?? null,
  catequesis: {
    centroCatequesis: detalle.centroCatequesis,
    nivelAInscribirse: detalle.nivelAInscribirse,
    feBautismoArchivo: detalle.feBautismoArchivo || null,
  },
  catequizando: {
    nombre: detalle.catequizando?.nombre ?? "",
    apellidos: detalle.catequizando?.apellidos ?? "",
    fechaNacimiento: normalizarFecha(detalle.catequizando?.fechaNacimiento),
    direccion: {
      direccionExacta: detalle.catequizando?.direccionExacta ?? null,
    },
    bautismo: {
      parroquia: detalle.bautismo?.parroquia ?? null,
      fecha: normalizarFecha(detalle.bautismo?.fecha),
      tomo: detalle.bautismo?.tomo ?? null,
      folio: detalle.bautismo?.folio ?? null,
      asiento: detalle.bautismo?.asiento ?? null,
    },
    adecuacion: {
      requiereAdecuacionCentroEducativo:
        detalle.adecuacion?.requiereAdecuacionCentroEducativo ?? null,
      descripcionAdecuacion: detalle.adecuacion?.descripcionAdecuacion ?? null,
    },
    condicionSalud: {
      portadorEnfermedadCronica:
        detalle.condicionSalud?.portadorEnfermedadCronica ?? null,
      descripcionEnfermedad: detalle.condicionSalud?.descripcionEnfermedad ?? null,
    },
  },
  encargado: {
    nombre: detalle.personaInscribe?.nombre ?? detalle.madre?.nombre ?? "",
    apellidos: detalle.personaInscribe?.apellidos ?? detalle.madre?.apellidos ?? "",
    cedula: "",
    telefono: detalle.madre?.telefono ?? "",
    correo: "",
    direccion: {
      direccionExacta: detalle.madre?.direccionExacta ?? null,
    },
    parentesco: detalle.personaInscribe?.parentesco ?? "",
  },
  pago: {
    metodoPago: detalle.pago?.metodoPago ?? "",
    numeroComprobante: detalle.pago?.numeroComprobanteSinpe ?? "",
    monto: detalle.pago?.monto ?? 0,
    comprobanteArchivo: detalle.pago?.comprobanteArchivo || null,
  },
});
