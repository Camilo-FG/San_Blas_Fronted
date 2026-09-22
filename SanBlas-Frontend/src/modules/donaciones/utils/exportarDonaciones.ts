import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  Donacion,
  HistorialDonacion,
} from "../../../services/donacionesService";
import type { OpcionesExportacionDonaciones } from "../components/ExportarDonacionesModal";

export type FilaExportacionDonacion = {
  id: number;
  fecha: string;
  fechaTexto: string;
  nombre: string;
  correo: string;
  telefono: string;
  detalle: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
};

const normalizarEstado = (estado?: string): FilaExportacionDonacion["estado"] => {
  const valor = (estado || "").toLowerCase();
  if (valor === "aprobado" || valor === "aceptada") return "Aprobado";
  if (
    valor === "rechazado" ||
    valor === "rechazada" ||
    valor === "denegada"
  )
    return "Rechazado";
  return "Pendiente";
};

const formatearFechaCorta = (fecha?: string): string => {
  const base = (fecha || "").slice(0, 10);
  const partes = base.split("-");
  if (partes.length !== 3) return fecha || "";
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const tiempoDe = (fecha?: string): number => {
  const t = new Date(fecha || "").getTime();
  return Number.isNaN(t) ? 0 : t;
};

export function filtrarDonacionesParaExportar(
  donaciones: Donacion[],
  historial: HistorialDonacion[],
  criterios: Pick<
    OpcionesExportacionDonaciones,
    "estado" | "desde" | "hasta"
  >,
): FilaExportacionDonacion[] {
  const { estado, desde, hasta } = criterios;

  if (desde && hasta && desde > hasta) return [];

  const desdeT = desde ? new Date(`${desde}T00:00:00`).getTime() : null;
  const hastaT = hasta
    ? new Date(`${hasta}T23:59:59.999`).getTime()
    : null;

  const filas: FilaExportacionDonacion[] = [
    ...donaciones.map((d): FilaExportacionDonacion => ({
      id: d.id,
      fecha: d.fecha,
      fechaTexto: formatearFechaCorta(d.fecha),
      nombre: d.nombre || "",
      correo: d.correo || "",
      telefono: d.telefono || "",
      detalle: d.detalle || "",
      estado: normalizarEstado(d.estado),
    })),
    ...historial.map((h): FilaExportacionDonacion => ({
      id: h.id,
      fecha: h.fechaIngreso || "",
      fechaTexto: formatearFechaCorta(h.fechaIngreso),
      nombre: h.nombre || "",
      correo: h.correo || "",
      telefono: h.telefono || "",
      detalle: h.detalle || "",
      estado: normalizarEstado(h.estado),
    })),
  ];

  return filas
    .filter((fila) => {
      if (estado !== "todos" && fila.estado.toLowerCase() !== estado)
        return false;
      const t = tiempoDe(fila.fecha);
      if (desdeT !== null && t < desdeT) return false;
      if (hastaT !== null && t > hastaT) return false;
      return true;
    })
    .sort((a, b) => tiempoDe(b.fecha) - tiempoDe(a.fecha));
}

const SEPARADOR_CSV = ";";

const escaparCSV = (valor: string | number): string => {
  const texto = String(valor ?? "");
  return /[";\n\r]/.test(texto)
    ? `"${texto.replace(/"/g, '""')}"`
    : texto;
};

const ENCABEZADOS = [
  "ID",
  "Fecha",
  "Nombre",
  "Correo",
  "Teléfono",
  "Detalle",
  "Estado",
];

export function construirCSVDonaciones(
  filas: FilaExportacionDonacion[],
): string {
  const lineas = filas.map((fila) =>
    [
      fila.id,
      fila.fechaTexto,
      fila.nombre,
      fila.correo,
      fila.telefono,
      fila.detalle,
      fila.estado,
    ]
      .map(escaparCSV)
      .join(SEPARADOR_CSV),
  );
  return "\uFEFF" + [ENCABEZADOS.join(SEPARADOR_CSV), ...lineas].join("\r\n");
}

export function generarPDFDonaciones(
  filas: FilaExportacionDonacion[],
): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  doc.setFontSize(14);
  doc.text("Donaciones", 40, 40);
  autoTable(doc, {
    startY: 60,
    head: [ENCABEZADOS],
    body: filas.map((fila) => [
      fila.id,
      fila.fechaTexto,
      fila.nombre,
      fila.correo,
      fila.telefono,
      fila.detalle,
      fila.estado,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 51, 102] },
  });
  return doc.output("blob");
}

export function nombreArchivoExportacion(
  formato: "csv" | "pdf",
  fecha = new Date(),
): string {
  const dia = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  return `donaciones-${dia}.${formato}`;
}

export function descargarArchivo(
  nombre: string,
  contenido: string | Blob,
  tipoMime: string,
): void {
  const blob =
    contenido instanceof Blob
      ? contenido
      : new Blob([contenido], { type: `${tipoMime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportarDonaciones(
  donaciones: Donacion[],
  historial: HistorialDonacion[],
  opciones: OpcionesExportacionDonaciones,
): { filas: number } {
  const filas = filtrarDonacionesParaExportar(donaciones, historial, {
    estado: opciones.estado,
    desde: opciones.desde,
    hasta: opciones.hasta,
  });
  if (filas.length === 0) return { filas: 0 };
  if (opciones.formato === "csv") {
    descargarArchivo(
      nombreArchivoExportacion("csv"),
      construirCSVDonaciones(filas),
      "text/csv",
    );
  } else {
    descargarArchivo(
      nombreArchivoExportacion("pdf"),
      generarPDFDonaciones(filas),
      "application/pdf",
    );
  }
  return { filas: filas.length };
}
