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
import { useSolicitudesCatequesis } from "../hooks/useSolicitudesCatequesis";
import type {
  CatequesisEnrollmentRecord,
  EstadoInscripcionCatequesis,
} from "../Types/catequesis";

import "./GestionSolicitudesCatequesis.css";

const normalizarEstado = (
  estado?: string | null,
): EstadoInscripcionCatequesis => {
  const estadoLower = estado?.toLowerCase().trim();

  if (estadoLower === "pendiente") return "pendiente";
  if (estadoLower === "aprobado" || estadoLower === "aprobada")
    return "aprobado";
  if (estadoLower === "rechazado" || estadoLower === "rechazada")
    return "rechazado";
  if (estadoLower === "requiere_modificacion") return "requiere_modificacion";

  return "pendiente";
};

const obtenerTextoEstado = (estado?: string | null) => {
  const estadoNormalizado = normalizarEstado(estado);

  switch (estadoNormalizado) {
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

const obtenerClaseEstado = (estado?: string | null) => {
  const estadoNormalizado = normalizarEstado(estado);

  switch (estadoNormalizado) {
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
  const { solicitudes, guardarSolicitudes, cargando, guardando, error } =
    useSolicitudesCatequesis();

  const [statusFilter, setStatusFilter] = useState<
    "todos" | EstadoInscripcionCatequesis
  >("todos");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<CatequesisEnrollmentRecord | null>(null);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const estadoSeleccionado = normalizarEstado(selectedSolicitud?.estado);

  const filteredSolicitudes = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();

    return solicitudes.filter((solicitud) => {
      const nombreCatequizando = `${
        solicitud.catequizando?.nombre ?? ""
      } ${solicitud.catequizando?.apellidos ?? ""}`.toLowerCase();

      const nombreEncargado = `${
        solicitud.encargado?.nombre ?? ""
      } ${solicitud.encargado?.apellidos ?? ""}`.toLowerCase();

      const telefono = solicitud.encargado?.telefono ?? "";
      const codigoSolicitud = solicitud.codigoSolicitud ?? "";
      const estadoNormalizado = normalizarEstado(solicitud.estado);

      const matchesStatus =
        statusFilter === "todos" || estadoNormalizado === statusFilter;

      const matchesSearch =
        nombreCatequizando.includes(search) ||
        nombreEncargado.includes(search) ||
        codigoSolicitud.toLowerCase().includes(search) ||
        telefono.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [solicitudes, statusFilter, searchQuery]);

  const totalPendientes = useMemo(
    () =>
      solicitudes.filter(
        (item) => normalizarEstado(item.estado) === "pendiente",
      ).length,
    [solicitudes],
  );

  const totalAprobadas = useMemo(
    () =>
      solicitudes.filter((item) => normalizarEstado(item.estado) === "aprobado")
        .length,
    [solicitudes],
  );

  const totalRechazadas = useMemo(
    () =>
      solicitudes.filter(
        (item) => normalizarEstado(item.estado) === "rechazado",
      ).length,
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
    async (id: number) => {
      const nuevasSolicitudes = solicitudes.map((solicitud) =>
        solicitud.id === id
          ? {
              ...solicitud,
              estado: "aprobado" as EstadoInscripcionCatequesis,
              observacionAdministrativa:
                "Solicitud aprobada por administración.",
              updated_at: new Date().toISOString(),
            }
          : solicitud,
      );

      await guardarSolicitudes(nuevasSolicitudes);
      closeModal();
    },
    [solicitudes, guardarSolicitudes, closeModal],
  );

  const rejectSolicitud = useCallback(
    async (id: number) => {
      if (!rejectionReason.trim()) return;

      const nuevasSolicitudes = solicitudes.map((solicitud) =>
        solicitud.id === id
          ? {
              ...solicitud,
              estado: "rechazado" as EstadoInscripcionCatequesis,
              observacionAdministrativa: rejectionReason.trim(),
              updated_at: new Date().toISOString(),
            }
          : solicitud,
      );

      await guardarSolicitudes(nuevasSolicitudes);
      closeModal();
    },
    [solicitudes, guardarSolicitudes, rejectionReason, closeModal],
  );

  const columns = useMemo<ColumnDef<CatequesisEnrollmentRecord>[]>(
    () => [
      {
        accessorKey: "codigoSolicitud",
        header: "ID",
        cell: ({ row }) => (
          <span className="catequesis-admin__id">
            {row.original.codigoSolicitud || `CAT-${row.original.id}`}
          </span>
        ),
      },
      {
        id: "catequizando",
        header: "Catequizando",
        cell: ({ row }) => (
          <div className="catequesis-admin__student">
            <strong>
              {row.original.catequizando?.nombre || "Sin nombre"}{" "}
              {row.original.catequizando?.apellidos || ""}
            </strong>
            <span>
              Nacimiento:{" "}
              {row.original.catequizando?.fechaNacimiento || "No registrada"}
            </span>
          </div>
        ),
      },
      {
        id: "nivel",
        header: "Nivel",
        cell: ({ row }) => (
          <span className="catequesis-admin__level">
            {row.original.catequesis?.nivelAInscribirse || "No registrado"}
          </span>
        ),
      },
      {
        id: "encargado",
        header: "Encargado / Teléfono",
        cell: ({ row }) => (
          <div className="catequesis-admin__parent">
            <strong>
              {row.original.encargado?.nombre || "Sin nombre"}{" "}
              {row.original.encargado?.apellidos || ""}
            </strong>
            <span>{row.original.encargado?.telefono || "No registrado"}</span>
          </div>
        ),
      },
      {
        accessorKey: "fechaSolicitud",
        header: "Fecha",
        cell: ({ row }) => (
          <span>{row.original.fechaSolicitud || "No registrada"}</span>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <span
            className={`catequesis-admin__badge catequesis-admin__badge--${obtenerClaseEstado(
              row.original.estado,
            )}`}
          >
            {obtenerTextoEstado(row.original.estado)}
          </span>
        ),
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

  if (cargando) {
    return (
      <section className="catequesis-admin">
        <p>Cargando solicitudes de catequesis...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="catequesis-admin">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="catequesis-admin">
      <div className="catequesis-admin__top">
        <div>
          <h1>Matrículas de Catequesis</h1>
          <p>
            Autorice y controle las inscripciones enviadas por los encargados.
          </p>
        </div>

        {guardando && (
          <span className="catequesis-admin__saving">Guardando cambios...</span>
        )}
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
            placeholder="Buscar por catequizando, encargado, teléfono o código..."
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
                Expediente de{" "}
                {selectedSolicitud.catequizando?.nombre || "Sin nombre"}{" "}
                {selectedSolicitud.catequizando?.apellidos || ""}
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
                    {selectedSolicitud.catequesis?.centroCatequesis ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Nivel a inscribirse</span>
                  <strong>
                    {selectedSolicitud.catequesis?.nivelAInscribirse ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Fe de bautismo</span>
                  <strong>
                    {selectedSolicitud.catequesis?.feBautismoArchivo
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
                    {selectedSolicitud.catequizando?.nombre || "No registrado"}{" "}
                    {selectedSolicitud.catequizando?.apellidos || ""}
                  </strong>
                </div>

                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>
                    {selectedSolicitud.catequizando?.fechaNacimiento ||
                      "No registrada"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.catequizando?.direccion
                      ?.direccionExacta || "No registrada"}
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
                    {selectedSolicitud.catequizando?.bautismo?.parroquia ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Fecha de bautismo</span>
                  <strong>
                    {selectedSolicitud.catequizando?.bautismo?.fecha ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Tomo</span>
                  <strong>
                    {selectedSolicitud.catequizando?.bautismo?.tomo ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Folio</span>
                  <strong>
                    {selectedSolicitud.catequizando?.bautismo?.folio ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Asiento</span>
                  <strong>
                    {selectedSolicitud.catequizando?.bautismo?.asiento ||
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
                    {selectedSolicitud.catequizando?.adecuacion
                      ?.requiereAdecuacionCentroEducativo
                      ? "Sí"
                      : "No"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Descripción</span>
                  <strong>
                    {selectedSolicitud.catequizando?.adecuacion
                      ?.descripcionAdecuacion || "No aplica"}
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
                    {selectedSolicitud.catequizando?.condicionSalud
                      ?.portadorEnfermedadCronica
                      ? "Sí"
                      : "No"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Descripción</span>
                  <strong>
                    {selectedSolicitud.catequizando?.condicionSalud
                      ?.descripcionEnfermedad || "No aplica"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos del Encargado</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {selectedSolicitud.encargado?.nombre || "No registrado"}{" "}
                    {selectedSolicitud.encargado?.apellidos || ""}
                  </strong>
                </div>

                <div>
                  <span>Cédula</span>
                  <strong>
                    {selectedSolicitud.encargado?.cedula || "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>
                    {selectedSolicitud.encargado?.telefono || "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Correo</span>
                  <strong>
                    {selectedSolicitud.encargado?.correo || "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Parentesco</span>
                  <strong>
                    {selectedSolicitud.encargado?.parentesco || "No registrado"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.encargado?.direccion?.direccionExacta ||
                      "No registrada"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos de Pago</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Método de pago</span>
                  <strong>
                    {selectedSolicitud.pago?.metodoPago || "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Número comprobante</span>
                  <strong>
                    {selectedSolicitud.pago?.numeroComprobante ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Monto</span>
                  <strong>
                    {selectedSolicitud.pago?.monto
                      ? `₡${selectedSolicitud.pago.monto}`
                      : "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Comprobante de pago</span>
                  <strong>
                    {selectedSolicitud.pago?.comprobanteArchivo
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
                  <strong>
                    {selectedSolicitud.codigoSolicitud ||
                      `CAT-${selectedSolicitud.id}`}
                  </strong>
                </div>

                <div>
                  <span>Estado actual</span>
                  <strong>
                    {obtenerTextoEstado(selectedSolicitud.estado)}
                  </strong>
                </div>

                <div>
                  <span>Fecha de solicitud</span>
                  <strong>
                    {selectedSolicitud.fechaSolicitud || "No registrada"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Observación administrativa</span>
                  <strong>
                    {selectedSolicitud.observacionAdministrativa ||
                      selectedSolicitud.observaciones ||
                      "Sin observaciones administrativas"}
                  </strong>
                </div>
              </div>
            </div>

            {estadoSeleccionado === "aprobado" && (
              <div className="catequesis-admin__message catequesis-admin__message--approved">
                <CheckCircle size={17} />
                <p>
                  La inscripción ya fue aprobada e integrada al proceso de
                  catequesis.
                </p>
              </div>
            )}

            {estadoSeleccionado === "rechazado" && (
              <div className="catequesis-admin__message catequesis-admin__message--rejected">
                <XCircle size={17} />
                <div>
                  <strong>Solicitud rechazada.</strong>
                  <p>
                    Motivo:{" "}
                    {selectedSolicitud.observacionAdministrativa ||
                      selectedSolicitud.observaciones ||
                      "No se especificó motivo."}
                  </p>
                </div>
              </div>
            )}

            {estadoSeleccionado === "requiere_modificacion" && (
              <div className="catequesis-admin__message catequesis-admin__message--modification">
                <AlertCircle size={17} />
                <div>
                  <strong>Requiere modificación.</strong>
                  <p>
                    {selectedSolicitud.observacionAdministrativa ||
                      selectedSolicitud.observaciones ||
                      "La solicitud requiere correcciones por parte del encargado."}
                  </p>
                </div>
              </div>
            )}

            {estadoSeleccionado === "pendiente" && (
              <div className="catequesis-admin__actions-area">
                {!isRejecting ? (
                  <div className="catequesis-admin__modal-actions">
                    <button
                      type="button"
                      className="catequesis-admin__approve"
                      disabled={guardando}
                      onClick={() => approveSolicitud(selectedSolicitud.id)}
                    >
                      Aprobar inscripción
                    </button>

                    <button
                      type="button"
                      className="catequesis-admin__reject"
                      disabled={guardando}
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
                      disabled={!rejectionReason.trim() || guardando}
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
