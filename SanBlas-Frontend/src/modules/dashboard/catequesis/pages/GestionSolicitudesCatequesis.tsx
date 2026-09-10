import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Inbox,
  Loader2,
  RotateCcw,
  XCircle,
  GraduationCap,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DetalleSolicitudCatequesisModal } from "../components/DetalleSolicitudCatequesisModal";
import { AdminRecordCard } from "../../../../shared/components/admin/AdminRecordCard";
import { obtenerEtiquetaNivelCatequesis } from "../../../catequesis/constants/nivelesCatequesis";
import { FILIALES_CATEQUESIS } from "../../../catequesis/constants/filialesCatequesis";
import { useSolicitudesCatequesis } from "../hooks/useSolicitudesCatequesis";
import {
  obtenerHistorialCatequesis,
  type HistorialInscripcionCatequesis,
} from "../services/catequesisService";
import { ApiError } from "../../../../services/apiClient";
import type {
  CatequesisEnrollmentRecord,
  EstadoInscripcionCatequesis,
} from "../Types/catequesis";

import { usePagination } from "../../../../shared/hooks/usePagination";
import {
  AdminModule,
  AdminPagination,
  AdminPaginationButton,
  AdminSearch,
  AdminTable,
  AdminTableCell,
  AdminTableFooter,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  AdminToolbar,
  Badge,
  type BadgeVariant,
  Button,
  ConfirmacionAccionModal,
  EmptyState,
  ErrorMessage,
  Label,
  LineaDoradaTitulo,
  Modal,
  Select,
  Textarea,
  useToast,
} from "../../../../shared/ui";

const rangoFechasValido = (desde: string, hasta: string): boolean => {
  if (!desde || !hasta) return true;
  return (
    new Date(`${desde}T00:00:00`).getTime() <=
    new Date(`${hasta}T00:00:00`).getTime()
  );
};

