import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  Search,
  XCircle,
  AlertCircle,
  GraduationCap,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import ModalSimple from "../ModalSimple/ModalSimple";
import { AdminRecordCard } from "../../../../shared/components/admin/AdminRecordCard";
import { obtenerEtiquetaNivelCatequesis } from "../../../catequesis/constants/nivelesCatequesis";
import { FILIALES_CATEQUESIS } from "../../../catequesis/constants/filialesCatequesis";
import { useSolicitudesCatequesis } from "../hooks/useSolicitudesCatequesis";
import type {
  CatequesisEnrollmentRecord,
  EstadoInscripcionCatequesis,
} from "../Types/catequesis";

import "./GestionSolicitudesCatequesis.css";
import { resolveUploadedFileUrl } from "../../../../utils/files";

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
  const { solicitudes, cambiarEstado, obtenerDetalle, exportarExcel, cargando, guardando, exportando, error, detalleError, accionError, exportError, limpiarDetalleError, limpiarAccionError, limpiarExportError } =
    useSolicitudesCatequesis();

  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | EstadoInscripcionCatequesis
  >("todos");
  const [filtroFilial, setFiltroFilial] = useState<string>("todas");
  const [filtroEstadoAplicado, setFiltroEstadoAplicado] = useState<
    "todos" | EstadoInscripcionCatequesis
  >("todos");
  const [filtroFilialAplicado, setFiltroFilialAplicado] = useState<string>("todas");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<CatequesisEnrollmentRecord | null>(null);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const estadoSeleccionado = normalizarEstado(selectedSolicitud?.estado);

  const aplicarFiltros = () => {
    setFiltroEstadoAplicado(filtroEstado);
    setFiltroFilialAplicado(filtroFilial);
  };

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
      const filial = solicitud.catequesis?.centroCatequesis ?? "";

      const matchesStatus =
        filtroEstadoAplicado === "todos" ||
        estadoNormalizado === filtroEstadoAplicado;

      const matchesFilial =
        filtroFilialAplicado === "todas" ||
        filial.localeCompare(filtroFilialAplicado, "es", {
          sensitivity: "accent",
        }) === 0;

      const matchesSearch =
        nombreCatequizando.includes(search) ||
        nombreEncargado.includes(search) ||
        codigoSolicitud.toLowerCase().includes(search) ||
        telefono.toLowerCase().includes(search) ||
        filial.toLowerCase().includes(search);

      return matchesStatus && matchesFilial && matchesSearch;
    });
  }, [
    solicitudes,
    filtroEstadoAplicado,
    filtroFilialAplicado,
    searchQuery,
  ]);

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
    limpiarDetalleError();
    limpiarAccionError();
  }, [limpiarDetalleError, limpiarAccionError]);

  const openModal = useCallback(async (solicitud: CatequesisEnrollmentRecord) => {
    const detalle = await obtenerDetalle(solicitud.id);
    setSelectedSolicitud(detalle ?? solicitud);
    setIsRejecting(false);
    setRejectionReason("");
  }, [obtenerDetalle]);

  const approveSolicitud = useCallback(
    async (id: number) => {
      const response = await cambiarEstado(
        id,
        "aprobado",
        "Solicitud aprobada por administración.",
      );

      if (response) {
        closeModal();
      }
    },
    [cambiarEstado, closeModal],
  );

  const rejectSolicitud = useCallback(
    async (id: number) => {
      if (!rejectionReason.trim()) return;

      const response = await cambiarEstado(
        id,
        "rechazado",
        rejectionReason.trim(),
      );

      if (response) {
        closeModal();
      }
    },
    [cambiarEstado, rejectionReason, closeModal],
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
            {obtenerEtiquetaNivelCatequesis(row.original.catequesis?.nivelAInscribirse)}
          </span>
        ),
      },
      {
        id: "filial",
        header: "Filial",
        cell: ({ row }) => (
          <span className="catequesis-admin__filial">
            {row.original.catequesis?.centroCatequesis || "No registrada"}
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

  if (error && solicitudes.length === 0) {
    return (
      <section className="catequesis-admin">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="catequesis-admin admin-module">
      {guardando && (
        <p className="catequesis-admin__saving" role="status">
          Guardando cambios...
        </p>
      )}

      {error && (
        <p className="catequesis-admin__inline-error" role="alert">
          {error}
        </p>
      )}

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

      <div className="catequesis-admin__filters admin-toolbar">
        <div className="catequesis-admin__search admin-toolbar__search">
          <Search size={17} className="admin-toolbar__search-icon" />
          <input
            type="search"
            className="admin-search"
            value={searchQuery}
            placeholder="Buscar por catequizando, encargado, teléfono o código..."
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar matrículas de catequesis"
          />
        </div>

        <div className="catequesis-admin__filter-form">
          <label className="catequesis-admin__filter-field">
            <span>Estado</span>
            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value as "todos" | EstadoInscripcionCatequesis,
                )
              }
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="requiere_modificacion">Requiere modificación</option>
            </select>
          </label>

          <label className="catequesis-admin__filter-field">
            <span>Filial</span>
            <select
              value={filtroFilial}
              onChange={(e) => setFiltroFilial(e.target.value)}
            >
              <option value="todas">Todas</option>
              {FILIALES_CATEQUESIS.map((filial) => (
                <option key={filial} value={filial}>
                  {filial}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="catequesis-admin__apply-filter-btn"
            onClick={aplicarFiltros}
          >
            Filtrar
          </button>

          <button
            type="button"
            className="catequesis-admin__filter-btn catequesis-admin__export-btn"
            onClick={() => {
              limpiarExportError();
              void exportarExcel();
            }}
            disabled={exportando || cargando}
          >
            <Download size={16} />
            {exportando ? "Exportando..." : "Exportar a Excel"}
          </button>
        </div>
      </div>

      {exportError && (
        <p role="alert" className="catequesis-admin__inline-error">
          {exportError}
        </p>
      )}

      <div className="catequesis-admin__table-card admin-table-panel">
        <div className="admin-responsive-data">
          <div className="admin-responsive-data__table catequesis-admin__table-wrapper">
          <table className="admin-table catequesis-admin__table">
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
                    colSpan={8}
                    className="catequesis-admin__empty"
                  >
                    No se encontraron matrículas con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          <div className="admin-responsive-data__cards">
            {filteredSolicitudes.map((solicitud) => {
              const nombre = `${solicitud.catequizando?.nombre ?? "Sin nombre"} ${solicitud.catequizando?.apellidos ?? ""}`.trim();
              const codigo = solicitud.codigoSolicitud || `CAT-${solicitud.id}`;
              const encargado = `${solicitud.encargado?.nombre ?? ""} ${solicitud.encargado?.apellidos ?? ""}`.trim() || "Sin encargado";
              const nivel = obtenerEtiquetaNivelCatequesis(
                solicitud.catequesis?.nivelAInscribirse,
              );
              const filial =
                solicitud.catequesis?.centroCatequesis || "No registrada";

              return (
                <AdminRecordCard
                  key={solicitud.id}
                  icon={<GraduationCap size={20} />}
                  accent="#0f766e"
                  code={codigo}
                  title={nombre}
                  subtitle={nivel}
                  badges={
                    <span
                      className={`catequesis-admin__badge catequesis-admin__badge--${obtenerClaseEstado(
                        solicitud.estado,
                      )}`}
                    >
                      {obtenerTextoEstado(solicitud.estado)}
                    </span>
                  }
                  meta={[
                    {
                      icon: <MapPin size={12} />,
                      label: "Filial",
                      value: filial,
                    },
                    {
                      icon: <Calendar size={12} />,
                      label: "Fecha",
                      value: solicitud.fechaSolicitud || "No registrada",
                    },
                    {
                      icon: <Phone size={12} />,
                      label: "Encargado",
                      value: encargado,
                    },
                  ]}
                  actions={[
                    {
                      label: "Revisar expediente",
                      icon: <Eye size={15} />,
                      variant: "primary",
                      onClick: () => openModal(solicitud),
                    },
                  ]}
                />
              );
            })}
          </div>
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
            {detalleError && (
              <p className="catequesis-admin__inline-error" role="alert">
                {detalleError}
              </p>
            )}

            {accionError && (
              <p className="catequesis-admin__inline-error" role="alert">
                {accionError}
              </p>
            )}

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
                    {obtenerEtiquetaNivelCatequesis(
                      selectedSolicitud.catequesis?.nivelAInscribirse,
                    )}
                  </strong>
                </div>

                <div>
                  <span>Fe de bautismo</span>
                  <strong>
                    {selectedSolicitud.catequesis?.feBautismoArchivo ? (
                      <a
                        href={
                          resolveUploadedFileUrl(
                            String(selectedSolicitud.catequesis.feBautismoArchivo),
                          ) ?? "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver archivo
                      </a>
                    ) : (
                      "No adjuntado"
                    )}
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
              <h3>Datos de la Madre o Encargada</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando?.nombre || "No registrado"}{" "}
                    {selectedSolicitud.madreCatequizando?.apellidos || ""}
                  </strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando?.telefono ||
                      "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Ciudad</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando?.direccion?.ciudad ||
                      "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Provincia</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando?.direccion?.provincia ||
                      "No registrada"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando?.direccion
                      ?.direccionExacta || "No registrada"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Datos del Padre</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {selectedSolicitud.padreCatequizando?.nombre || "No registrado"}{" "}
                    {selectedSolicitud.padreCatequizando?.apellidos || ""}
                  </strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>
                    {selectedSolicitud.padreCatequizando?.telefono ||
                      "No registrado"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="catequesis-admin__section">
              <h3>Persona que Inscribe</h3>

              <div className="catequesis-admin__details-grid">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {selectedSolicitud.personaInscribe?.nombre || "No registrado"}{" "}
                    {selectedSolicitud.personaInscribe?.apellidos || ""}
                  </strong>
                </div>

                <div>
                  <span>Parentesco</span>
                  <strong>
                    {selectedSolicitud.personaInscribe?.parentesco ||
                      "No registrado"}
                  </strong>
                </div>

                <div className="catequesis-admin__grid-full">
                  <span>Correo electrónico</span>
                  <strong>
                    {selectedSolicitud.personaInscribe?.correo ||
                      "No registrado"}
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
                    {selectedSolicitud.pago?.comprobanteArchivo ? (
                      <a
                        href={
                          resolveUploadedFileUrl(
                            String(selectedSolicitud.pago.comprobanteArchivo),
                          ) ?? "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver archivo
                      </a>
                    ) : (
                      "No adjuntado"
                    )}
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
