import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Search,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import ModalSimple from "../ModalSimple/ModalSimple";
import "./GestionSolicitudesCatequesis.css";

/* 
  Si ya tenés estos tipos en Types/catequesis.ts,
  podés borrar los types de aquí e importar así:

  import type {
    CatequesisEnrollmentRecord,
    EstadoInscripcionCatequesis,
  } from "../Types/catequesis";
*/

export interface CatequesisData {
  centroCatequesis: string | null;
  nivelAInscribirse: string | null;
  feBautismoArchivo: File | string | null;
}

export interface AdecuacionCatequizando {
  requiereAdecuacionCentroEducativo: boolean | null;
  descripcionAdecuacion: string | null;
}

export interface CondicionSaludCatequizando {
  portadorEnfermedadCronica: boolean | null;
  descripcionEnfermedad: string | null;
}

export interface CatequizandoData {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string | null;
  direccion: {
    direccionExacta: string | null;
  };
  bautismo: {
    parroquia: string | null;
    fecha: string | null;
    tomo: string | null;
    folio: string | null;
    asiento: string | null;
  };
  adecuacion: AdecuacionCatequizando;
  condicionSalud: CondicionSaludCatequizando;
}

export interface MadreCatequizandoData {
  nombre: string;
  apellidos: string;
  direccion: {
    direccionExacta: string | null;
    ciudad: string | null;
    provincia: string | null;
  };
  telefono: string;
}

export interface PagoInscripcionCatequesis {
  numeroComprobanteSINPE: string;
  archivoComprobante: File | string | null;
  fechaPago: string | null;
}

export interface InscripcionData {
  personaQueInscribe: {
    nombre: string | null;
    apellido: string | null;
  };
  parentesco: string | null;
  pago: PagoInscripcionCatequesis;
}

export interface CatequesisEnrollmentData {
  catequesis: CatequesisData;
  catequizando: CatequizandoData;
  madreCatequizando: MadreCatequizandoData;
  inscripcion: InscripcionData;
}

export type EstadoInscripcionCatequesis =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "requiere_modificacion";

export interface CatequesisEnrollmentRecord extends CatequesisEnrollmentData {
  id: number;
  codigoSolicitud: string;
  estado: EstadoInscripcionCatequesis;
  fechaSolicitud: string;
  observacionAdministrativa?: string | null;
  created_at?: string;
  updated_at?: string;
}

