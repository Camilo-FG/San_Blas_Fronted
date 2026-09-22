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

const AZUL_ROYAL: [number, number, number] = [0, 51, 102];
const DORADO: [number, number, number] = [170, 115, 35];
const GRIS_FILA: [number, number, number] = [241, 245, 250];
const GRIS_TEXTO: [number, number, number] = [100, 116, 139];
const VERDE: [number, number, number] = [22, 120, 60];
const ROJO: [number, number, number] = [180, 40, 40];

const etiquetaEstadoFiltro = (estado?: string): string => {
  switch ((estado || "todos").toLowerCase()) {
    case "pendiente":
      return "Pendientes";
    case "aprobado":
      return "Aprobadas";
    case "rechazado":
      return "Rechazadas";
    default:
      return "Todos";
  }
};

const formatearFechaHora = (fecha = new Date()): string => {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const hora = String(fecha.getHours()).padStart(2, "0");
  const min = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()} ${hora}:${min}`;
};

export type MetaReporteDonaciones = {
  estado?: string;
  desde?: string;
  hasta?: string;
};

export function generarPDFDonaciones(
  filas: FilaExportacionDonacion[],
  meta?: MetaReporteDonaciones,
): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const MARGEN = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...AZUL_ROYAL);
  doc.text("Parroquia San Blas", MARGEN, 46);
  doc.setFontSize(12);
  doc.setTextColor(...GRIS_TEXTO);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte de donaciones", MARGEN, 64);

  doc.setDrawColor(...DORADO);
  doc.setLineWidth(2.5);
  doc.line(MARGEN, 72, ancho - MARGEN, 72);

  const resumen: string[] = [
    `Total: ${filas.length} ${filas.length === 1 ? "donación" : "donaciones"}`,
    `Estado: ${etiquetaEstadoFiltro(meta?.estado)}`,
  ];
  if (meta?.desde || meta?.hasta) {
    const desde = meta.desde
      ? formatearFechaCorta(meta.desde)
      : "el inicio";
    const hasta = meta.hasta ? formatearFechaCorta(meta.hasta) : "hoy";
    resumen.push(`Período: ${desde} al ${hasta}`);
  }
  doc.setFontSize(9);
  doc.setTextColor(...GRIS_TEXTO);
  doc.text(resumen.join("   •   "), MARGEN, 88);
  doc.text(`Generado: ${formatearFechaHora()}`, ancho - MARGEN, 88, {
    align: "right",
  });

  const totalPaginas = "{total_pages_count_string}";
  autoTable(doc, {
    startY: 100,
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
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [22, 36, 60],
      lineColor: [203, 213, 225],
      lineWidth: 0.6,
      valign: "middle",
    },
    headStyles: {
      fillColor: [...AZUL_ROYAL],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    alternateRowStyles: { fillColor: [...GRIS_FILA] },
    columnStyles: {
      0: { cellWidth: 42, halign: "center" },
      1: { cellWidth: 68, halign: "center" },
      2: { cellWidth: 105 },
      3: { cellWidth: 135 },
      4: { cellWidth: 72, halign: "center" },
      5: { cellWidth: "auto" },
      6: { cellWidth: 78, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 6) return;
      const valor = String(data.cell.raw ?? "").toLowerCase();
      data.cell.styles.fontStyle = "bold";
      if (valor === "aprobado") data.cell.styles.textColor = [...VERDE];
      else if (valor === "rechazado") data.cell.styles.textColor = [...ROJO];
      else data.cell.styles.textColor = [...DORADO];
    },
    didDrawPage: (data) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRIS_TEXTO);
      doc.text(
        `Página ${data.pageNumber} de ${totalPaginas}`,
        ancho - MARGEN,
        alto - 22,
        { align: "right" },
      );
    },
  });
  doc.putTotalPages(totalPaginas);
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
      generarPDFDonaciones(filas, {
        estado: opciones.estado,
        desde: opciones.desde,
        hasta: opciones.hasta,
      }),
      "application/pdf",
    );
  }
  return { filas: filas.length };
}
