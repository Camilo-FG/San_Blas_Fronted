import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  HandHeart,
  Inbox,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FocusTrap from "focus-trap-react";
import {
  useGestionDonaciones,
  Donacion,
  type EstadoDonacionAccion,
} from "../hooks/useGestionDonaciones";
import { DonacionDetalleModal } from "../components/DonacionDetalleModal";
import { useNotificacionDonaciones } from "../hooks/useNotificacionDonaciones";
import { NotificacionSolicitudesNuevas } from "../../../shared/components/NotificacionSolicitudesNuevas";
import { ApiError } from "../../../services/apiClient";
import {
  HistorialDonacion,
  obtenerHistorialDonaciones,
} from "../../../services/donacionesService";
import { AdminRecordCard } from "../../../shared/components/admin/AdminRecordCard";
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
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  LineaDoradaTitulo,
  Modal,
  Textarea,
  resaltarCoincidencia,
  type BadgeVariant,
  useToast,
} from "../../../shared/ui";

const getEstadoBadgeVariant = (estado?: string): BadgeVariant => {
  const normalized = (estado || "pendiente").toLowerCase();
  if (normalized === "aprobado") return "success";
  if (normalized === "rechazado") return "danger";
  return "warning";
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type Confirmacion = "aprobar" | "rechazar" | null;

const TAMANOS_PAGINA = [10, 25, 50] as const;
const TAMANO_PAGINA_INICIAL = 10;

const REGEX_MOTIVO_VALIDO =
  /^[a-zA-Z\u00C0-\u024F\d\s.,;:!?¡¿()'"\-–—]*$/;
const tieneCaracteresInvalidos = (texto: string) =>
  texto.length > 0 && !REGEX_MOTIVO_VALIDO.test(texto);

const rangoFechasValido = (desde: string, hasta: string): boolean => {
  if (!desde || !hasta) return true;
  return (
    new Date(`${desde}T00:00:00`).getTime() <=
    new Date(`${hasta}T00:00:00`).getTime()
  );
};

export default function GestionDonaciones(): React.JSX.Element {
  const {
    donaciones,
    cargando,
    guardando,
    error,
    cambiarEstadoDonacion,
    rechazarDonacion,
  } = useGestionDonaciones();
  const { showToast, toasts } = useToast();
  const { cantidad: solicitudesNuevas, verificarNuevas } =
    useNotificacionDonaciones();
  const [donacionSeleccionada, setDonacionSeleccionada] =
    useState<Donacion | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);
  const [nombreInput, setNombreInput] = useState("");
  const [correoInput, setCorreoInput] = useState("");
  const [filtros, setFiltros] = useState({ nombre: "", correo: "" });
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(
    TAMANO_PAGINA_INICIAL,
  );
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [rejectionReasonSelect, setRejectionReasonSelect] = useState("");
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [motivoError, setMotivoError] = useState<string | null>(null);
  const [motivoMenuAbierto, setMotivoMenuAbierto] = useState(false);
  const motivoMenuRef = useRef<HTMLDivElement>(null);
  const [approvalDetail, setApprovalDetail] = useState("");
  const [vista, setVista] = useState<"solicitudes" | "historial">(
    "solicitudes",
  );
  const [historial, setHistorial] = useState<HistorialDonacion[]>([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [historialError, setHistorialError] = useState<string | null>(null);
  const [historialPagina, setHistorialPagina] = useState(1);
  const [historialRegistrosPorPagina, setHistorialRegistrosPorPagina] =
    useState(TAMANO_PAGINA_INICIAL);
  const [historialSeleccionada, setHistorialSeleccionada] =
    useState<HistorialDonacion | null>(null);
  const [historialNombreInput, setHistorialNombreInput] = useState("");
  const [historialCorreoInput, setHistorialCorreoInput] = useState("");
  const [historialFiltros, setHistorialFiltros] = useState({
    nombre: "",
    correo: "",
  });
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "aprobado" | "rechazado">(
    "todos",
  );
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [historialFechaDesde, setHistorialFechaDesde] = useState("");
  const [historialFechaHasta, setHistorialFechaHasta] = useState("");

  const rejectionReasons = [
    "Datos ambiguos",
    "Insumo no procede",
    "Otro",
  ];

  const formatearFecha = (fechaStr: string) => {
    const opciones: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(fechaStr).toLocaleDateString("es-CR", opciones);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({
        nombre: nombreInput.trim(),
        correo: correoInput.trim(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [nombreInput, correoInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistorialFiltros({
        nombre: historialNombreInput.trim(),
        correo: historialCorreoInput.trim(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [historialNombreInput, historialCorreoInput]);

  useEffect(() => {
    void verificarNuevas();
  }, [verificarNuevas]);

  useEffect(() => {
    if (vista !== "historial") return;

    let activo = true;
    setHistorialCargando(true);
    setHistorialError(null);

    obtenerHistorialDonaciones()
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
            : "No se pudo cargar el historial de donaciones.",
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

  useEffect(() => {
    if (!motivoMenuAbierto) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        motivoMenuRef.current &&
        !motivoMenuRef.current.contains(event.target as Node)
      ) {
        setMotivoMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [motivoMenuAbierto]);

  const handleSoloLetrasNombre = (valor: string) =>
    valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").slice(0, 30);

  const handleCorreo = (valor: string) =>
    valor.replace(/[^a-zA-Z0-9@._+-]/g, "").slice(0, 80);

  const donacionesFiltradas = useMemo(() => {
    const nombreBuscado = normalizeText(filtros.nombre);
    const correoBuscado = normalizeText(filtros.correo);

    return donaciones
      .filter((donacion) => {
        const esPendiente =
          (donacion.estado || "Pendiente").toLowerCase() === "pendiente";
        if (!esPendiente) return false;

        const coincideNombre =
          !nombreBuscado ||
          normalizeText(donacion.nombre).includes(nombreBuscado);
        const coincideCorreo =
          !correoBuscado ||
          normalizeText(donacion.correo).includes(correoBuscado);
        if (!coincideNombre || !coincideCorreo) return false;

        if (rangoFechasValido(fechaDesde, fechaHasta)) {
          const fechaDonacion = new Date(donacion.fecha).getTime();
          if (fechaDesde) {
            const desdeT = new Date(`${fechaDesde}T00:00:00`).getTime();
            if (fechaDonacion < desdeT) return false;
          }
          if (fechaHasta) {
            const hastaT = new Date(`${fechaHasta}T23:59:59.999`).getTime();
            if (fechaDonacion > hastaT) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });
  }, [donaciones, filtros, fechaDesde, fechaHasta]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(donacionesFiltradas.length / registrosPorPagina),
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [filtros, registrosPorPagina, fechaDesde, fechaHasta]);

  useEffect(() => {
    setPaginaActual((pagina) => Math.min(pagina, totalPaginas));
  }, [totalPaginas]);

  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const donacionesPagina = donacionesFiltradas.slice(
    indiceInicio,
    indiceInicio + registrosPorPagina,
  );
  const primerRegistro = donacionesFiltradas.length === 0 ? 0 : indiceInicio + 1;
  const ultimoRegistro = Math.min(
    indiceInicio + registrosPorPagina,
    donacionesFiltradas.length,
  );

  const hayBusquedaActiva =
    filtros.nombre !== "" ||
    filtros.correo !== "" ||
    fechaDesde !== "" ||
    fechaHasta !== "";

  const hayFiltrosSolicitudesActivos =
    nombreInput !== "" ||
    correoInput !== "" ||
    fechaDesde !== "" ||
    fechaHasta !== "";

  const hayFiltrosHistorialActivos =
    historialNombreInput !== "" ||
    historialCorreoInput !== "" ||
    tipoFiltro !== "todos" ||
    historialFechaDesde !== "" ||
    historialFechaHasta !== "";

  const limpiarFiltrosSolicitudes = () => {
    setNombreInput("");
    setCorreoInput("");
    setFechaDesde("");
    setFechaHasta("");
  };

  const limpiarFiltrosHistorial = () => {
    setHistorialNombreInput("");
    setHistorialCorreoInput("");
    setTipoFiltro("todos");
    setHistorialFechaDesde("");
    setHistorialFechaHasta("");
  };
  const mostrarEstadoVacio =
    !cargando &&
    !error &&
    donacionesFiltradas.length === 0 &&
    hayBusquedaActiva;

  const abrirDetalle = (donacion: Donacion) => {
    setConfirmacion(null);
    setDonacionSeleccionada(donacion);
  };

  const cerrarDetalle = () => {
    if (guardando) return;
    setDonacionSeleccionada(null);
    setConfirmacion(null);
  };

  const abrirConfirmacion = (accion: Exclude<Confirmacion, null>) => {
    if (!donacionSeleccionada || donacionSeleccionada.estado !== "Pendiente") {
      return;
    }
    if (accion === "rechazar") {
      abrirRechazo();
      return;
    }
    setApprovalDetail("");
    setConfirmacion(accion);
  };

  const abrirRechazo = () => {
    if (!donacionSeleccionada || donacionSeleccionada.estado !== "Pendiente") {
      return;
    }
    setConfirmacion(null);
    setIsConfirmRejectOpen(false);
    setRejectionReasonSelect("");
    setRejectionReasonText("");
    setMotivoError(null);
    setMotivoMenuAbierto(false);
    setIsRejectModalOpen(true);
  };

  const cerrarRechazo = (opciones?: { volverAlDetalle?: boolean }) => {
    if (guardando) return;
    const { volverAlDetalle = true } = opciones ?? {};
    setIsRejectModalOpen(false);
    setIsConfirmRejectOpen(false);
    setRejectionReasonSelect("");
    setRejectionReasonText("");
    setMotivoError(null);
    setMotivoMenuAbierto(false);
    if (!volverAlDetalle) {
      setDonacionSeleccionada(null);
    }
    setConfirmacion(null);
  };

  const handleOpenConfirmReject = () => {
    const motivo = rejectionReasonSelect.trim();
    if (tieneCaracteresInvalidos(rejectionReasonText)) return;
    if (!motivo) {
      setMotivoError("Por favor seleccione un motivo para continuar");
      return;
    }
    setMotivoError(null);
    setIsConfirmRejectOpen(true);
  };

  const handleCancelConfirmReject = () => {
    if (guardando) return;
    setIsConfirmRejectOpen(false);
  };

  const handleRejectSubmit = async () => {
    const motivo = rejectionReasonSelect.trim();
    const detalle = rejectionReasonText.trim() || undefined;
    if (!donacionSeleccionada || !motivo || guardando) return;

    const resultado = await rechazarDonacion(
      donacionSeleccionada.id,
      motivo,
      detalle,
    );

    if (resultado.ok) {
      showToast("Donativo rechazado correctamente", "error");
      cerrarRechazo({ volverAlDetalle: false });
      return;
    }

    showToast(resultado.mensaje, "error");
  };

  const cancelarConfirmacion = () => {
    if (guardando) return;
    setConfirmacion(null);
    setApprovalDetail("");
  };

  useEffect(() => {
    if (!donacionSeleccionada && !confirmacion && !isRejectModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || toasts.length > 0) return;
      if (isConfirmRejectOpen) {
        handleCancelConfirmReject();
        return;
      }
      if (isRejectModalOpen) {
        cerrarRechazo();
        return;
      }
      if (confirmacion) {
        cancelarConfirmacion();
        return;
      }
      cerrarDetalle();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    donacionSeleccionada,
    confirmacion,
    isRejectModalOpen,
    isConfirmRejectOpen,
    guardando,
    toasts.length,
  ]);

  const confirmarCambioEstado = async (
    nuevoEstado: EstadoDonacionAccion,
    detalle?: string,
  ) => {
    if (!donacionSeleccionada) return;

    const resultado = await cambiarEstadoDonacion(
      donacionSeleccionada.id,
      nuevoEstado,
      detalle,
    );

    if (resultado.ok) {
      setConfirmacion(null);
      setApprovalDetail("");
      setDonacionSeleccionada(null);
      if (nuevoEstado === "Aprobado") {
        showToast("Donativo aprobado correctamente", "success");
      } else {
        showToast("Donativo rechazado correctamente", "error");
      }
      return;
    }

    showToast(resultado.mensaje, "error");
  };

  const renderEstadoBadge = (estado?: string) => (
    <Badge variant={getEstadoBadgeVariant(estado)}>
      {estado || "Pendiente"}
    </Badge>
  );

  const historialFiltrado = useMemo(() => {
    const nombreBuscado = normalizeText(historialFiltros.nombre);
    const correoBuscado = normalizeText(historialFiltros.correo);

    return historial
      .filter((donacion) => {
        if (tipoFiltro !== "todos") {
          const coincideTipo =
            donacion.estado.toLowerCase() === tipoFiltro.toLowerCase();
          if (!coincideTipo) return false;
        }
        const coincideNombre =
          !nombreBuscado ||
          normalizeText(donacion.nombre).includes(nombreBuscado);
        const coincideCorreo =
          !correoBuscado ||
          normalizeText(donacion.correo).includes(correoBuscado);
        if (!coincideNombre || !coincideCorreo) return false;

        if (rangoFechasValido(historialFechaDesde, historialFechaHasta)) {
          const fechaItem = new Date(
            donacion.fechaIngreso ?? 0,
          ).getTime();
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
      .sort((a, b) => {
        return (
          new Date(b.fechaIngreso ?? 0).getTime() -
          new Date(a.fechaIngreso ?? 0).getTime()
        );
      });
  }, [historial, historialFiltros, tipoFiltro, historialFechaDesde, historialFechaHasta]);

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

  return (
    <AdminModule className="gap-3!">
      {solicitudesNuevas !== null && solicitudesNuevas > 0 && (
        <NotificacionSolicitudesNuevas cantidad={solicitudesNuevas} />
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
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border-strong bg-surface p-3 shadow-sm">
        <AdminSearch
          type="text"
          placeholder="Nombre o apellidos"
          maxLength={30}
          value={nombreInput}
          onChange={(e) => setNombreInput(handleSoloLetrasNombre(e.target.value))}
          className="min-w-[200px] flex-1"
          aria-label="Filtrar por nombre"
        />
        <AdminSearch
          type="text"
          placeholder="Correo"
          maxLength={80}
          value={correoInput}
          onChange={(e) => setCorreoInput(handleCorreo(e.target.value))}
          className="min-w-[200px] flex-1"
          aria-label="Filtrar por correo"
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-muted">Desde</span>
          <input
            type="date"
            value={fechaDesde}
            max={fechaHasta || undefined}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            aria-label="Filtrar solicitudes desde fecha"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-muted">Hasta</span>
          <input
            type="date"
            value={fechaHasta}
            min={fechaDesde || undefined}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            aria-label="Filtrar solicitudes hasta fecha"
          />
        </label>
        <button
          type="button"
          onClick={limpiarFiltrosSolicitudes}
          disabled={!hayFiltrosSolicitudesActivos}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Limpiar filtros de solicitudes"
        >
          <RotateCcw size={15} strokeWidth={2} />
          Limpiar
        </button>
      </div>

      {fechaDesde && fechaHasta && !rangoFechasValido(fechaDesde, fechaHasta) && (
        <p className="m-0 text-xs font-semibold text-red-600">
          La fecha de inicio no puede ser mayor que la fecha de fin
        </p>
      )}

      {cargando && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2
            size={32}
            className="animate-spin text-text-muted"
          />
          <p className="m-0 text-sm text-text-secondary">
            Buscando registros...
          </p>
        </div>
      )}

      {error && !cargando && <ErrorMessage message={error} />}

      {mostrarEstadoVacio && (
        <div className="rounded-xl border border-border-strong bg-surface">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <Search
                size={28}
                strokeWidth={1.5}
                className="text-text-muted"
              />
            </span>
            <p className="m-0 max-w-md text-lg font-semibold text-text-secondary">
              No se encontraron registros
            </p>
            <p className="m-0 max-w-md text-sm text-text-muted">
              Intente con menos filtros o verifique la información ingresada
            </p>
          </div>
        </div>
      )}

      {!cargando && !error && !mostrarEstadoVacio && donaciones.length === 0 && (
        <EmptyState title="No hay donaciones registradas en el sistema." />
      )}

      {!cargando && !error && !mostrarEstadoVacio && donaciones.length > 0 && (
        <>
          <div className="hidden md:block">
            <AdminTablePanel>
              <AdminTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeaderCell>Fecha</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Donante</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Correo</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Teléfono</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                  </AdminTableRow>
                </AdminTableHead>
                <tbody>
                  {donacionesPagina.map((donacion: Donacion) => (
                    <AdminTableRow key={donacion.id}>
                      <AdminTableCell>
                        {formatearFecha(donacion.fecha)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <span
                          className={
                            donacion.anonimo
                              ? "font-medium italic text-slate-400"
                              : "font-medium"
                          }
                        >
                          {resaltarCoincidencia(
                            donacion.nombre,
                            filtros.nombre,
                          )}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        {resaltarCoincidencia(
                          donacion.correo,
                          filtros.correo,
                        )}
                      </AdminTableCell>
                      <AdminTableCell>
                        {donacion.telefono || (
                          <span className="text-slate-400 italic">
                            No provisto
                          </span>
                        )}
                      </AdminTableCell>
                      <AdminTableCell>
                        {renderEstadoBadge(donacion.estado)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <button
                          type="button"
                          onClick={() => abrirDetalle(donacion)}
                          aria-label="Ver solicitud"
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                        >
                          <Eye
                            size={17}
                            strokeWidth={1.5}
                          />
                        </button>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTablePanel>
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
            {donacionesPagina.map((donacion: Donacion) => (
              <AdminRecordCard
                key={donacion.id}
                icon={<HandHeart size={20} />}
                accent={donacion.anonimo ? "#64748b" : "#003366"}
                code={`DON-${donacion.id}`}
                    title={resaltarCoincidencia(
                      donacion.nombre,
                      filtros.nombre,
                    )}
                    subtitle={formatearFecha(donacion.fecha)}
                    badges={renderEstadoBadge(donacion.estado)}
                    meta={[
                      {
                        icon: <Mail size={12} />,
                        label: "Correo",
                        value: resaltarCoincidencia(
                          donacion.correo,
                          filtros.correo,
                        ),
                      },
                  {
                    icon: <Phone size={12} />,
                    label: "Teléfono",
                    value: donacion.telefono || "No provisto",
                  },
                ]}
                actions={[
                  {
                    label: "Ver solicitud",
                    icon: <Eye size={15} />,
                    variant: "primary",
                    onClick: () => abrirDetalle(donacion),
                  },
                ]}
              />
            ))}
          </div>

          <AdminTableFooter pegadoAbajo>
            <span className="text-sm text-text-muted">
              Mostrando{" "}
              <strong className="text-text tabular-nums">
                {primerRegistro}-{ultimoRegistro}
              </strong>{" "}
              de{" "}
              <strong className="text-text tabular-nums">
                {donacionesFiltradas.length}
              </strong>{" "}
              registros
            </span>
            <AdminPagination className="flex-wrap">
              <label className="mr-1 flex items-center gap-2 text-sm text-text-muted">
                Registros por página
                <select
                  value={registrosPorPagina}
                  onChange={(event) =>
                    setRegistrosPorPagina(Number(event.target.value))
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
                  setPaginaActual((pagina) => Math.max(1, pagina - 1))
                }
                disabled={paginaActual <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </AdminPaginationButton>
              <span className="text-sm whitespace-nowrap text-text-muted">
                Página{" "}
                <strong className="text-text tabular-nums">{paginaActual}</strong>{" "}
                de{" "}
                <strong className="text-text tabular-nums">{totalPaginas}</strong>
              </span>
              <AdminPaginationButton
                type="button"
                onClick={() =>
                  setPaginaActual((pagina) => Math.min(totalPaginas, pagina + 1))
                }
                disabled={paginaActual >= totalPaginas}
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </AdminPaginationButton>
            </AdminPagination>
          </AdminTableFooter>
        </>
      )}
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
              placeholder="Correo"
              maxLength={80}
              value={historialCorreoInput}
              onChange={(e) =>
                setHistorialCorreoInput(handleCorreo(e.target.value))
              }
              className="min-w-[200px] flex-1"
              aria-label="Filtrar historial por correo"
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
              <EmptyState title="Aún no hay donaciones en el historial." />
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
                          <AdminTableHeaderCell>Donante</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Correo</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Resolución</AdminTableHeaderCell>
                          <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                        </AdminTableRow>
                      </AdminTableHead>
                      <tbody>
                        {historialPaginaItems.map((donacion) => (
                          <AdminTableRow key={donacion.id}>
                            <AdminTableCell>
                              {formatearFecha(donacion.fechaIngreso ?? "")}
                            </AdminTableCell>
                            <AdminTableCell>
                              <span className="font-medium">
                                {donacion.nombre}
                              </span>
                            </AdminTableCell>
                            <AdminTableCell>{donacion.correo}</AdminTableCell>
                            <AdminTableCell>
                              {renderEstadoBadge(donacion.estado)}
                            </AdminTableCell>
                            <AdminTableCell>
                              <span
                                className="line-clamp-2 block text-sm text-text-secondary"
                                title={
                                  donacion.estado === "Aprobado"
                                    ? donacion.detalleAprobacion ||
                                      "Sin comentario"
                                    : donacion.motivoRechazo ||
                                      donacion.detalleRechazo ||
                                      "Sin motivo"
                                }
                              >
                                {donacion.estado === "Aprobado"
                                  ? donacion.detalleAprobacion || "Sin comentario"
                                  : donacion.motivoRechazo ||
                                    donacion.detalleRechazo ||
                                    "Sin motivo"}
                              </span>
                            </AdminTableCell>
                            <AdminTableCell>
                              <button
                                type="button"
                                onClick={() =>
                                  setHistorialSeleccionada(donacion)
                                }
                                aria-label="Ver historial de esta donación"
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                              >
                                <Eye
                                  size={17}
                                  strokeWidth={1.5}
                                />
                              </button>
                            </AdminTableCell>
                          </AdminTableRow>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminTablePanel>
                </div>

                <div className="flex flex-col gap-2.5 md:hidden">
                  {historialPaginaItems.map((donacion) => (
                    <AdminRecordCard
                      key={donacion.id}
                      icon={<HandHeart size={20} />}
                      accent={donacion.anonimo ? "#64748b" : "#003366"}
                      code={`DON-${donacion.id}`}
                      title={donacion.nombre}
                      subtitle={formatearFecha(donacion.fechaIngreso ?? "")}
                      badges={renderEstadoBadge(donacion.estado)}
                      meta={[
                        {
                          icon: <Mail size={12} />,
                          label: "Correo",
                          value: donacion.correo,
                        },
                        {
                          icon: <Phone size={12} />,
                          label: "Resolución",
                          value:
                            donacion.estado === "Aprobado"
                              ? donacion.detalleAprobacion || "Sin comentario"
                              : donacion.motivoRechazo || "Sin motivo",
                        },
                      ]}
                      actions={[
                        {
                          label: "Ver historial",
                          icon: <Eye size={15} />,
                          variant: "primary",
                          onClick: () => setHistorialSeleccionada(donacion),
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
                      {historial.length}
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

      <AnimatePresence>
        {donacionSeleccionada && (
          <motion.div
            className="fixed inset-0 z-[1300] bg-[#060f20]"
            initial={{ opacity: 0 }}
            animate={{ opacity: confirmacion ? 0 : 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {historialSeleccionada && (
        <Modal
          onClose={() => setHistorialSeleccionada(null)}
          title={`Historial de DON-${historialSeleccionada.id}`}
          sinFondo
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
                    {historialSeleccionada.nombre}
                  </p>
                  <p className="m-0 text-sm text-text-secondary">
                    {historialSeleccionada.correo}
                    {historialSeleccionada.telefono
                      ? ` · ${historialSeleccionada.telefono}`
                      : ""}
                  </p>
                  <p className="m-0 text-xs text-text-muted">
                    Fecha de ingreso:{" "}
                    {formatearFecha(
                      historialSeleccionada.fechaIngreso ?? "",
                    )}
                  </p>
                </div>
                {renderEstadoBadge(historialSeleccionada.estado)}
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="m-0 text-xs font-bold tracking-wide text-text-muted uppercase">
                  Detalle de la donación
                </p>
                <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {historialSeleccionada.detalle}
                </p>
              </div>

              {historialSeleccionada.estado === "Aprobado" ? (
                <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <Badge variant="success">Aprobado</Badge>
                  <p className="m-0 text-sm text-emerald-900">
                    {historialSeleccionada.detalleAprobacion ||
                      "Sin comentario de aprobación"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
                  <Badge variant="danger">Rechazado</Badge>
                  <p className="m-0 text-sm font-semibold text-red-900">
                    {historialSeleccionada.motivoRechazo || "Motivo no especificado"}
                  </p>
                  {historialSeleccionada.detalleRechazo && (
                    <p className="m-0 text-sm text-red-800">
                      {historialSeleccionada.detalleRechazo}
                    </p>
                  )}
                  {historialSeleccionada.fechaRechazo && (
                    <p className="m-0 text-xs text-red-700">
                      Rechazado el{" "}
                      {formatearFecha(historialSeleccionada.fechaRechazo)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </Modal>
      )}

      {donacionSeleccionada && !confirmacion && !isRejectModalOpen && (
        <DonacionDetalleModal
          donacion={donacionSeleccionada}
          formatearFecha={formatearFecha}
          onClose={cerrarDetalle}
          onAprobar={() => abrirConfirmacion("aprobar")}
          onRechazar={() => abrirConfirmacion("rechazar")}
        />
      )}

      {confirmacion === "aprobar" && donacionSeleccionada && (
        <Modal
          onClose={cancelarConfirmacion}
          title="Confirmar aprobación"
          sinFondo
          cerrarAlClicFuera={false}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex min-h-44 flex-col gap-4">
              <LineaDoradaTitulo parteSubrayada="Aprobar donativo" />
              <p className="text-sm leading-relaxed text-text-secondary">
                ¿Estás seguro/a que quieres aprobar este donativo? Una vez
                aprobado su estado no podrá ser cambiado.
              </p>
              <Textarea
                value={approvalDetail}
                onChange={(e) => setApprovalDetail(e.target.value)}
                placeholder="Agregue un comentario (opcional)"
                rows={3}
                maxLength={150}
                className="min-h-20"
              />
              <div className="-mt-2 flex items-baseline justify-between gap-2">
                {tieneCaracteresInvalidos(approvalDetail) && (
                  <p className="m-0 text-xs font-semibold text-red-600">
                    Los caracteres especiales no están permitidos
                  </p>
                )}
                <p
                  className={`m-0 ml-auto text-xs ${
                    approvalDetail.length >= 150
                      ? "font-semibold text-red-600"
                      : "text-text-muted"
                  }`}
                >
                  {approvalDetail.length}/150
                </p>
              </div>
              <div className="flex shrink-0 justify-end gap-2">
                <Button
                  variant="royal"
                  className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
                  onClick={() =>
                    void confirmarCambioEstado(
                      "Aprobado",
                      approvalDetail.trim() || undefined,
                    )
                  }
                  disabled={
                    guardando || tieneCaracteresInvalidos(approvalDetail)
                  }
                >
                  {guardando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Aprobando...
                    </>
                  ) : (
                    "Aprobar"
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
                  onClick={cancelarConfirmacion}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}

      {isRejectModalOpen && donacionSeleccionada && (
        <Modal
          onClose={
            isConfirmRejectOpen ? handleCancelConfirmReject : () => cerrarRechazo()
          }
          title={isConfirmRejectOpen ? "Confirmar rechazo" : "Rechazar donativo"}
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
                <LineaDoradaTitulo parteSubrayada="Rechazar donativo" />
                <div className="flex flex-1 items-center justify-center px-8 py-4 text-center">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    ¿Estás seguro/a que quieres rechazar este donativo? Una vez
                    rechazado, su estado no podrá ser cambiado.
                  </p>
                </div>
                <div className="flex shrink-0 justify-end gap-2">
                  <Button
                    variant="royal"
                    className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
                    onClick={() => void handleRejectSubmit()}
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
                    className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
                    onClick={handleCancelConfirmReject}
                    disabled={guardando}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-44 flex-col gap-4">
                <LineaDoradaTitulo parteSubrayada="Rechazar donativo" />
                <p className="text-sm text-text-secondary">
                  Seleccione el motivo de rechazo en la lista. El campo de texto
                  es opcional para agregar un detalle.
                </p>
                <div className="relative" ref={motivoMenuRef}>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={motivoMenuAbierto}
                    onClick={() => setMotivoMenuAbierto((prev) => !prev)}
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none hover:bg-slate-200 ${
                      motivoMenuAbierto
                        ? "border-blue-400 bg-surface"
                        : "border-border-strong"
                    }`}
                  >
                    <span
                      className={
                        rejectionReasonSelect
                          ? "font-semibold text-[#16243c]"
                          : "font-medium text-slate-700"
                      }
                    >
                      {rejectionReasonSelect || "Seleccione un motivo"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-900 transition-transform duration-200 ${
                        motivoMenuAbierto ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {motivoMenuAbierto && (
                      <FocusTrap
                        focusTrapOptions={{
                          clickOutsideDeactivates: false,
                          escapeDeactivates: false,
                          allowOutsideClick: () => true,
                        }}
                      >
                        <motion.ul
                          role="listbox"
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border-strong bg-white p-1 shadow-[0_16px_35px_rgba(6,15,32,0.18)]"
                        >
                          {rejectionReasons.map((reason) => (
                            <li
                              key={reason}
                              role="option"
                              aria-selected={rejectionReasonSelect === reason}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectionReasonSelect(reason);
                                  setMotivoError(null);
                                  setMotivoMenuAbierto(false);
                                }}
                                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none ${
                                  rejectionReasonSelect === reason
                                    ? "bg-[#aa7323]/10 text-[#16243c]"
                                    : "text-[#16243c] hover:bg-[#aa7323]/15 hover:text-[#aa7323]"
                                }`}
                              >
                                {reason}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      </FocusTrap>
                    )}
                  </AnimatePresence>
                </div>
                <Textarea
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="Detalle un motivo personalizado (opcional)"
                  rows={3}
                  maxLength={150}
                  className="min-h-20"
                />
                <div className="-mt-2 flex items-baseline justify-between gap-2">
                  {motivoError && (
                    <p className="m-0 text-xs font-semibold text-red-600">
                      {motivoError}
                    </p>
                  )}
                  {tieneCaracteresInvalidos(rejectionReasonText) && (
                    <p className="m-0 text-xs font-semibold text-red-600">
                      Los caracteres especiales no están permitidos
                    </p>
                  )}
                  <p
                    className={`m-0 ml-auto text-xs ${
                      rejectionReasonText.length >= 150
                        ? "font-semibold text-red-600"
                        : "text-text-muted"
                    }`}
                  >
                    {rejectionReasonText.length}/150
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="royal"
                    className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
                    onClick={handleOpenConfirmReject}
                    disabled={
                      !rejectionReasonSelect.trim() ||
                      tieneCaracteresInvalidos(rejectionReasonText)
                    }
                  >
                    Continuar
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
                    onClick={() => cerrarRechazo()}
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
    </AdminModule>
  );
}