const solicitudesDemo: CatequesisEnrollmentRecord[] = [
  {
    id: 1,
    codigoSolicitud: "CAT-001",
    estado: "pendiente",
    fechaSolicitud: "2026-05-28",
    observacionAdministrativa: null,
    catequesis: {
      centroCatequesis: "Centro Parroquial San Blas",
      nivelAInscribirse: "Primera Comunión",
      feBautismoArchivo: "fe-bautismo-maria.pdf",
    },
    catequizando: {
      nombre: "María Fernanda",
      apellidos: "López Ramírez",
      fechaNacimiento: "2018-03-12",
      direccion: {
        direccionExacta: "Barrio San Blas, 200 metros norte de la iglesia.",
      },
      bautismo: {
        parroquia: "Parroquia San Blas",
        fecha: "2018-06-15",
        tomo: "12",
        folio: "45",
        asiento: "203",
      },
      adecuacion: {
        requiereAdecuacionCentroEducativo: false,
        descripcionAdecuacion: null,
      },
      condicionSalud: {
        portadorEnfermedadCronica: false,
        descripcionEnfermedad: null,
      },
    },
    madreCatequizando: {
      nombre: "Laura",
      apellidos: "Ramírez Mora",
      direccion: {
        direccionExacta: "Barrio San Blas, Nicoya.",
        ciudad: "Nicoya",
        provincia: "Guanacaste",
      },
      telefono: "8888-8888",
    },
    inscripcion: {
      personaQueInscribe: {
        nombre: "Laura",
        apellido: "Ramírez Mora",
      },
      parentesco: "Madre",
      pago: {
        numeroComprobanteSINPE: "SINPE-2026-001",
        archivoComprobante: "comprobante-maria.jpg",
        fechaPago: "2026-05-28",
      },
    },
  },
  {
    id: 2,
    codigoSolicitud: "CAT-002",
    estado: "pendiente",
    fechaSolicitud: "2026-05-27",
    observacionAdministrativa: null,
    catequesis: {
      centroCatequesis: "Centro Catequístico Guadalupe",
      nivelAInscribirse: "Primera Comunión",
      feBautismoArchivo: null,
    },
    catequizando: {
      nombre: "José Andrés",
      apellidos: "Vargas Solano",
      fechaNacimiento: "2019-01-22",
      direccion: {
        direccionExacta: "Guadalupe, Nicoya, frente a la plaza.",
      },
      bautismo: {
        parroquia: "Parroquia San Blas",
        fecha: "2019-04-10",
        tomo: "8",
        folio: "31",
        asiento: "120",
      },
      adecuacion: {
        requiereAdecuacionCentroEducativo: true,
        descripcionAdecuacion: "Requiere apoyo en lectura y seguimiento.",
      },
      condicionSalud: {
        portadorEnfermedadCronica: true,
        descripcionEnfermedad: "Asma leve controlada.",
      },
    },
    madreCatequizando: {
      nombre: "Andrea",
      apellidos: "Solano Pérez",
      direccion: {
        direccionExacta: "Guadalupe centro.",
        ciudad: "Nicoya",
        provincia: "Guanacaste",
      },
      telefono: "8777-4545",
    },
    inscripcion: {
      personaQueInscribe: {
        nombre: "Andrea",
        apellido: "Solano Pérez",
      },
      parentesco: "Madre",
      pago: {
        numeroComprobanteSINPE: "SINPE-2026-002",
        archivoComprobante: "comprobante-jose.jpg",
        fechaPago: "2026-05-27",
      },
    },
  },
  {
    id: 3,
    codigoSolicitud: "CAT-003",
    estado: "aprobado",
    fechaSolicitud: "2026-05-25",
    observacionAdministrativa: "Solicitud aprobada correctamente.",
    catequesis: {
      centroCatequesis: "Centro Parroquial San Blas",
      nivelAInscribirse: "Primera Comunión",
      feBautismoArchivo: "fe-bautismo-sofia.pdf",
    },
    catequizando: {
      nombre: "Sofía",
      apellidos: "Hernández Mora",
      fechaNacimiento: "2018-08-09",
      direccion: {
        direccionExacta: "Centro de Nicoya.",
      },
      bautismo: {
        parroquia: "Parroquia San Blas",
        fecha: "2018-10-12",
        tomo: "11",
        folio: "22",
        asiento: "88",
      },
      adecuacion: {
        requiereAdecuacionCentroEducativo: false,
        descripcionAdecuacion: null,
      },
      condicionSalud: {
        portadorEnfermedadCronica: false,
        descripcionEnfermedad: null,
      },
    },
    madreCatequizando: {
      nombre: "Karina",
      apellidos: "Mora Castro",
      direccion: {
        direccionExacta: "Centro de Nicoya, cerca del parque.",
        ciudad: "Nicoya",
        provincia: "Guanacaste",
      },
      telefono: "8999-1212",
    },
    inscripcion: {
      personaQueInscribe: {
        nombre: "Karina",
        apellido: "Mora Castro",
      },
      parentesco: "Madre",
      pago: {
        numeroComprobanteSINPE: "SINPE-2026-003",
        archivoComprobante: "comprobante-sofia.jpg",
        fechaPago: "2026-05-25",
      },
    },
  },
];

const obtenerTextoEstado = (estado: EstadoInscripcionCatequesis) => {
  switch (estado) {
    case "pendiente":
      return "Pendiente";
    case "aprobado":
      return "Aprobado";
    case "rechazado":
      return "Rechazado";
    case "requiere_modificacion":
      return "Requiere modificación";
    default:
      return "Desconocido";
  }
};

const obtenerClaseEstado = (estado: EstadoInscripcionCatequesis) => {
  switch (estado) {
    case "pendiente":
      return "pendiente";
    case "aprobado":
      return "aprobado";
    case "rechazado":
      return "rechazado";
    case "requiere_modificacion":
      return "modificacion";
    default:
      return "pendiente";
  }
};

