import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
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

import { resolveUploadedFileUrl } from "../../../../utils/files";
import {
  AdminModule,
  AdminSearch,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  AdminToolbar,
  Badge,
  type BadgeVariant,
  Button,
  ErrorMessage,
  Label,
  Select,
  Textarea,
} from "../../../../shared/ui";

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

const getEstadoBadgeVariant = (estado?: string | null): BadgeVariant => {
  const estadoNormalizado = normalizarEstado(estado);

  switch (estadoNormalizado) {
    case "aprobado":
      return "success";
    case "rechazado":
      return "danger";
    case "requiere_modificacion":
      return "info";
    default:
      return "warning";
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
          <span className="font-mono font-extrabold text-slate-500">
            {row.original.codigoSolicitud || `CAT-${row.original.id}`}
          </span>
        ),
      },
      {
        id: "catequizando",
        header: "Catequizando",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <strong className="font-heading text-sm text-royal-blue">
              {row.original.catequizando?.nombre || "Sin nombre"}{" "}
              {row.original.catequizando?.apellidos || ""}
            </strong>
            <span className="text-xs font-semibold text-slate-400">
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
          <span className="font-extrabold text-slate-700">
            {obtenerEtiquetaNivelCatequesis(row.original.catequesis?.nivelAInscribirse)}
          </span>
        ),
      },
      {
        id: "filial",
        header: "Filial",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-royal-blue">
            {row.original.catequesis?.centroCatequesis || "No registrada"}
          </span>
        ),
      },
      {
        id: "encargado",
        header: "Encargado / Teléfono",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <strong className="text-slate-700">
              {row.original.encargado?.nombre || "Sin nombre"}{" "}
              {row.original.encargado?.apellidos || ""}
            </strong>
            <span className="text-xs font-semibold text-slate-400">
              {row.original.encargado?.telefono || "No registrado"}
            </span>
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
          <Badge variant={getEstadoBadgeVariant(row.original.estado)}>
            {obtenerTextoEstado(row.original.estado)}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <Button
            variant="outline"
            className="min-h-9 bg-slate-50 px-3 py-2 text-xs uppercase"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openModal(row.original);
            }}
          >
            <Eye size={14} />
            Revisar expediente
          </Button>
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
      <AdminModule>
        <p className="text-sm text-text-muted">Cargando solicitudes de catequesis...</p>
      </AdminModule>
    );
  }

  if (error && solicitudes.length === 0) {
    return (
      <AdminModule>
        <ErrorMessage message={error} />
      </AdminModule>
    );
  }

  return (
    <AdminModule className="gap-6">
      {guardando && (
        <p
          className="rounded-xl bg-info-bg px-3.5 py-2.5 text-sm font-semibold text-info"
          role="status"
        >
          Guardando cambios...
        </p>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="flex items-center justify-between rounded-3xl border border-slate-100 bg-surface p-5 shadow-sm">
          <div>
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Total pendientes
            </span>
            <strong className="mt-1.5 block font-heading text-3xl text-royal-blue">
              {totalPendientes}
            </strong>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
        </article>

        <article className="flex items-center justify-between rounded-3xl border border-slate-100 bg-surface p-5 shadow-sm">
          <div>
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Matrículas aprobadas
            </span>
            <strong className="mt-1.5 block font-heading text-3xl text-royal-blue">
              {totalAprobadas}
            </strong>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success-bg text-emerald-600">
            <CheckCircle size={22} />
          </div>
        </article>

        <article className="flex items-center justify-between rounded-3xl border border-slate-100 bg-surface p-5 shadow-sm">
          <div>
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Matrículas rechazadas
            </span>
            <strong className="mt-1.5 block font-heading text-3xl text-royal-blue">
              {totalRechazadas}
            </strong>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-danger-bg text-red-600">
            <XCircle size={22} />
          </div>
        </article>
      </div>

      <AdminToolbar className="flex-col items-stretch">
        <AdminSearch
          value={searchQuery}
          placeholder="Buscar por catequizando, encargado, teléfono o código..."
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar matrículas de catequesis"
        />

        <div className="flex flex-wrap items-end gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-2.5">
          <div className="flex min-w-40 flex-col gap-1.5">
            <Label className="mb-0 text-[10px] font-black tracking-wide text-slate-400 uppercase">
              Estado
            </Label>
            <Select
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
            </Select>
          </div>

          <div className="flex min-w-40 flex-col gap-1.5">
            <Label className="mb-0 text-[10px] font-black tracking-wide text-slate-400 uppercase">
              Filial
            </Label>
            <Select
              value={filtroFilial}
              onChange={(e) => setFiltroFilial(e.target.value)}
            >
              <option value="todas">Todas</option>
              {FILIALES_CATEQUESIS.map((filial) => (
                <option key={filial} value={filial}>
                  {filial}
                </option>
              ))}
            </Select>
          </div>

          <Button variant="royal" onClick={aplicarFiltros}>
            Filtrar
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              limpiarExportError();
              void exportarExcel();
            }}
            disabled={exportando || cargando}
          >
            <Download size={16} />
            {exportando ? "Exportando..." : "Exportar a Excel"}
          </Button>
        </div>
      </AdminToolbar>

      {exportError && <ErrorMessage message={exportError} />}

      <AdminTablePanel>
        <div className="hidden overflow-x-auto md:block">
          <AdminTable className="min-w-[980px] text-xs">
            <AdminTableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <AdminTableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <AdminTableHeaderCell key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </AdminTableHeaderCell>
                  ))}
                </AdminTableRow>
              ))}
            </AdminTableHead>

            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <AdminTableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <AdminTableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </AdminTableCell>
                    ))}
                  </AdminTableRow>
                ))
              ) : (
                <AdminTableRow>
                  <AdminTableCell
                    colSpan={8}
                    className="py-12 text-center font-heading text-base text-slate-400 italic"
                  >
                    No se encontraron matrículas con los filtros actuales.
                  </AdminTableCell>
                </AdminTableRow>
              )}
            </tbody>
          </AdminTable>
        </div>

        <div className="flex flex-col gap-2.5 p-2 md:hidden">
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
                    <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
                      {obtenerTextoEstado(solicitud.estado)}
                    </Badge>
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
      </AdminTablePanel>

      {selectedSolicitud && (
        <ModalSimple onClose={closeModal}>
          <div className="mb-6 flex items-start justify-between gap-5 border-b border-slate-100 pb-5">
            <div>
              <span className="inline-block rounded-lg bg-royal-blue/5 px-2.5 py-1.5 text-[10px] font-black tracking-widest text-royal-blue uppercase">
                Matrícula Catequesis
              </span>
              <h2 className="mt-2.5 font-heading text-2xl text-royal-blue">
                Expediente de{" "}
                {selectedSolicitud.catequizando?.nombre || "Sin nombre"}{" "}
                {selectedSolicitud.catequizando?.apellidos || ""}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {detalleError && <ErrorMessage message={detalleError} />}
            {accionError && <ErrorMessage message={accionError} />}

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Información de Catequesis</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Datos del Catequizando</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

                <div className="col-span-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.catequizando?.direccion
                      ?.direccionExacta || "No registrada"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Datos de Bautismo</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Adecuación Educativa</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
                <div>
                  <span>¿Requiere adecuación?</span>
                  <strong>
                    {selectedSolicitud.catequizando?.adecuacion
                      ?.requiereAdecuacionCentroEducativo
                      ? "Sí"
                      : "No"}
                  </strong>
                </div>

                <div className="col-span-full">
                  <span>Descripción</span>
                  <strong>
                    {selectedSolicitud.catequizando?.adecuacion
                      ?.descripcionAdecuacion || "No aplica"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Condición de Salud</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
                <div>
                  <span>¿Porta enfermedad crónica?</span>
                  <strong>
                    {selectedSolicitud.catequizando?.condicionSalud
                      ?.portadorEnfermedadCronica
                      ? "Sí"
                      : "No"}
                  </strong>
                </div>

                <div className="col-span-full">
                  <span>Descripción</span>
                  <strong>
                    {selectedSolicitud.catequizando?.condicionSalud
                      ?.descripcionEnfermedad || "No aplica"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Datos de la Madre o Encargada</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

                <div className="col-span-full">
                  <span>Dirección exacta</span>
                  <strong>
                    {selectedSolicitud.madreCatequizando?.direccion
                      ?.direccionExacta || "No registrada"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Datos del Padre</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Persona que Inscribe</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

                <div className="col-span-full">
                  <span>Correo electrónico</span>
                  <strong>
                    {selectedSolicitud.personaInscribe?.correo ||
                      "No registrado"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Datos de Pago</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

            <div className="flex flex-col gap-3.5">
              <h3 className="m-0 border-b border-slate-100 pb-2 text-sm font-black tracking-wide text-royal-blue uppercase">Gestión Administrativa</h3>

              <div className="grid grid-cols-1 gap-3.5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 [&_span]:mb-1 [&_span]:block [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-wide [&_span]:text-slate-400 [&_span]:uppercase [&_strong]:text-sm [&_strong]:text-slate-700">
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

                <div className="col-span-full">
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
              <div className="flex gap-2.5 rounded-2xl border border-emerald-300 bg-success-bg p-4 text-sm leading-relaxed text-success">
                <CheckCircle size={17} />
                <p className="m-0 mt-1">
                  La inscripción ya fue aprobada e integrada al proceso de
                  catequesis.
                </p>
              </div>
            )}

            {estadoSeleccionado === "rechazado" && (
              <div className="flex gap-2.5 rounded-2xl border border-red-300 bg-danger-bg p-4 text-sm leading-relaxed text-danger">
                <XCircle size={17} />
                <div>
                  <strong>Solicitud rechazada.</strong>
                  <p className="mt-1 mb-0">
                    Motivo:{" "}
                    {selectedSolicitud.observacionAdministrativa ||
                      selectedSolicitud.observaciones ||
                      "No se especificó motivo."}
                  </p>
                </div>
              </div>
            )}

            {estadoSeleccionado === "requiere_modificacion" && (
              <div className="flex gap-2.5 rounded-2xl border border-blue-300 bg-info-bg p-4 text-sm leading-relaxed text-info">
                <AlertCircle size={17} />
                <div>
                  <strong>Requiere modificación.</strong>
                  <p className="mt-1 mb-0">
                    {selectedSolicitud.observacionAdministrativa ||
                      selectedSolicitud.observaciones ||
                      "La solicitud requiere correcciones por parte del encargado."}
                  </p>
                </div>
              </div>
            )}

            {estadoSeleccionado === "pendiente" && (
              <div className="border-t border-slate-100 pt-5">
                {!isRejecting ? (
                  <div className="flex flex-col gap-3.5 sm:flex-row">
                    <Button
                      variant="primary"
                      className="flex-1 uppercase"
                      disabled={guardando}
                      onClick={() => approveSolicitud(selectedSolicitud.id)}
                    >
                      Aprobar inscripción
                    </Button>

                    <Button
                      variant="danger"
                      className="bg-danger-bg text-danger hover:bg-red-100"
                      disabled={guardando}
                      onClick={() => setIsRejecting(true)}
                    >
                      Rechazar inscripción
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-red-300 bg-danger-bg/65 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm text-red-800">
                      <strong>Indique el motivo del rechazo</strong>

                      <button
                        type="button"
                        className="cursor-pointer border-0 bg-transparent text-xs font-black text-slate-500 uppercase"
                        onClick={() => {
                          setIsRejecting(false);
                          setRejectionReason("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>

                    <Textarea
                      rows={4}
                      value={rejectionReason}
                      placeholder="Ej: Falta documento de fe de bautismo, comprobante SINPE inválido o datos incompletos."
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mb-3 border-red-300"
                    />

                    <Button
                      variant="danger"
                      className="w-full uppercase"
                      disabled={!rejectionReason.trim() || guardando}
                      onClick={() => rejectSolicitud(selectedSolicitud.id)}
                    >
                      Aplicar rechazo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ModalSimple>
      )}
    </AdminModule>
  );
}

export default GestionSolicitudesCatequesis;
