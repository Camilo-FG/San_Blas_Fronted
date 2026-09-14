import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  CheckCircle,
  ChevronDown,
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
  Mail,
  User,
  MapPin,
  Phone,
  Calendar,
  CalendarDays,
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
import { obtenerEtiquetaNivelCatequesis, NIVELES_CATEQUESIS } from "../../../catequesis/constants/nivelesCatequesis";
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
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
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
  LineaDoradaTitulo,
  Modal,
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

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const TAMANOS_PAGINA = [7, 10, 25] as const;
const TAMANOS_PAGINA_SOLICITUDES = [10, 25, 50] as const;

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

const formatearTelefono = (valor?: string | null) => {
  const digitos = soloDigitos(String(valor ?? "")).slice(0, 8);
  if (!digitos) return "";
  if (digitos.length <= 4) return digitos;
  return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
};

const formatFechaIngreso = (fecha?: string | null) => {
  if (!fecha) return "—";
  const date = new Date(fecha.includes("T") ? fecha : `${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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
  const { showToast } = useToast();

  const [filtroNivel, setFiltroNivel] = useState<"todos" | "Primero" | "Sétimo">(
    "todos",
  );
  const [filtroFilial, setFiltroFilial] = useState<"todos" | string>("todos");
  const [filtroTextoLibre, setFiltroTextoLibre] = useState("");
  const [filtroEncargado, setFiltroEncargado] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "pendiente" | "aprobado" | "rechazado"
  >("todos");
  const [filtroNivelMenuAbierto, setFiltroNivelMenuAbierto] = useState(false);
  const [filtroFilialMenuAbierto, setFiltroFilialMenuAbierto] = useState(false);
  const filtroNivelMenuRef = useRef<HTMLDivElement>(null);
  const filtroFilialMenuRef = useRef<HTMLDivElement>(null);

  // Debounce para no pegarle al backend en cada tecla del texto libre y del encargado
  const debouncedQ = useDebouncedValue(filtroTextoLibre.trim(), 400);
  const debouncedEncargado = useDebouncedValue(filtroEncargado.trim(), 400);

  // Filtros que el backend soporta (estado, encargado, q); nivel y filial se filtran en memoria
  const filtros = useMemo(
    () => ({
      estado: filtroEstado === "todos" ? undefined : filtroEstado,
      encargado: debouncedEncargado || undefined,
      q: debouncedQ || undefined,
    }),
    [filtroEstado, debouncedEncargado, debouncedQ],
  );

  const {
    solicitudes,
    cambiarEstado,
    obtenerDetalle,
    exportarExcel,
    cargando,
    filtrando,
    guardando,
    exportando,
    error,
    detalleError,
    accionError,
    exportError,
    limpiarDetalleError,
    limpiarAccionError,
    limpiarExportError,
  } = useSolicitudesCatequesis(filtros);
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
  const [historialFiltros, setHistorialFiltros] = useState({
    nombre: "",
  });
  const [historialFiltroNivel, setHistorialFiltroNivel] = useState<
    "todos" | "Primero" | "Sétimo"
  >("todos");
  const [historialFiltroFilial, setHistorialFiltroFilial] = useState<
    "todos" | string
  >("todos");
  const [tipoFiltro, setTipoFiltro] = useState<
    "todos" | "aprobado" | "rechazado"
  >("todos");
  const [historialFechaDesde, setHistorialFechaDesde] = useState("");
  const [historialFechaHasta, setHistorialFechaHasta] = useState("");

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      const objetivo = event.target as Node;
      if (
        filtroNivelMenuRef.current &&
        !filtroNivelMenuRef.current.contains(objetivo)
      ) {
        setFiltroNivelMenuAbierto(false);
      }
      if (
        filtroFilialMenuRef.current &&
        !filtroFilialMenuRef.current.contains(objetivo)
      ) {
        setFiltroFilialMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistorialFiltros({
        nombre: historialNombreInput.trim(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [historialNombreInput]);

  const cargarHistorial = useCallback(async () => {
    setHistorialCargando(true);
    setHistorialError(null);

    try {
      const respuesta = await obtenerHistorialCatequesis();
      setHistorial(respuesta.historial);
      setHistorialPagina(1);
    } catch (e: unknown) {
      setHistorialError(
        e instanceof ApiError
          ? e.message
          : "No se pudo cargar el historial de catequesis.",
      );
    } finally {
      setHistorialCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarHistorial();
  }, [cargarHistorial]);

  useEffect(() => {
    setHistorialPagina(1);
  }, [
    historialFiltros,
    historialRegistrosPorPagina,
    historialFiltroNivel,
    historialFiltroFilial,
    tipoFiltro,
    historialFechaDesde,
    historialFechaHasta,
  ]);

  const hayFiltrosActivos =
    filtroEstado !== "todos" ||
    filtroNivel !== "todos" ||
    filtroFilial !== "todos" ||
    filtroTextoLibre.trim() !== "" ||
    filtroEncargado.trim() !== "";

  const limpiarFiltros = () => {
    setFiltroEstado("todos");
    setFiltroNivel("todos");
    setFiltroFilial("todos");
    setFiltroTextoLibre("");
    setFiltroEncargado("");
  };

  const totalPendientes = useMemo(
    () =>
      solicitudes.filter(
        (item) => normalizarEstado(item.estado) === "pendiente",
      ).length,
    [solicitudes],
  );

  const totalAprobadas = useMemo(
    () =>
      historial.filter((item) => normalizarEstado(item.estado) === "aprobado")
        .length,
    [historial],
  );

  const totalRechazadas = useMemo(
    () =>
      historial.filter((item) => normalizarEstado(item.estado) === "rechazado")
        .length,
    [historial],
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
        void cargarHistorial();
        return;
      }

      showToast(resultado.mensaje, "error");
    },
    [cambiarEstado, closeModal, showToast, cargarHistorial],
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
        void cargarHistorial();
        return;
      }

      showToast(resultado.mensaje, "error");
    },
    [cambiarEstado, rejectionReason, closeModal, showToast, cargarHistorial],
  );

  const historialFiltrado = useMemo(() => {
    const nombreBuscado = normalizeText(historialFiltros.nombre);

    return historial
      .filter((item) => {
        if (tipoFiltro !== "todos") {
          if (normalizarEstado(item.estado) !== tipoFiltro) return false;
        }

        const coincideNombre =
          !nombreBuscado ||
          normalizeText(item.nombreCatequizando).includes(nombreBuscado);
        const coincideNivel =
          historialFiltroNivel === "todos" ||
          normalizeText(item.nivelAInscribirse) ===
            normalizeText(historialFiltroNivel);
        const coincideFilial =
          historialFiltroFilial === "todos" ||
          normalizeText(item.centroCatequesis) ===
            normalizeText(historialFiltroFilial);
        if (!coincideNombre || !coincideNivel || !coincideFilial) return false;

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
    historialFiltroNivel,
    historialFiltroFilial,
    tipoFiltro,
    historialFechaDesde,
    historialFechaHasta,
  ]);

  const hayFiltrosHistorialActivos =
    historialNombreInput !== "" ||
    historialFiltroNivel !== "todos" ||
    historialFiltroFilial !== "todos" ||
    tipoFiltro !== "todos" ||
    historialFechaDesde !== "" ||
    historialFechaHasta !== "";

  const limpiarFiltrosHistorial = () => {
    setHistorialNombreInput("");
    setHistorialFiltroNivel("todos");
    setHistorialFiltroFilial("todos");
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
            {row.original.catequesis?.centroCatequesis || "—"}
          </span>
        ),
      },
      {
        id: "fecha",
        header: "Fecha de ingreso",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {formatFechaIngreso(row.original.fechaSolicitud)}
          </span>
        ),
      },
      {
        id: "encargado",
        header: "Encargado",
        cell: ({ row }) => {
          const nombre =
            `${row.original.encargado?.nombre ?? ""} ${row.original.encargado?.apellidos ?? ""}`.trim();
          const correo = row.original.encargado?.correo?.trim();

          return (
            <span className="flex min-w-0 flex-col text-sm leading-snug text-text-secondary">
              <span className="truncate font-medium text-text">
                {nombre || "—"}
              </span>
              <span className="truncate text-xs text-text-muted">
                {correo || "—"}
              </span>
            </span>
          );
        },
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
          <span className="inline-flex items-center gap-0.5">
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
          </span>
        ),
      },
    ],
    [openModal],
  );

  // Nivel y filial no los soporta el backend, por eso se siguen filtrando en memoria
  const filteredSolicitudes = useMemo(
    () =>
      solicitudes.filter((solicitud) => {
        const coincideNivel =
          filtroNivel === "todos" ||
          normalizeText(solicitud.catequesis?.nivelAInscribirse) ===
            normalizeText(filtroNivel);
        const coincideFilial =
          filtroFilial === "todos" ||
          normalizeText(solicitud.catequesis?.centroCatequesis) ===
            normalizeText(filtroFilial);

        return coincideNivel && coincideFilial;
      }),
    [solicitudes, filtroNivel, filtroFilial],
  );

  const table = useReactTable({
    data: filteredSolicitudes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    getRowId: (row) => String(row.id),
    initialState: {
      pagination: { pageSize: 10 },
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

  const isInitialLoading = cargando && solicitudes.length === 0;
  const pageSize = table.getState().pagination.pageSize;
  const primerRegistro =
    totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const ultimoRegistro = Math.min(currentPage * pageSize, totalItems);

  useEffect(() => {
    table.setPageIndex(0);
  }, [filtroTextoLibre, filtroEncargado, filtroEstado, filtroNivel, filtroFilial]);

  useEffect(() => {
    table.setPageIndex(0);
  }, [pageSize]);

  return (
    <AdminModule className="gap-3!">
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

      <AdminToolbar className="p-3!">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target.value as
                  | "todos"
                  | "pendiente"
                  | "aprobado"
                  | "rechazado",
              )
            }
            className="min-h-11 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobada</option>
            <option value="rechazado">Rechazada</option>
          </select>
          <input
            type="text"
            value={filtroTextoLibre}
            onChange={(e) => setFiltroTextoLibre(e.target.value)}
            maxLength={60}
            placeholder="Buscar en alumno o contacto"
            className="min-h-11 min-w-[200px] flex-1 rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            aria-label="Buscar en alumno o contacto (nombre o teléfono)"
          />
          <input
            type="text"
            value={filtroEncargado}
            onChange={(e) =>
              setFiltroEncargado(handleSoloLetrasNombre(e.target.value))
            }
            placeholder="Nombre del encargado"
            className="min-h-11 min-w-[180px] flex-1 rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            aria-label="Filtrar por nombre del encargado"
          />
          <div
            className="relative shrink-0"
            ref={filtroNivelMenuRef}
          >
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={filtroNivelMenuAbierto}
              aria-label="Filtrar por nivel"
              onClick={() => setFiltroNivelMenuAbierto((prev) => !prev)}
              className={`flex min-h-11 w-[170px] cursor-pointer items-center justify-between gap-2 rounded-xl border bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none ${
                filtroNivelMenuAbierto
                  ? "border-blue-400 bg-surface"
                  : "border-border-strong"
              }`}
            >
              <span>
                {filtroNivel === "todos"
                  ? "Nivel"
                  : obtenerEtiquetaNivelCatequesis(filtroNivel)}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`transition-transform duration-200 ${
                  filtroNivelMenuAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
            {filtroNivelMenuAbierto && (
              <ul
                role="listbox"
                className="absolute top-full left-0 z-50 mt-1.5 w-[170px] overflow-hidden rounded-xl border-0 bg-surface p-1 shadow-[0_16px_35px_rgba(0,0,0,0.18)]"
              >
                <li role="option" aria-selected={filtroNivel === "todos"}>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroNivel("todos");
                      setFiltroNivelMenuAbierto(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-semibold transition-colors ${
                      filtroNivel === "todos"
                        ? "bg-royal-blue/10 text-royal-blue"
                        : "text-slate-700 hover:bg-royal-blue/5"
                    }`}
                  >
                    Todos
                  </button>
                </li>
                {NIVELES_CATEQUESIS.map((opcion) => {
                  const activo = filtroNivel === opcion.value;
                  return (
                    <li
                      key={opcion.value}
                      role="option"
                      aria-selected={activo}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFiltroNivel(opcion.value);
                          setFiltroNivelMenuAbierto(false);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-semibold transition-colors ${
                          activo
                            ? "bg-royal-blue/10 text-royal-blue"
                            : "text-slate-700 hover:bg-royal-blue/5"
                        }`}
                      >
                        {opcion.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div
            className="relative shrink-0"
            ref={filtroFilialMenuRef}
          >
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={filtroFilialMenuAbierto}
              aria-label="Filtrar por filial"
              onClick={() => setFiltroFilialMenuAbierto((prev) => !prev)}
              className={`flex min-h-11 w-[170px] cursor-pointer items-center justify-between gap-2 rounded-xl border bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none ${
                filtroFilialMenuAbierto
                  ? "border-blue-400 bg-surface"
                  : "border-border-strong"
              }`}
            >
              <span className="truncate">
                {filtroFilial === "todos" ? "Filial" : filtroFilial}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`shrink-0 transition-transform duration-200 ${
                  filtroFilialMenuAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
            {filtroFilialMenuAbierto && (
              <ul
                role="listbox"
                className="absolute top-full left-0 z-50 mt-1.5 max-h-72 w-[170px] overflow-y-auto rounded-xl border-0 bg-surface p-1 shadow-[0_16px_35px_rgba(0,0,0,0.18)]"
              >
                <li role="option" aria-selected={filtroFilial === "todos"}>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroFilial("todos");
                      setFiltroFilialMenuAbierto(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-semibold transition-colors ${
                      filtroFilial === "todos"
                        ? "bg-royal-blue/10 text-royal-blue"
                        : "text-slate-700 hover:bg-royal-blue/5"
                    }`}
                  >
                    Todas
                  </button>
                </li>
                {FILIALES_CATEQUESIS.map((filial) => {
                  const activo = filtroFilial === filial;
                  return (
                    <li
                      key={filial}
                      role="option"
                      aria-selected={activo}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFiltroFilial(filial);
                          setFiltroFilialMenuAbierto(false);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-semibold transition-colors ${
                          activo
                            ? "bg-royal-blue/10 text-royal-blue"
                            : "text-slate-700 hover:bg-royal-blue/5"
                        }`}
                      >
                        {filial}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {filtrando && (
            <Loader2
              size={18}
              className="animate-spin text-text-muted"
              aria-label="Aplicando filtros"
            />
          )}
          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Limpiar filtros de solicitudes"
          >
            <RotateCcw size={15} strokeWidth={2} />
            Limpiar
          </button>
          <Button
            variant="primary"
            className="shrink-0"
            onClick={() => {
              limpiarExportError();
              void exportarExcel();
            }}
            disabled={exportando || isInitialLoading}
          >
            <Download size={16} />
            {exportando ? "Exportando..." : "Exportar a Excel"}
          </Button>
        </div>
      </AdminToolbar>

      {exportError && <ErrorMessage message={exportError} />}

      {isInitialLoading && (
        <p className="py-6 text-center text-sm text-text-muted">
          Cargando solicitudes...
        </p>
      )}

      {!isInitialLoading && filteredSolicitudes.length === 0 && (
        <p className="py-6 text-center text-sm text-text-muted">
          {hayFiltrosActivos
            ? "No se encontraron solicitudes con los filtros seleccionados."
            : "Actualmente no existen solicitudes registradas."}
        </p>
      )}

      {!isInitialLoading && filteredSolicitudes.length > 0 && (
      <>
      <div className="hidden md:block">
        <AdminTablePanel>
          <AdminTable className="table-fixed [&_td]:py-2! [&_th]:py-2.5!">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
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
              {table.getRowModel().rows.map((row) => (
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
              ))}
            </tbody>
          </AdminTable>
        </AdminTablePanel>
      </div>

      <div className="flex flex-col gap-2.5 md:hidden">
        {table.getRowModel().rows.map((row) => {
          const solicitud = row.original;
          const nombre =
            `${solicitud.catequizando?.nombre ?? "Sin nombre"} ${solicitud.catequizando?.apellidos ?? ""}`.trim();

          return (
            <AdminRecordCard
              key={solicitud.id}
              icon={<GraduationCap size={20} />}
              accent="#003366"
              title={nombre}
              badges={
                <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
                  {obtenerTextoEstado(solicitud.estado)}
                </Badge>
              }
              meta={[
                {
                  icon: <MapPin size={12} />,
                  label: "Filial",
                  value:
                    solicitud.catequesis?.centroCatequesis || "No registrada",
                },
                {
                  icon: <User size={12} />,
                  label: "Encargado",
                  value:
                    `${solicitud.encargado?.nombre ?? ""} ${solicitud.encargado?.apellidos ?? ""}`.trim() ||
                    "No registrado",
                },
                {
                  icon: <Mail size={12} />,
                  label: "Correo",
                  value: solicitud.encargado?.correo?.trim() || "No registrado",
                },
                {
                  icon: <CalendarDays size={12} />,
                  label: "Fecha de ingreso",
                  value: formatFechaIngreso(solicitud.fechaSolicitud),
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
        })}
      </div>

      <AdminTableFooter pegadoAbajo>
        <span className="text-sm text-text-muted">
          Mostrando{" "}
          <strong className="text-text tabular-nums">
            {primerRegistro}-{ultimoRegistro}
          </strong>{" "}
          de <strong className="text-text tabular-nums">{totalItems}</strong>{" "}
          registros
        </span>
        <AdminPagination>
          <label className="mr-1 flex items-center gap-2 text-sm text-text-muted">
            Registros por página
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm tabular-nums text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
              aria-label="Cantidad de registros por página"
            >
              {TAMANOS_PAGINA_SOLICITUDES.map((tamano) => (
                <option key={tamano} value={tamano}>
                  {tamano}
                </option>
              ))}
            </select>
          </label>
          <AdminPaginationButton
            type="button"
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </AdminPaginationButton>
          <span className="text-sm whitespace-nowrap text-text-muted">
            Página{" "}
            <strong className="text-text tabular-nums">{currentPage}</strong> de{" "}
            <strong className="text-text tabular-nums">
              {totalPages || 1}
            </strong>
          </span>
          <AdminPaginationButton
            type="button"
            onClick={goToNextPage}
            disabled={!canNextPage}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} strokeWidth={2} />
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
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Nivel
              </span>
              <select
                value={historialFiltroNivel}
                onChange={(event) =>
                  setHistorialFiltroNivel(
                    event.target.value as "todos" | "Primero" | "Sétimo",
                  )
                }
                className="min-h-10 min-w-[160px] cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                aria-label="Filtrar historial por nivel"
              >
                <option value="todos">Todos</option>
                {NIVELES_CATEQUESIS.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Filial
              </span>
              <select
                value={historialFiltroFilial}
                onChange={(event) => setHistorialFiltroFilial(event.target.value)}
                className="min-h-10 min-w-[160px] cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                aria-label="Filtrar historial por filial"
              >
                <option value="todos">Todas</option>
                {FILIALES_CATEQUESIS.map((filial) => (
                  <option key={filial} value={filial}>
                    {filial}
                  </option>
                ))}
              </select>
            </label>
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
                          <AdminTableHeaderCell>
                            Catequizando
                          </AdminTableHeaderCell>
                          <AdminTableHeaderCell>Filial</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Nivel</AdminTableHeaderCell>
                          <AdminTableHeaderCell>
                            Fecha de solicitud
                          </AdminTableHeaderCell>
                          <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                        </AdminTableRow>
                      </AdminTableHead>
                      <tbody>
                        {historialPaginaItems.map((item) => (
                          <AdminTableRow key={item.id}>
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
                              <span className="tabular-nums text-text-secondary">
                                {formatFechaIngreso(item.fechaSolicitud ?? "")}
                              </span>
                            </AdminTableCell>
                            <AdminTableCell>
                              <Badge
                                variant={getEstadoBadgeVariant(item.estado)}
                              >
                                {obtenerTextoEstado(item.estado)}
                              </Badge>
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
                          icon: <Calendar size={12} />,
                          label: "Fecha de solicitud",
                          value: formatFechaIngreso(item.fechaSolicitud ?? ""),
                        },
                        {
                          icon: <Phone size={12} />,
                          label: "Teléfono",
                          value: item.telefonoEncargada || "No registrado",
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
                    {formatFechaIngreso(
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
                      {formatFechaIngreso(
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
                      {formatFechaIngreso(
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