function GestionSolicitudesCatequesis() {
  const [solicitudes, setSolicitudes] =
    useState<CatequesisEnrollmentRecord[]>(solicitudesDemo);

  const [statusFilter, setStatusFilter] = useState<
    "todos" | EstadoInscripcionCatequesis
  >("todos");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<CatequesisEnrollmentRecord | null>(null);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredSolicitudes = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();

    return solicitudes.filter((solicitud) => {
      const nombreCatequizando =
        `${solicitud.catequizando.nombre} ${solicitud.catequizando.apellidos}`.toLowerCase();

      const nombreEncargada =
        `${solicitud.madreCatequizando.nombre} ${solicitud.madreCatequizando.apellidos}`.toLowerCase();

      const matchesStatus =
        statusFilter === "todos" || solicitud.estado === statusFilter;

      const matchesSearch =
        nombreCatequizando.includes(search) ||
        nombreEncargada.includes(search) ||
        solicitud.codigoSolicitud.toLowerCase().includes(search) ||
        solicitud.madreCatequizando.telefono.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [solicitudes, statusFilter, searchQuery]);

  const totalPendientes = useMemo(
    () => solicitudes.filter((item) => item.estado === "pendiente").length,
    [solicitudes],
  );

  const totalAprobadas = useMemo(
    () => solicitudes.filter((item) => item.estado === "aprobado").length,
    [solicitudes],
  );

  const totalRechazadas = useMemo(
    () => solicitudes.filter((item) => item.estado === "rechazado").length,
    [solicitudes],
  );

  const closeModal = useCallback(() => {
    setSelectedSolicitud(null);
    setIsRejecting(false);
    setRejectionReason("");
  }, []);

  const openModal = useCallback((solicitud: CatequesisEnrollmentRecord) => {
    setSelectedSolicitud(solicitud);
    setIsRejecting(false);
    setRejectionReason("");
  }, []);

  const approveSolicitud = useCallback(
    (id: number) => {
      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === id
            ? {
                ...solicitud,
                estado: "aprobado",
                observacionAdministrativa:
                  "Solicitud aprobada por administración.",
              }
            : solicitud,
        ),
      );

      closeModal();
    },
    [closeModal],
  );

  const rejectSolicitud = useCallback(
    (id: number) => {
      if (!rejectionReason.trim()) return;

      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === id
            ? {
                ...solicitud,
                estado: "rechazado",
                observacionAdministrativa: rejectionReason.trim(),
              }
            : solicitud,
        ),
      );

      closeModal();
    },
    [rejectionReason, closeModal],
  );

  const columns = useMemo<ColumnDef<CatequesisEnrollmentRecord>[]>(
    () => [
      {
        accessorKey: "codigoSolicitud",
        header: "ID",
        cell: ({ row }) => (
          <span className="catequesis-admin__id">
            {row.original.codigoSolicitud}
          </span>
        ),
      },
      {
        id: "catequizando",
        header: "Catequizando",
        cell: ({ row }) => (
          <div className="catequesis-admin__student">
            <strong>
              {row.original.catequizando.nombre}{" "}
              {row.original.catequizando.apellidos}
            </strong>
            <span>
              Nacimiento:{" "}
              {row.original.catequizando.fechaNacimiento || "No registrada"}
            </span>
          </div>
        ),
      },
      {
        id: "nivel",
        header: "Nivel",
        cell: ({ row }) => (
          <span className="catequesis-admin__level">
            {row.original.catequesis.nivelAInscribirse || "No registrado"}
          </span>
        ),
      },
      {
        id: "encargada",
        header: "Encargada / Teléfono",
        cell: ({ row }) => (
          <div className="catequesis-admin__parent">
            <strong>
              {row.original.madreCatequizando.nombre}{" "}
              {row.original.madreCatequizando.apellidos}
            </strong>
            <span>{row.original.madreCatequizando.telefono}</span>
          </div>
        ),
      },
      {
        accessorKey: "fechaSolicitud",
        header: "Fecha",
        cell: ({ row }) => <span>{row.original.fechaSolicitud}</span>,
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.original.estado;

          return (
            <span
              className={`catequesis-admin__badge catequesis-admin__badge--${obtenerClaseEstado(
                estado,
              )}`}
            >
              {obtenerTextoEstado(estado)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <button
            type="button"
            className="catequesis-admin__review-btn"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openModal(row.original);
            }}
          >
            <Eye size={14} />
            Revisar expediente
          </button>
        ),
      },
    ],
    [openModal],
  );

  const table = useReactTable({
    data: filteredSolicitudes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="catequesis-admin">
      <div className="catequesis-admin__top">
        <div>
          <h1>Matrículas de Catequesis</h1>
          <p>
            Autorice y controle las inscripciones enviadas por los encargados.
          </p>
        </div>
      </div>

      <div className="catequesis-admin__stats">
        <article className="catequesis-admin__stat">
          <div>
            <span>Total pendientes</span>
            <strong>{totalPendientes}</strong>
          </div>

          <div className="catequesis-admin__stat-icon catequesis-admin__stat-icon--pending">
            <Clock size={22} />
          </div>
        </article>

        <article className="catequesis-admin__stat">
          <div>
            <span>Matrículas aprobadas</span>
            <strong>{totalAprobadas}</strong>
          </div>

          <div className="catequesis-admin__stat-icon catequesis-admin__stat-icon--approved">
            <CheckCircle size={22} />
          </div>
        </article>

        <article className="catequesis-admin__stat">
          <div>
            <span>Matrículas rechazadas</span>
            <strong>{totalRechazadas}</strong>
          </div>

          <div className="catequesis-admin__stat-icon catequesis-admin__stat-icon--rejected">
            <XCircle size={22} />
          </div>
        </article>
      </div>

      <div className="catequesis-admin__filters">
        <div className="catequesis-admin__search">
          <Search size={17} />
          <input
            type="text"
            value={searchQuery}
            placeholder="Buscar por catequizando, encargada, teléfono o código..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="catequesis-admin__filter-buttons">
          {(
            [
              ["todos", "Todos"],
              ["pendiente", "Pendiente"],
              ["aprobado", "Aprobado"],
              ["rechazado", "Rechazado"],
              ["requiere_modificacion", "Modificación"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={
                statusFilter === value
                  ? "catequesis-admin__filter-btn catequesis-admin__filter-btn--active"
                  : "catequesis-admin__filter-btn"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="catequesis-admin__table-card">
        <div className="catequesis-admin__table-wrapper">
          <table className="catequesis-admin__table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="catequesis-admin__empty"
                  >
                    No se encontraron matrículas con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSolicitud && (
        <ModalSimple onClose={closeModal}>
          <div className="catequesis-admin__modal-header">
            <div>
              <span>Matrícula Catequesis</span>
              <h2>
                Expediente de {selectedSolicitud.catequizando.nombre}{" "}
                {selectedSolicitud.catequizando.apellidos}
              </h2>
            </div>
          </div>

          <div className="catequesis-admin__modal-body">
            <div className="catequesis-admin__section">
              <h3>Información de Catequesis</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Centro de catequesis</span>
                  <strong>
                    {selectedSolicitud.catequesis.centroCatequesis ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Nivel a inscribirse</span>
                  <strong>
                    {selectedSolicitud.catequesis.nivelAInscribirse ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Fe de bautismo</span>
                  <strong>
                    {selectedSolicitud.catequesis.feBautismoArchivo
                      ? "Archivo adjunto"
                      : "No adjuntado"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos del Catequizando</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {selectedSolicitud.catequizando.nombre}{" "}
                    {selectedSolicitud.catequizando.apellidos}
                  </strong>
                </div>

                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>
                    {selectedSolicitud.catequizando.fechaNacimiento ||
                      "No registrada"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.catequizando.direccion.direccionExacta ||
                      "No registrada"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos de Bautismo</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Parroquia</span>
                  <strong>
                    {selectedSolicitud.catequizando.bautismo.parroquia ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Fecha de bautismo</span>
                  <strong>
                    {selectedSolicitud.catequizando.bautismo.fecha ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Tomo</span>
                  <strong>
                    {selectedSolicitud.catequizando.bautismo.tomo ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Folio</span>
                  <strong>
                    {selectedSolicitud.catequizando.bautismo.folio ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Asiento</span>
                  <strong>
                    {selectedSolicitud.catequizando.bautismo.asiento ||
                      "No registrado"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Adecuación Educativa</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>¿Requiere adecuación?</span>
                  <strong>
                    {selectedSolicitud.catequizando.adecuacion
                      .requiereAdecuacionCentroEducativo
                      ? "Sí"
                      : "No"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Descripción</span>
                  <strong>
                    {selectedSolicitud.catequizando.adecuacion
                      .descripcionAdecuacion || "No aplica"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Condición de Salud</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>¿Porta enfermedad crónica?</span>
                  <strong>
                    {selectedSolicitud.catequizando.condicionSalud
                      .portadorEnfermedadCronica
                      ? "Sí"
                      : "No"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Descripción</span>
                  <strong>
                    {selectedSolicitud.catequizando.condicionSalud
                      .descripcionEnfermedad || "No aplica"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos de la Madre o Encargada</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando.nombre}{" "}
                    {selectedSolicitud.madreCatequizando.apellidos}
                  </strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando.telefono}
                  </strong>
                </div>

                <div>
                  <span>Ciudad</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando.direccion.ciudad ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Provincia</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando.direccion.provincia ||
                      "No registrada"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando.direccion
                      .direccionExacta || "No registrada"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos de Inscripción</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Persona que inscribe</span>
                  <strong>
                    {selectedSolicitud.inscripcion.personaQueInscribe.nombre ||
                      "No registrado"}{" "}
                    {selectedSolicitud.inscripcion.personaQueInscribe
                      .apellido || ""}
                  </strong>
                </div>

                <div>
                  <span>Parentesco</span>
                  <strong>
                    {selectedSolicitud.inscripcion.parentesco ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Número comprobante SINPE</span>
                  <strong>
                    {selectedSolicitud.inscripcion.pago
                      .numeroComprobanteSINPE || "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Fecha de pago</span>
                  <strong>
                    {selectedSolicitud.inscripcion.pago.fechaPago ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Comprobante de pago</span>
                  <strong>
                    {selectedSolicitud.inscripcion.pago.archivoComprobante
                      ? "Archivo adjunto"
                      : "No adjuntado"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Gestión Administrativa</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Código de solicitud</span>
                  <strong>{selectedSolicitud.codigoSolicitud}</strong>
                </div>

                <div>
                  <span>Estado actual</span>
                  <strong>
                    {obtenerTextoEstado(selectedSolicitud.estado)}
                  </strong>
                </div>

                <div>
                  <span>Fecha de solicitud</span>
                  <strong>{selectedSolicitud.fechaSolicitud}</strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Observación administrativa</span>
                  <strong>
                    {selectedSolicitud.observacionAdministrativa ||
                      "Sin observaciones administrativas"}
                  </strong>
                </div>
              </div>
            </div>

            {selectedSolicitud.estado === "aprobado" && (
              <div className="catequesis-admin__message catequesis-admin__message--approved">
                <CheckCircle size={17} />
                <p>
                  La inscripción ya fue aprobada e integrada al proceso de
                  catequesis.
                </p>
              </div>
            )}

            {selectedSolicitud.estado === "rechazado" && (
              <div className="catequesis-admin__message catequesis-admin__message--rejected">
                <XCircle size={17} />
                <div>
                  <strong>Solicitud rechazada.</strong>
                  <p>
                    Motivo:{" "}
                    {selectedSolicitud.observacionAdministrativa ||
                      "No se especificó motivo."}
                  </p>
                </div>
              </div>
            )}

            {selectedSolicitud.estado === "requiere_modificacion" && (
              <div className="catequesis-admin__message catequesis-admin__message--modification">
                <AlertCircle size={17} />
                <div>
                  <strong>Requiere modificación.</strong>
                  <p>
                    {selectedSolicitud.observacionAdministrativa ||
                      "La solicitud requiere correcciones por parte del encargado."}
                  </p>
                </div>
              </div>
            )}

            {selectedSolicitud.estado === "pendiente" && (
              <div className="catequesis-admin__actions-area">
                {!isRejecting ? (
                  <div className="catequesis-admin__modal-actions">
                    <button
                      type="button"
                      className="catequesis-admin__approve"
                      onClick={() => approveSolicitud(selectedSolicitud.id)}
                    >
                      Aprobar inscripción
                    </button>

                    <button
                      type="button"
                      className="catequesis-admin__reject"
                      onClick={() => setIsRejecting(true)}
                    >
                      Rechazar inscripción
                    </button>
                  </div>
                ) : (
                  <div className="catequesis-admin__reject-box">
                    <div className="catequesis-admin__reject-header">
                      <strong>Indique el motivo del rechazo</strong>

                      <button
                        type="button"
                        onClick={() => {
                          setIsRejecting(false);
                          setRejectionReason("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={rejectionReason}
                      placeholder="Ej: Falta documento de fe de bautismo, comprobante SINPE inválido o datos incompletos."
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />

                    <button
                      type="button"
                      disabled={!rejectionReason.trim()}
                      className="catequesis-admin__apply-reject"
                      onClick={() => rejectSolicitud(selectedSolicitud.id)}
                    >
                      Aplicar rechazo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ModalSimple>
      )}
    </section>
  );
}

export default GestionSolicitudesCatequesis;