const formatearFecha = (fechaStr: string) => {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const TAMANOS_PAGINA = [7, 10, 25] as const;

const handleSoloLetrasNombre = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").slice(0, 30);

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
  const {
    solicitudes,
    cambiarEstado,
    obtenerDetalle,
    exportarExcel,
    cargando,
    guardando,
    exportando,
    error,
    detalleError,
    accionError,
    exportError,
    limpiarDetalleError,
    limpiarAccionError,
    limpiarExportError,
  } = useSolicitudesCatequesis();
  const { showToast } = useToast();

  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | EstadoInscripcionCatequesis
  >("todos");
  const [filtroFilial, setFiltroFilial] = useState<string>("todas");
  const [filtroEstadoAplicado, setFiltroEstadoAplicado] = useState<
    "todos" | EstadoInscripcionCatequesis
  >("todos");
  const [filtroFilialAplicado, setFiltroFilialAplicado] =
    useState<string>("todas");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<CatequesisEnrollmentRecord | null>(null);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [vista, setVista] = useState<"solicitudes" | "historial">(
    "solicitudes",
  );
  const [historial, setHistorial] = useState<
    HistorialInscripcionCatequesis[]
  >([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [historialError, setHistorialError] = useState<string | null>(null);
  const [historialPagina, setHistorialPagina] = useState(1);
  const [historialRegistrosPorPagina, setHistorialRegistrosPorPagina] =
    useState(7);
  const [historialSeleccionada, setHistorialSeleccionada] =
    useState<HistorialInscripcionCatequesis | null>(null);
  const [historialNombreInput, setHistorialNombreInput] = useState("");
  const [historialFilialInput, setHistorialFilialInput] = useState("");
  const [historialFiltros, setHistorialFiltros] = useState({
    nombre: "",
    filial: "",
  });
  const [tipoFiltro, setTipoFiltro] = useState<
    "todos" | "aprobado" | "rechazado"
  >("todos");
  const [historialFechaDesde, setHistorialFechaDesde] = useState("");
  const [historialFechaHasta, setHistorialFechaHasta] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistorialFiltros({
        nombre: historialNombreInput.trim(),
        filial: historialFilialInput.trim(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [historialNombreInput, historialFilialInput]);

  useEffect(() => {
    if (vista !== "historial") return;

    let activo = true;
    setHistorialCargando(true);
    setHistorialError(null);

    obtenerHistorialCatequesis()
      .then((respuesta) => {
        if (!activo) return;
        setHistorial(respuesta.historial);
        setHistorialPagina(1);
      })
      .catch((e: unknown) => {
        if (!activo) return;
        setHistorialError(
          e instanceof ApiError
            ? e.message
            : "No se pudo cargar el historial de catequesis.",
        );
      })
      .finally(() => {
        if (activo) setHistorialCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [vista]);

  useEffect(() => {
    setHistorialPagina(1);
  }, [
    historialFiltros,
    historialRegistrosPorPagina,
    tipoFiltro,
    historialFechaDesde,
    historialFechaHasta,
  ]);

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

      if (
        estadoNormalizado !== "pendiente" &&
        estadoNormalizado !== "requiere_modificacion"
      ) {
        return false;
      }

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
  }, [solicitudes, filtroEstadoAplicado, filtroFilialAplicado, searchQuery]);

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
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
    setIsConfirmRejectOpen(false);
    setRejectionReason("");
    limpiarDetalleError();
    limpiarAccionError();
  }, [limpiarDetalleError, limpiarAccionError]);

  const openModal = useCallback(
    async (solicitud: CatequesisEnrollmentRecord) => {
      const detalle = await obtenerDetalle(solicitud.id);
      setSelectedSolicitud(detalle ?? solicitud);
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setIsConfirmRejectOpen(false);
      setRejectionReason("");
    },
    [obtenerDetalle],
  );

  const cerrarRechazo = useCallback(() => {
    setIsRejectModalOpen(false);
    setIsConfirmRejectOpen(false);
    setRejectionReason("");
  }, []);

  const approveSolicitud = useCallback(
    async (id: number) => {
      const resultado = await cambiarEstado(
        id,
        "aprobado",
        "Solicitud aprobada por administración.",
      );

      if (resultado.ok) {
        showToast("Solicitud aprobada correctamente", "success");
        closeModal();
        return;
      }

      showToast(resultado.mensaje, "error");
    },
    [cambiarEstado, closeModal, showToast],
  );

  const rejectSolicitud = useCallback(
    async (id: number) => {
      if (!rejectionReason.trim()) return;

      const resultado = await cambiarEstado(
        id,
        "rechazado",
        rejectionReason.trim(),
      );

      if (resultado.ok) {
        showToast("Solicitud rechazada correctamente", "error");
        closeModal();
        return;
      }

      showToast(resultado.mensaje, "error");
    },
    [cambiarEstado, rejectionReason, closeModal, showToast],
  );

  const textoResolucion = (item: HistorialInscripcionCatequesis) => {
    if (item.observacionAdministrativa?.trim()) {
      return item.observacionAdministrativa.trim();
    }
    return normalizarEstado(item.estado) === "aprobado"
      ? "Sin comentario"
      : "Sin motivo";
  };

  const historialFiltrado = useMemo(() => {
    const nombreBuscado = normalizeText(historialFiltros.nombre);
    const filialBuscada = normalizeText(historialFiltros.filial);

    return historial
      .filter((item) => {
        if (tipoFiltro !== "todos") {
          if (normalizarEstado(item.estado) !== tipoFiltro) return false;
        }

        const coincideNombre =
          !nombreBuscado ||
          normalizeText(item.nombreCatequizando).includes(nombreBuscado);
        const coincideFilial =
          !filialBuscada ||
          normalizeText(item.centroCatequesis).includes(filialBuscada) ||
          normalizeText(item.telefonoEncargada).includes(filialBuscada);
        if (!coincideNombre || !coincideFilial) return false;

        if (rangoFechasValido(historialFechaDesde, historialFechaHasta)) {
          const fechaItem = new Date(item.fechaSolicitud ?? 0).getTime();
          if (historialFechaDesde) {
            const desdeT = new Date(
              `${historialFechaDesde}T00:00:00`,
            ).getTime();
            if (fechaItem < desdeT) return false;
          }
          if (historialFechaHasta) {
            const hastaT = new Date(
              `${historialFechaHasta}T23:59:59.999`,
            ).getTime();
            if (fechaItem > hastaT) return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.fechaSolicitud ?? 0).getTime() -
          new Date(a.fechaSolicitud ?? 0).getTime(),
      );
  }, [
    historial,
    historialFiltros,
    tipoFiltro,
    historialFechaDesde,
    historialFechaHasta,
  ]);

  const hayFiltrosHistorialActivos =
    historialNombreInput !== "" ||
    historialFilialInput !== "" ||
    tipoFiltro !== "todos" ||
    historialFechaDesde !== "" ||
    historialFechaHasta !== "";

  const limpiarFiltrosHistorial = () => {
    setHistorialNombreInput("");
    setHistorialFilialInput("");
    setTipoFiltro("todos");
    setHistorialFechaDesde("");
    setHistorialFechaHasta("");
  };

  const totalHistorialPaginas = Math.max(
    1,
    Math.ceil(historialFiltrado.length / historialRegistrosPorPagina),
  );
  const primerHistorialRegistro =
    historialFiltrado.length === 0
      ? 0
      : (historialPagina - 1) * historialRegistrosPorPagina + 1;
  const ultimoHistorialRegistro = Math.min(
    historialPagina * historialRegistrosPorPagina,
    historialFiltrado.length,
  );
  const historialPaginaItems = historialFiltrado.slice(
    (historialPagina - 1) * historialRegistrosPorPagina,
    historialPagina * historialRegistrosPorPagina,
  );

  const columns = useMemo<ColumnDef<CatequesisEnrollmentRecord>[]>(
    () => [
      {
        accessorKey: "codigoSolicitud",
        header: "ID",
        cell: ({ row }) =>
          row.original.codigoSolicitud || `CAT-${row.original.id}`,
      },
      {
        id: "catequizando",
        header: "Catequizando",
        cell: ({ row }) => (
          <span className="font-medium text-text">
            {`${row.original.catequizando?.nombre ?? "Sin nombre"} ${row.original.catequizando?.apellidos ?? ""}`.trim()}
          </span>
        ),
      },
      {
        id: "nivel",
        header: "Nivel",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {obtenerEtiquetaNivelCatequesis(
              row.original.catequesis?.nivelAInscribirse,
            )}
          </span>
        ),
      },
      {
        id: "filial",
        header: "Filial",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.catequesis?.centroCatequesis || (
              <span className="text-slate-400 italic">No registrada</span>
            )}
          </span>
        ),
      },
      {
        id: "encargado",
        header: "Encargado",
        cell: ({ row }) => {
          const nombre =
            `${row.original.encargado?.nombre ?? ""} ${row.original.encargado?.apellidos ?? ""}`.trim();
          const telefono = row.original.encargado?.telefono;

          return (
            <div>
              <span className="font-medium text-text">
                {nombre || "Sin nombre"}
              </span>
              <span className="block text-sm text-text-secondary">
                {telefono || (
                  <span className="text-slate-400 italic">No registrado</span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "fechaSolicitud",
        header: "Fecha",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {row.original.fechaSolicitud || (
              <span className="text-slate-400 italic">No registrada</span>
            )}
          </span>
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
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openModal(row.original);
            }}
            aria-label="Ver solicitud"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Eye size={17} strokeWidth={1.5} />
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 7 },
    },
  });

  const {
    totalItems,
    currentPage,
    totalPages,
    canPreviousPage,
    canNextPage,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(table);

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filtroEstadoAplicado, filtroFilialAplicado]);

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

      <div className="flex w-full flex-wrap items-center gap-1 rounded-xl border border-border-strong bg-surface p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setVista("solicitudes")}
          aria-pressed={vista === "solicitudes"}
          className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 text-sm transition-colors ${
            vista === "solicitudes"
              ? "bg-[#003366] font-semibold text-white"
              : "bg-transparent font-medium text-text-secondary hover:bg-surface-muted"
          }`}
        >
          <Inbox size={16} />
          Solicitudes
        </button>
        <button
          type="button"
          onClick={() => setVista("historial")}
          aria-pressed={vista === "historial"}
          className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 text-sm transition-colors ${
            vista === "historial"
              ? "bg-[#003366] font-semibold text-white"
              : "bg-transparent font-medium text-text-secondary hover:bg-surface-muted"
          }`}
        >
          <Archive size={16} />
          Historial
        </button>
      </div>

      {vista === "solicitudes" && (
        <>
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
              <option value="requiere_modificacion">
                Requiere modificación
              </option>
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
                <option
                  key={filial}
                  value={filial}
                >
                  {filial}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="royal"
            onClick={aplicarFiltros}
          >
            Filtrar
          </Button>

          <Button
            variant="primary"
            className="shrink-0"
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

      {cargando && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 size={32} className="animate-spin text-text-muted" />
          <p className="m-0 text-sm text-text-secondary">
            Cargando solicitudes de catequesis...
          </p>
        </div>
      )}

      {!cargando && (
      <>
      <div className="hidden md:block">
        <AdminTablePanel>
          <AdminTable>
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
                    colSpan={columns.length}
                    className="py-10 text-center text-text-muted"
                  >
                    No se encontraron matrículas con los filtros actuales.
                  </AdminTableCell>
                </AdminTableRow>
              )}
            </tbody>
          </AdminTable>
        </AdminTablePanel>
      </div>

      <div className="flex flex-col gap-2.5 md:hidden">
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => {
            const solicitud = row.original;
            const nombre =
              `${solicitud.catequizando?.nombre ?? "Sin nombre"} ${solicitud.catequizando?.apellidos ?? ""}`.trim();
            const codigo = solicitud.codigoSolicitud || `CAT-${solicitud.id}`;
            const encargado =
              `${solicitud.encargado?.nombre ?? ""} ${solicitud.encargado?.apellidos ?? ""}`.trim() ||
              "Sin encargado";
            const nivel = obtenerEtiquetaNivelCatequesis(
              solicitud.catequesis?.nivelAInscribirse,
            );
            const filial =
              solicitud.catequesis?.centroCatequesis || "No registrada";

            return (
              <AdminRecordCard
                key={solicitud.id}
                icon={<GraduationCap size={20} />}
                accent="#003366"
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
                    label: "Ver solicitud",
                    icon: <Eye size={15} />,
                    variant: "primary",
                    onClick: () => openModal(solicitud),
                  },
                ]}
              />
            );
          })
        ) : (
          <p className="py-10 text-center text-sm text-text-muted">
            No se encontraron matrículas con los filtros actuales.
          </p>
        )}
      </div>

      <AdminTableFooter pegadoAbajo>
        <span>
          Total de registros:{" "}
          <strong className="text-royal-blue">{totalItems}</strong>
        </span>
        <AdminPagination>
          <AdminPaginationButton
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}
          >
            ← Anterior
          </AdminPaginationButton>
          <span>
            Página <strong className="text-royal-blue">{currentPage}</strong> de{" "}
            <strong className="text-royal-blue">{totalPages || 1}</strong>
          </span>
          <AdminPaginationButton onClick={goToNextPage} disabled={!canNextPage}>
            Siguiente →
          </AdminPaginationButton>
        </AdminPagination>
      </AdminTableFooter>
      </>
      )}

      {selectedSolicitud && (
        <DetalleSolicitudCatequesisModal
          solicitud={selectedSolicitud}
          detalleError={detalleError}
          accionError={accionError}
          guardando={guardando}
          cerrarConEsc={!isApproveModalOpen && !isRejectModalOpen}
          onApprove={() => setIsApproveModalOpen(true)}
          onRechazar={() => {
            setRejectionReason("");
            setIsConfirmRejectOpen(false);
            setIsRejectModalOpen(true);
          }}
          onClose={closeModal}
        />
      )}

      {isRejectModalOpen && selectedSolicitud && (
        <Modal
          onClose={
            isConfirmRejectOpen
              ? () => setIsConfirmRejectOpen(false)
              : cerrarRechazo
          }
          title={isConfirmRejectOpen ? "Confirmar rechazo" : "Rechazar solicitud"}
          sinFondo
          overlayClassName={
            isConfirmRejectOpen
              ? "fixed inset-0 z-[1350] backdrop-blur-[6px]"
              : "fixed inset-0 z-[1350] bg-[#060f20]/35 backdrop-blur-[6px]"
          }
        >
          <motion.div
            key={isConfirmRejectOpen ? "confirmar" : "formulario"}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {isConfirmRejectOpen ? (
              <div className="flex min-h-44 flex-col">
                <LineaDoradaTitulo parteSubrayada="Rechazar inscripción" />
                <div className="flex flex-1 items-center justify-center px-8 py-4 text-center">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    ¿Estás seguro/a que quieres rechazar esta solicitud de
                    catequesis? Una vez rechazada, su estado no podrá ser
                    cambiado.
                  </p>
                </div>
                <div className="flex shrink-0 justify-end gap-2">
                  <Button
                    variant="royal"
                    className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
                    onClick={() => void rejectSolicitud(selectedSolicitud.id)}
                    disabled={guardando}
                  >
                    {guardando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Rechazando...
                      </>
                    ) : (
                      "Rechazar"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-lg! border-0! duration-150 ease-out hover:bg-slate-300!"
                    onClick={() => setIsConfirmRejectOpen(false)}
                    disabled={guardando}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-44 flex-col gap-4">
                <LineaDoradaTitulo parteSubrayada="Rechazar inscripción" />
                <p className="text-sm text-text-secondary">
                  Indique el motivo del rechazo. Este comentario quedará
                  registrado en la solicitud.
                </p>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: Falta documento de fe de bautismo, comprobante SINPE inválido o datos incompletos."
                  rows={3}
                  className="min-h-20"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="royal"
                    className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
                    onClick={() => setIsConfirmRejectOpen(true)}
                    disabled={!rejectionReason.trim()}
                  >
                    Continuar
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-lg! border-0! duration-150 ease-out hover:bg-slate-300!"
                    onClick={cerrarRechazo}
                    disabled={guardando}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </Modal>
      )}

      <ConfirmacionAccionModal
        open={isApproveModalOpen && selectedSolicitud !== null}
        title="Confirmar aprobación"
        parteSubrayada="Aprobar inscripción"
        mensaje="¿Estás seguro/a que quieres aprobar esta solicitud de catequesis? Una vez aprobada su estado no podrá ser cambiado."
        confirmLabel="Aprobar"
        pendingLabel="Aprobando..."
        isPending={guardando}
        onConfirm={() => {
          if (selectedSolicitud) {
            void approveSolicitud(selectedSolicitud.id);
          }
        }}
        onCancel={() => setIsApproveModalOpen(false)}
      />
        </>
      )}

      {vista === "historial" && (
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border-strong bg-surface p-3 shadow-sm">
            <AdminSearch
              type="text"
              placeholder="Nombre o apellidos"
              maxLength={30}
              value={historialNombreInput}
              onChange={(e) =>
                setHistorialNombreInput(
                  handleSoloLetrasNombre(e.target.value),
                )
              }
              className="min-w-[200px] flex-1"
              aria-label="Filtrar historial por nombre"
            />
            <AdminSearch
              type="text"
              placeholder="Filial o teléfono"
              maxLength={80}
              value={historialFilialInput}
              onChange={(e) => setHistorialFilialInput(e.target.value)}
              className="min-w-[200px] flex-1"
              aria-label="Filtrar historial por filial o teléfono"
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Tipo
              </span>
              <select
                value={tipoFiltro}
                onChange={(event) =>
                  setTipoFiltro(
                    event.target.value as
                      | "todos"
                      | "aprobado"
                      | "rechazado",
                  )
                }
                className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                aria-label="Filtrar historial por tipo"
              >
                <option value="todos">Todos</option>
                <option value="aprobado">Aprobadas</option>
                <option value="rechazado">Rechazadas</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Desde
              </span>
              <input
                type="date"
                value={historialFechaDesde}
                max={historialFechaHasta || undefined}
                onChange={(e) => setHistorialFechaDesde(e.target.value)}
                className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                aria-label="Filtrar historial desde fecha"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Hasta
              </span>
              <input
                type="date"
                value={historialFechaHasta}
                min={historialFechaDesde || undefined}
                onChange={(e) => setHistorialFechaHasta(e.target.value)}
                className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                aria-label="Filtrar historial hasta fecha"
              />
            </label>
            <button
              type="button"
              onClick={limpiarFiltrosHistorial}
              disabled={!hayFiltrosHistorialActivos}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Limpiar filtros del historial"
            >
              <RotateCcw size={15} strokeWidth={2} />
              Limpiar
            </button>
          </div>

          {historialFechaDesde &&
            historialFechaHasta &&
            !rangoFechasValido(historialFechaDesde, historialFechaHasta) && (
              <p className="m-0 text-xs font-semibold text-red-600">
                La fecha de inicio no puede ser mayor que la fecha de fin
              </p>
            )}

          {historialCargando && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 size={32} className="animate-spin text-text-muted" />
              <p className="m-0 text-sm text-text-secondary">
                Cargando historial...
              </p>
            </div>
          )}

          {historialError && !historialCargando && (
            <ErrorMessage message={historialError} />
          )}

          {!historialCargando &&
            !historialError &&
            historial.length === 0 && (
              <EmptyState title="Aún no hay inscripciones en el historial." />
            )}

          {!historialCargando &&
            !historialError &&
            historial.length > 0 &&
            historialFiltrado.length === 0 && (
              <EmptyState title="No se encontraron registros con los filtros aplicados." />
            )}

          {!historialCargando &&
            !historialError &&
            historialFiltrado.length > 0 && (
              <>
                <div className="hidden md:block">
                  <AdminTablePanel>
                    <AdminTable>
                      <AdminTableHead>
                        <AdminTableRow>
                          <AdminTableHeaderCell>Fecha</AdminTableHeaderCell>
                          <AdminTableHeaderCell>
                            Catequizando
                          </AdminTableHeaderCell>
                          <AdminTableHeaderCell>Filial</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Nivel</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                          <AdminTableHeaderCell>
                            Resolución
                          </AdminTableHeaderCell>
                          <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                        </AdminTableRow>
                      </AdminTableHead>
                      <tbody>
                        {historialPaginaItems.map((item) => (
                          <AdminTableRow key={item.id}>
                            <AdminTableCell>
                              {formatearFecha(item.fechaSolicitud ?? "")}
                            </AdminTableCell>
                            <AdminTableCell>
                              <span className="font-medium">
                                {item.nombreCatequizando || "Sin nombre"}
                              </span>
                            </AdminTableCell>
                            <AdminTableCell>
                              {item.centroCatequesis || (
                                <span className="text-slate-400 italic">
                                  No registrada
                                </span>
                              )}
                            </AdminTableCell>
                            <AdminTableCell>
                              {obtenerEtiquetaNivelCatequesis(
                                item.nivelAInscribirse,
                              )}
                            </AdminTableCell>
                            <AdminTableCell>
                              <Badge
                                variant={getEstadoBadgeVariant(item.estado)}
                              >
                                {obtenerTextoEstado(item.estado)}
                              </Badge>
                            </AdminTableCell>
                            <AdminTableCell>
                              <span
                                className="line-clamp-2 block text-sm text-text-secondary"
                                title={textoResolucion(item)}
                              >
                                {textoResolucion(item)}
                              </span>
                            </AdminTableCell>
                            <AdminTableCell>
                              <button
                                type="button"
                                onClick={() => setHistorialSeleccionada(item)}
                                aria-label="Ver historial de esta inscripción"
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                              >
                                <Eye size={17} strokeWidth={1.5} />
                              </button>
                            </AdminTableCell>
                          </AdminTableRow>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminTablePanel>
                </div>

                <div className="flex flex-col gap-2.5 md:hidden">
                  {historialPaginaItems.map((item) => (
                    <AdminRecordCard
                      key={item.id}
                      icon={<GraduationCap size={20} />}
                      accent="#003366"
                      code={`CAT-${item.id}`}
                      title={item.nombreCatequizando || "Sin nombre"}
                      subtitle={formatearFecha(item.fechaSolicitud ?? "")}
                      badges={
                        <Badge variant={getEstadoBadgeVariant(item.estado)}>
                          {obtenerTextoEstado(item.estado)}
                        </Badge>
                      }
                      meta={[
                        {
                          icon: <MapPin size={12} />,
                          label: "Filial",
                          value: item.centroCatequesis || "No registrada",
                        },
                        {
                          icon: <Phone size={12} />,
                          label: "Teléfono",
                          value: item.telefonoEncargada || "No registrado",
                        },
                        {
                          icon: <Calendar size={12} />,
                          label: "Resolución",
                          value: textoResolucion(item),
                        },
                      ]}
                      actions={[
                        {
                          label: "Ver historial",
                          icon: <Eye size={15} />,
                          variant: "primary",
                          onClick: () => setHistorialSeleccionada(item),
                        },
                      ]}
                    />
                  ))}
                </div>

                <AdminTableFooter pegadoAbajo>
                  <span className="text-sm text-text-muted">
                    Mostrando{" "}
                    <strong className="text-text tabular-nums">
                      {primerHistorialRegistro}-{ultimoHistorialRegistro}
                    </strong>{" "}
                    de{" "}
                    <strong className="text-text tabular-nums">
                      {historialFiltrado.length}
                    </strong>{" "}
                    registros
                  </span>
                  <AdminPagination className="flex-wrap">
                    <label className="mr-1 flex items-center gap-2 text-sm text-text-muted">
                      Registros por página
                      <select
                        value={historialRegistrosPorPagina}
                        onChange={(event) =>
                          setHistorialRegistrosPorPagina(
                            Number(event.target.value),
                          )
                        }
                        className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm tabular-nums text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                        aria-label="Cantidad de registros por página"
                      >
                        {TAMANOS_PAGINA.map((tamano) => (
                          <option key={tamano} value={tamano}>
                            {tamano}
                          </option>
                        ))}
                      </select>
                    </label>
                    <AdminPaginationButton
                      type="button"
                      onClick={() =>
                        setHistorialPagina((pagina) =>
                          Math.max(1, pagina - 1),
                        )
                      }
                      disabled={historialPagina <= 1}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={16} strokeWidth={2} />
                    </AdminPaginationButton>
                    <span className="text-sm whitespace-nowrap text-text-muted">
                      Página{" "}
                      <strong className="text-text tabular-nums">
                        {historialPagina}
                      </strong>{" "}
                      de{" "}
                      <strong className="text-text tabular-nums">
                        {totalHistorialPaginas}
                      </strong>
                    </span>
                    <AdminPaginationButton
                      type="button"
                      onClick={() =>
                        setHistorialPagina((pagina) =>
                          Math.min(totalHistorialPaginas, pagina + 1),
                        )
                      }
                      disabled={historialPagina >= totalHistorialPaginas}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight size={16} strokeWidth={2} />
                    </AdminPaginationButton>
                  </AdminPagination>
                </AdminTableFooter>
              </>
            )}
        </div>
      )}

      {historialSeleccionada && (
        <Modal
          onClose={() => setHistorialSeleccionada(null)}
          title={`Historial de CAT-${historialSeleccionada.id}`}
          sinFondo
          cerrarConEsc
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-strong bg-surface-muted p-4">
                <div className="flex flex-col gap-1">
                  <p className="m-0 text-lg font-semibold text-slate-900">
                    {historialSeleccionada.nombreCatequizando || "Sin nombre"}
                  </p>
                  <p className="m-0 text-sm text-text-secondary">
                    {obtenerEtiquetaNivelCatequesis(
                      historialSeleccionada.nivelAInscribirse,
                    )}
                    {historialSeleccionada.centroCatequesis
                      ? ` · ${historialSeleccionada.centroCatequesis}`
                      : ""}
                  </p>
                  <p className="m-0 text-xs text-text-muted">
                    Fecha de solicitud:{" "}
                    {formatearFecha(
                      historialSeleccionada.fechaSolicitud ?? "",
                    )}
                  </p>
                  {historialSeleccionada.telefonoEncargada && (
                    <p className="m-0 text-xs text-text-muted">
                      Teléfono: {historialSeleccionada.telefonoEncargada}
                    </p>
                  )}
                </div>
                <Badge
                  variant={getEstadoBadgeVariant(historialSeleccionada.estado)}
                >
                  {obtenerTextoEstado(historialSeleccionada.estado)}
                </Badge>
              </div>

              {normalizarEstado(historialSeleccionada.estado) === "aprobado" ? (
                <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <Badge variant="success">Aprobado</Badge>
                  <p className="m-0 text-sm text-emerald-900">
                    {historialSeleccionada.observacionAdministrativa ||
                      "Sin comentario de aprobación"}
                  </p>
                  {historialSeleccionada.fechaActualizacionEstado && (
                    <p className="m-0 text-xs text-emerald-700">
                      Aprobado el{" "}
                      {formatearFecha(
                        historialSeleccionada.fechaActualizacionEstado,
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
                  <Badge variant="danger">Rechazado</Badge>
                  <p className="m-0 text-sm font-semibold text-red-900">
                    {historialSeleccionada.observacionAdministrativa ||
                      "Motivo no especificado"}
                  </p>
                  {historialSeleccionada.fechaActualizacionEstado && (
                    <p className="m-0 text-xs text-red-700">
                      Rechazado el{" "}
                      {formatearFecha(
                        historialSeleccionada.fechaActualizacionEstado,
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </Modal>
      )}
    </AdminModule>
  );
}

export default GestionSolicitudesCatequesis;
