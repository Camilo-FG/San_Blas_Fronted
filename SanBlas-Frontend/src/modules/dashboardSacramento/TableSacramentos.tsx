import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import FocusTrap from "focus-trap-react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Phone,
  IdCard,
  Eye,
  Search,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import type { FormSacramento } from "../../types/formSacramento";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useGetSolicitudes } from "../solicSacramento/hooks/useGetSolicitudes";
import { useUpdateSolicitudEstado } from "../solicSacramento/hooks/useUpdateSolicitudEstado";
import { useAprobarSolicitud } from "../solicSacramento/hooks/useAprobarSolicitud";
import { useRechazarSolicitudSacramento } from "../solicSacramento/hooks/useRechazarSolicitudSacramento";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { ApiError } from "../../services/apiClient";
import { toFriendlySolicitudesMessage } from "../../services/constancias/solicitudesQueryHandler";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import Rutas from "../../routes/Rutas";
import { AdminRecordCard } from "../../shared/components/admin/AdminRecordCard";
import {
  AdminModule,
  AdminPagination,
  AdminPaginationButton,
  AdminTable,
  AdminTableCell,
  AdminTableFooter,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  AdminToolbar,
  Badge,
  Button,
  Modal,
  Select,
  Textarea,
  cn,
  type BadgeVariant,
  useToast,
} from "../../shared/ui";

const columnHelper = createColumnHelper<FormSacramento>();
const PAGE_SIZE = 10;

const EtiquetaSeccion = ({ children }: { children: ReactNode }) => (
  <span className="m-0 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#16243c] uppercase">
    <span
      className="h-3 w-px bg-[#aa7323]"
      aria-hidden="true"
    />
    {children}
  </span>
);

const LineaDoradaTitulo = () => {
  const refContenedor = useRef<HTMLDivElement>(null);
  const refTexto = useRef<HTMLSpanElement>(null);
  const [medidas, setMedidas] = useState({ ancho: 0, top: 0 });

  useLayoutEffect(() => {
    const contenedor = refContenedor.current;
    const span = refTexto.current;
    if (!contenedor || !span) return;
    const estilos = window.getComputedStyle(span);
    const fontSize = parseFloat(estilos.fontSize);
    const lineaBase = span.offsetTop + span.offsetHeight - fontSize * 0.24;
    setMedidas({ ancho: span.offsetWidth, top: lineaBase + 8 });
  }, []);

  return (
    <div ref={refContenedor} className="relative w-fit">
      <h2
        className="m-0 mt-1 pb-2 text-lg leading-tight font-semibold tracking-tight text-[#16243c]"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        <span ref={refTexto}>Aprobar solicitud sac</span>
        ramental
      </h2>
      {medidas.ancho > 0 && (
        <motion.div
          className="absolute left-0 h-[3px] origin-left rounded-full bg-[#dcb55a]"
          style={{ top: medidas.top, width: medidas.ancho }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.45, 0, 0.35, 1] }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

const ESTADO_MODAL_STYLES = {
  Pendiente: {
    dot: "bg-[#aa7323]",
    pill: "border-[#aa7323]/30 bg-[#aa7323]/10 text-[#aa7323]",
  },
  Aprobado: {
    dot: "bg-emerald-600",
    pill: "border-emerald-600/25 bg-emerald-600/10 text-emerald-700",
  },
  Rechazado: {
    dot: "bg-red-600",
    pill: "border-red-600/25 bg-red-600/10 text-red-700",
  },
} as const;

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");
const formatearCedula = (valor: string) => {
  const digitos = soloDigitos(valor).slice(0, 9);
  if (digitos.length <= 1) return digitos;
  if (digitos.length <= 5) return `${digitos.slice(0, 1)}-${digitos.slice(1)}`;
  return `${digitos.slice(0, 1)}-${digitos.slice(1, 5)}-${digitos.slice(5)}`;
};

const formatearTelefono = (valor: string) => {
  const digitos = soloDigitos(String(valor ?? "")).slice(0, 8);
  if (digitos.length <= 4) return digitos;
  return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
};
const nombreCompleto = (row: FormSacramento) =>
  [row.Nombre, row.PrimerApellido].filter(Boolean).join(" ");

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toFechaTime = (fecha?: string) => {
  if (!fecha) return Number.NEGATIVE_INFINITY;
  const t = new Date(fecha).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
};

const getEstadoBadgeVariant = (estado?: string): BadgeVariant => {
  const normalized = (estado ?? "Pendiente").toLowerCase();
  if (normalized === "aprobado") return "success";
  if (normalized === "rechazado") return "danger";
  return "warning";
};

const TableSacramentos = () => {
  const navigate = useNavigate();
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCedula, setFiltroCedula] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "Pendiente" | "Aprobado" | "Rechazado" | ""
  >("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<FormSacramento | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReasonSelect, setRejectionReasonSelect] = useState("");
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [solicitudARechazar, setSolicitudARechazar] =
    useState<FormSacramento | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [solicitudAAprobar, setSolicitudAAprobar] =
    useState<FormSacramento | null>(null);
  const [estadoMenuAbierto, setEstadoMenuAbierto] = useState(false);
  const estadoMenuRef = useRef<HTMLDivElement>(null);
  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [filtroEstadoMenuAbierto, setFiltroEstadoMenuAbierto] = useState(false);
  const filtroEstadoMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (
        estadoMenuRef.current &&
        !estadoMenuRef.current.contains(event.target as Node)
      ) {
        setEstadoMenuAbierto(false);
      }
      if (
        filtroEstadoMenuRef.current &&
        !filtroEstadoMenuRef.current.contains(event.target as Node)
      ) {
        setFiltroEstadoMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  useEffect(() => {
    if (!solicitudSeleccionada) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSolicitudSeleccionada(null);
    };

    const main = document.querySelector("main");
    const prevBodyOverflow = document.body.style.overflow;
    const prevMainOverflow = main?.style.overflow ?? "";

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";

    const backdrop = modalBackdropRef.current;
    const bloquearRueda = (event: WheelEvent) => {
      if (!modalBodyRef.current?.contains(event.target as Node)) {
        event.preventDefault();
      }
    };
    backdrop?.addEventListener("wheel", bloquearRueda, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      backdrop?.removeEventListener("wheel", bloquearRueda);
      document.body.style.overflow = prevBodyOverflow;
      if (main) main.style.overflow = prevMainOverflow;
    };
  }, [solicitudSeleccionada]);

  const [currentPage, setCurrentPage] = useState(1);
  const debouncedNombre = useDebouncedValue(filtroNombre.trim(), 500);
  const debouncedCedula = useDebouncedValue(filtroCedula.trim(), 500);
  const debouncedEstado = useDebouncedValue(filtroEstado, 300);
  const filters = useMemo(
    () => ({
      nombre: debouncedNombre || undefined,
      cedula: debouncedCedula || undefined,
      estado: debouncedEstado || undefined,
      page: currentPage,
    }),
    [debouncedNombre, debouncedCedula, debouncedEstado, currentPage],
  );
  const filtersChanged = `${debouncedNombre}|${debouncedCedula}|${debouncedEstado}`;
  useEffect(() => {
    setCurrentPage(1);
  }, [filtersChanged]);
  const { isAdmin } = useAuth();
  const { data, error, isPending, isFetching, refetch } =
    useGetSolicitudes(filters);
  const updateEstado = useUpdateSolicitudEstado();
  const aprobarSolicitud = useAprobarSolicitud();
  const rechazarSolicitud = useRechazarSolicitudSacramento();
  const isUpdatingEstado = updateEstado.isPending;
  const isSubmitting = rechazarSolicitud.isPending;
  const { showToast } = useToast();

  const rows: FormSacramento[] = data?.data ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;
  const isInitialLoading = isPending && rows.length === 0;
  const isFiltering = isFetching && !isInitialLoading;

  const filteredRows = useMemo(
    () =>
      rows
        .filter((row) => {
          const matchNombre =
            !filtroNombre.trim() ||
            normalizeText(nombreCompleto(row)).includes(
              normalizeText(filtroNombre),
            );
          const matchCedula =
            !filtroCedula.trim() ||
            normalizeText(String(row.Cedula)).includes(
              normalizeText(filtroCedula),
            );
          const matchEstado = !filtroEstado || row.Estado === filtroEstado;
          return matchNombre && matchCedula && matchEstado;
        })
        .sort((a, b) => toFechaTime(b.Fecha) - toFechaTime(a.Fecha)),
    [rows, filtroNombre, filtroCedula, filtroEstado],
  );

  const rejectionReasons = [
    "Documentación incompleta",
    "Falta fe de bautismo",
    "Comprobante de pago inválido",
    "Datos incorrectos",
    "No cumple requisitos",
    "Otro",
  ];

  const handleOpenRejectModal = (solicitud: FormSacramento) => {
    setSolicitudARechazar(solicitud);
    setRejectionReasonSelect("");
    setRejectionReasonText("");
    setIsRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReasonSelect("");
    setRejectionReasonText("");
    setSolicitudARechazar(null);
  };

  const handleRejectSubmit = async () => {
    const motivo = rejectionReasonSelect.trim() || rejectionReasonText.trim();
    if (!solicitudARechazar || solicitudARechazar.id == null || !motivo) return;

    try {
      await rechazarSolicitud.mutateAsync({
        id: solicitudARechazar.id,
        motivoRechazo: motivo,
        detalleRechazo: rejectionReasonText.trim() || undefined,
      });
      showToast("Solicitud rechazada correctamente", "error");
      handleCloseRejectModal();
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo rechazar la solicitud.";
      showToast(mensaje, "error");
    }
  };

  const handleReasonSelectChange = (value: string) => {
    setRejectionReasonSelect(value);
  };

  const handleReasonTextChange = (value: string) => {
    setRejectionReasonText(value);
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "solicitante",
        header: () => "Solicitante",
        cell: (info) => (
          <span className="font-medium text-text">
            {nombreCompleto(info.row.original)}
          </span>
        ),
      }),
      columnHelper.accessor("Cedula", {
        header: () => "Cédula",
        cell: (info) => (
          <span className="tabular-nums text-text-secondary">
            {formatearCedula(String(info.getValue() ?? ""))}
          </span>
        ),
      }),
      columnHelper.accessor("Fecha", {
        header: () => "Fecha",
        cell: (info) => (
          <span className="text-text-secondary">{info.getValue() || "—"}</span>
        ),
      }),
      columnHelper.display({
        id: "contacto",
        header: () => "Contacto",
        cell: (info) => {
          const r = info.row.original;
          return (
            <span className="flex flex-col gap-0.5 text-xs leading-snug text-text-secondary">
              <span>{r.Correo}</span>
              <span className="tabular-nums">
                {r.Telefono?.toString() || "—"}
              </span>
            </span>
          );
        },
      }),
      columnHelper.accessor("Estado", {
        header: () => "Estado",
      }),
      columnHelper.display({
        id: "motivo",
        header: () => "Motivo",
        cell: (info) => (
          <button
            type="button"
            onClick={() => setSolicitudSeleccionada(info.row.original)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent px-2 py-1.5 text-[0.7rem] font-bold tracking-wider text-info uppercase transition-colors hover:bg-info-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Eye
              size={13}
              strokeWidth={1.5}
            />
            Ver motivo
          </button>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEstadoChange = (
    id: number | string | undefined,
    nextEstado: "Pendiente" | "Aprobado" | "Rechazado",
  ) => {
    if (id === undefined || id === null) return;

    const solicitud = rows.find((r) => String(r.id) === String(id));
    const estadoActual = solicitud?.Estado ?? "Pendiente";

    // Los estados "Aprobado" y "Rechazado" son permanentes e irreversibles
    if (estadoActual === "Aprobado" || estadoActual === "Rechazado") {
      return;
    }

    // Si se selecciona "Rechazado", abrir modal de rechazo en lugar de actualizar directamente
    if (nextEstado === "Rechazado") {
      if (solicitud) {
        setSolicitudSeleccionada(null); // Cerrar modal de detalle
        handleOpenRejectModal(solicitud); // Abrir modal de rechazo
      }
      return;
    }

    if (nextEstado === "Aprobado") {
      const solicitud = rows.find((r) => String(r.id) === String(id));
      if (solicitud) {
        setIsApproveModalOpen(true);
        setSolicitudAAprobar(solicitud);
      }
      return;
    }

    updateEstado.mutate(
      { id, nuevoEstado: nextEstado },
      {
        onSuccess: () => {
          if (
            solicitudSeleccionada &&
            String(solicitudSeleccionada.id) === String(id)
          ) {
            setSolicitudSeleccionada({
              ...solicitudSeleccionada,
              Estado: nextEstado,
            });
          }
        },
        onError: (err: unknown) => {
          const mensaje =
            err instanceof ApiError
              ? err.message
              : "No se pudo actualizar el estado.";
          showToast(mensaje, "error");
        },
      },
    );
  };

  const handleApproveConfirm = () => {
    if (!solicitudAAprobar) return;
    aprobarSolicitud.mutate(
      { id: solicitudAAprobar.id },
      {
        onSuccess: () => {
          setIsApproveModalOpen(false);
          setSolicitudAAprobar(null);
          setSolicitudSeleccionada(null);
          showToast("Solicitud aprobada correctamente", "success");
        },
        onError: (err: unknown) => {
          // El modal permanece abierto, el botón "Confirmar" se reactiva solo
          // (isPending vuelve a false) y el estado de la tabla no cambia
const mensaje =
              err instanceof Error && err.message
                ? err.message
                : "No hay conexión a Internet, inténtalo más tarde.";
          showToast(mensaje, "error");
        },
      },
    );
  };

  const handleCancelApprove = () => {
    const restoredSolicitud = solicitudAAprobar;
    setIsApproveModalOpen(false);
    setSolicitudAAprobar(null);
    setSolicitudSeleccionada(restoredSolicitud);
  };

  const estadoActualSolicitud = solicitudSeleccionada?.Estado ?? "Pendiente";
  const esEstadoPermanente =
    estadoActualSolicitud === "Aprobado" ||
    estadoActualSolicitud === "Rechazado";

  const renderEstadoBadge = (estado?: string) => {
    const currentEstado = estado ?? "Pendiente";
    return (
      <Badge variant={getEstadoBadgeVariant(currentEstado)}>
        {currentEstado}
      </Badge>
    );
  };

  if (error) {
    const mensaje = toFriendlySolicitudesMessage(error);
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-bg p-4 text-sm text-danger">
        <p className="m-0">{mensaje}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <AdminModule className="p-2">
      <AdminToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate({ to: Rutas.dashboardUrl.historialRechazos })
            }
          >
            Ver historial de rechazos
          </Button>
          <input
            type="text"
            value={filtroNombre}
            onChange={(e) =>
              setFiltroNombre(
                e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""),
              )
            }
            placeholder="Nombre completo"
            className="min-h-11 w-full rounded-xl border border-border-strong bg-surface-muted py-2.5 pr-3.5 pl-2 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none min-w-[200px] flex-1"
            aria-label="Filtrar por nombre completo"
            style={{ width: "200px" }}
          />
          <input
            type="text"
            inputMode="numeric"
            value={filtroCedula || ""}
            onChange={(e) => setFiltroCedula(e.target.value.replace(/\D/g, ""))}
            placeholder="Cédula"
            className="min-h-11 w-full rounded-xl border border-border-strong bg-surface-muted py-2.5 pr-3.5 pl-2 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none min-w-[200px] flex-1"
            aria-label="Filtrar por cédula"
            style={{ width: "120px" }}
          />
          <div
            className="relative"
            ref={filtroEstadoMenuRef}
          >
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={filtroEstadoMenuAbierto}
              onClick={() => setFiltroEstadoMenuAbierto((prev) => !prev)}
              className="flex w-[150px] cursor-pointer items-center justify-between gap-2 rounded border border-slate-300 bg-surface px-2 py-1 text-sm text-slate-800 transition-colors hover:bg-surface-muted"
            >
              <span>{filtroEstado || "Todos"}</span>
              <ChevronDown
                size={14}
                strokeWidth={2.5}
                className={`transition-transform duration-200 ${
                  filtroEstadoMenuAbierto ? "rotate-180" : ""
                }`}
              />
            </button>

            {filtroEstadoMenuAbierto && (
              <ul
                role="listbox"
                className="absolute top-full left-0 z-50 mt-1.5 w-[150px] overflow-hidden rounded-xl border-0 bg-surface p-1 shadow-[0_16px_35px_rgba(0,0,0,0.18)]"
              >
                {(
                  [
                    { valor: "", label: "Todos" },
                    { valor: "Pendiente", label: "Pendiente" },
                    { valor: "Aprobado", label: "Aprobado" },
                    { valor: "Rechazado", label: "Rechazado" },
                  ] as const
                ).map((opcion) => {
                  const activo = filtroEstado === opcion.valor;
                  return (
                    <li
                      key={opcion.label}
                      role="option"
                      aria-selected={activo}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFiltroEstado(
                            opcion.valor as
                              | "Pendiente"
                              | "Aprobado"
                              | "Rechazado"
                              | "",
                          );
                          setFiltroEstadoMenuAbierto(false);
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
          {isFiltering && (
            <Loader2
              size={18}
              className="animate-spin text-text-muted"
              aria-label="Aplicando filtros"
            />
          )}
        </div>
      </AdminToolbar>

      {isInitialLoading && (
        <p className="py-6 text-center text-sm text-text-muted">
          Cargando solicitudes...
        </p>
      )}

      {!isInitialLoading && filteredRows.length === 0 && (
        <p className="py-6 text-center text-sm text-text-muted">
          {filtroNombre.trim() || filtroCedula.trim() || filtroEstado
            ? "No se encontraron solicitudes con los filtros seleccionados."
            : "Actualmente no existen solicitudes registradas."}
        </p>
      )}

      {!isInitialLoading && filteredRows.length > 0 && (
        <>
          <div className="hidden md:block">
            <AdminTablePanel>
              <AdminTable className="table-fixed">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[15%]" />
                  <col className="w-[13%]" />
                  <col className="w-[24%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <AdminTableHead>
                  {table.getHeaderGroups().map((hg) => (
                    <AdminTableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <AdminTableHeaderCell key={h.id}>
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext(),
                              )}
                        </AdminTableHeaderCell>
                      ))}
                    </AdminTableRow>
                  ))}
                </AdminTableHead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <AdminTableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        if (cell.column.id === "Estado") {
                          const originalRow = row.original;
                          const currentEstado =
                            originalRow.Estado ?? "Pendiente";
                          return (
                            <AdminTableCell key={cell.id}>
                              {renderEstadoBadge(currentEstado)}
                            </AdminTableCell>
                          );
                        }
                        return (
                          <AdminTableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </AdminTableCell>
                        );
                      })}
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTablePanel>
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
            {table.getRowModel().rows.map(({ original: row }) => (
              <AdminRecordCard
                key={String(row.id)}
                icon={<ScrollText size={20} />}
                accent="#1d4ed8"
                code={`SOL-${row.id}`}
                title={nombreCompleto(row)}
                badges={renderEstadoBadge(row.Estado)}
                meta={[
                  {
                    icon: <IdCard size={12} />,
                    label: "Cédula",
                    value: String(row.Cedula ?? "—"),
                  },
                  {
                    icon: <Phone size={12} />,
                    label: "Teléfono",
                    value: row.Telefono?.toString() || "No provisto",
                  },
                ]}
                actions={[
                  {
                    label: "Ver solicitud",
                    icon: <Eye size={15} />,
                    variant: "primary",
                    onClick: () => setSolicitudSeleccionada(row),
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}

      {solicitudSeleccionada && (
        <div
          ref={modalBackdropRef}
          className="fixed inset-0 z-[1300] flex items-end justify-center bg-[#060f20]/70 md:items-center md:p-4"
          role="presentation"
          onClick={() => setSolicitudSeleccionada(null)}
        >
          <FocusTrap
            focusTrapOptions={{
              clickOutsideDeactivates: false,
              escapeDeactivates: false,
            }}
          >
            <div
              className="flex w-full flex-col rounded-[16px] bg-white shadow-[0_24px_64px_rgba(6,15,32,0.45)] md:max-w-[768px]"
            style={{ fontFamily: "'Geist', sans-serif" }}
            role="dialog"
            aria-modal="true"
            aria-label="Datos de la solicitud"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-4 rounded-t-[16px] bg-[#f1f5fa] px-6 py-4">
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-semibold tracking-[0.22em] text-[#aa7323] uppercase">
                  Solicitud
                </p>
                <h2
                  className="m-0 mt-1 text-[24px] leading-tight font-semibold tracking-tight text-[#16243c]"
                  style={{ fontFamily: "'Geist', sans-serif" }}
                >
                  Datos de la solicitud
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSolicitudSeleccionada(null)}
                aria-label="Cerrar detalle"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[#16243c]/10 bg-white text-[#16243c] focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
              >
                <X size={16} />
              </button>
            </header>

            <div
              ref={modalBodyRef}
              className="flex flex-col gap-4 p-6"
            >
              <div className="grid items-stretch gap-4 md:grid-cols-2">
                <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                  <EtiquetaSeccion>Nombre del solicitante</EtiquetaSeccion>
                  <p className="m-0 text-sm font-semibold text-[#16243c]">
                    {nombreCompleto(solicitudSeleccionada)}
                  </p>
                </section>

                <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                  <EtiquetaSeccion>Contacto</EtiquetaSeccion>
                  <div className="flex items-start gap-2">
                    <Mail
                      size={16}
                      className="mt-0.5 shrink-0 text-[#aa7323]"
                    />
                    <div className="min-w-0">
                      <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
                        Correo
                      </p>
                      <p className="m-0 mt-1 break-words text-sm font-semibold text-[#16243c]">
                        {solicitudSeleccionada.Correo || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-[#16243c]/10" />
                  <div className="flex items-start gap-2">
                    <Phone
                      size={16}
                      className="mt-0.5 shrink-0 text-[#aa7323]"
                    />
                    <div className="min-w-0">
                      <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
                        Teléfono
                      </p>
                      <p className="m-0 mt-1 text-sm font-semibold tabular-nums text-[#16243c]">
                        {formatearTelefono(solicitudSeleccionada.Telefono) || "—"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
                <EtiquetaSeccion>Motivo</EtiquetaSeccion>
                <p className="m-0 min-w-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c]">
                  {solicitudSeleccionada.Motivo || "—"}
                </p>
              </section>

              <div className="grid gap-4 rounded-[12px] border border-[#aa7323]/25 bg-[#aa7323]/[0.07] p-4 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <EtiquetaSeccion>Estado actual</EtiquetaSeccion>
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                      ESTADO_MODAL_STYLES[
                        solicitudSeleccionada.Estado ?? "Pendiente"
                      ].pill
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        ESTADO_MODAL_STYLES[
                          solicitudSeleccionada.Estado ?? "Pendiente"
                        ].dot
                      }`}
                    />
                    {solicitudSeleccionada.Estado ?? "Pendiente"}
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-3">
                    <EtiquetaSeccion>Cambiar estado</EtiquetaSeccion>
                    <div
                      className="relative"
                      ref={estadoMenuRef}
                    >
                      <button
                        type="button"
                        disabled={isUpdatingEstado || esEstadoPermanente}
                        aria-haspopup="listbox"
                        aria-expanded={estadoMenuAbierto}
                        onClick={() => setEstadoMenuAbierto((prev) => !prev)}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[8px] border border-[#16243c]/10 bg-white px-3 py-2.5 text-sm font-medium text-[#16243c] transition-colors duration-200 hover:border-[#aa7323]/60 hover:bg-[#f1f5fa] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                      >
                        <span>
                          {solicitudSeleccionada.Estado ?? "Pendiente"}
                          {esEstadoPermanente ? " (permanente)" : ""}
                        </span>
                        <ChevronDown
                          size={16}
                          strokeWidth={2.5}
                          className={`transition-transform duration-200 ${
                            estadoMenuAbierto ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {estadoMenuAbierto && (
                        <ul
                          role="listbox"
                          className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-[8px] border border-[#16243c]/10 bg-white p-1 shadow-[0_16px_35px_rgba(6,15,32,0.18)]"
                        >
                          {(
                            [
                              {
                                valor: "Aprobado",
                                dot: ESTADO_MODAL_STYLES.Aprobado.dot,
                              },
                              {
                                valor: "Rechazado",
                                dot: ESTADO_MODAL_STYLES.Rechazado.dot,
                              },
                            ] as const
                          ).map((opcion) => {
                            const activo =
                              (solicitudSeleccionada.Estado ?? "Pendiente") ===
                              opcion.valor;
                            return (
                              <li
                                key={opcion.valor}
                                role="option"
                                aria-selected={activo}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (opcion.valor === "Rechazado") {
                                      handleEstadoChange(
                                        solicitudSeleccionada.id,
                                        "Rechazado",
                                      );
                                    } else {
                                      setSolicitudAAprobar(
                                        solicitudSeleccionada,
                                      );
                                      setIsApproveModalOpen(true);
                                    }
                                    setEstadoMenuAbierto(false);
                                  }}
                                  className={`flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none ${
                                    activo
                                      ? "bg-[#aa7323]/10 text-[#16243c]"
                                      : "text-[#16243c] hover:bg-[#aa7323]/15 hover:text-[#aa7323]"
                                  }`}
                                >
                                  <span
                                    className={`size-1.5 shrink-0 rounded-full ${opcion.dot}`}
                                  />
                                  {opcion.valor}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}

      {isRejectModalOpen && (
        <Modal
          onClose={handleCloseRejectModal}
          title="Rechazar solicitud"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              Seleccione o escriba el motivo de rechazo para esta solicitud:
            </p>
            <Select
              value={rejectionReasonSelect}
              onChange={(e) => handleReasonSelectChange(e.target.value)}
              className="w-full"
              defaultValue=""
            >
              <option value="">-- Seleccione un motivo --</option>
              {rejectionReasons.map((reason) => (
                <option
                  key={reason}
                  value={reason}
                >
                  {reason}
                </option>
              ))}
            </Select>
            <Textarea
              value={rejectionReasonText}
              onChange={(e) => handleReasonTextChange(e.target.value)}
              placeholder="O escriba un motivo personalizado..."
              rows={3}
              className="min-h-20"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={handleCloseRejectModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectSubmit}
                disabled={
                  (!rejectionReasonSelect.trim() &&
                    !rejectionReasonText.trim()) ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Rechazando...
                  </>
                ) : (
                  "Confirmar rechazo"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isApproveModalOpen && solicitudAAprobar && (
        <Modal
          onClose={handleCancelApprove}
          title="Confirmar aprobación"
          sinFondo
        >
            <div className="flex min-h-44 flex-col">
              <LineaDoradaTitulo />
              <div className="flex flex-1 items-center justify-center px-8 py-4 text-center">
                <p className="text-sm leading-relaxed text-text-secondary">
                  ¿Estás seguro/a que quieres aprobar esta solicitud de
                  sacramento? Una vez aprobada su estado no podrá ser cambiado.
                </p>
              </div>
              <div className="flex shrink-0 justify-end gap-2">
                <Button
                  variant="royal"
                  className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! hover:text-[#dcb55a]"
                  onClick={handleApproveConfirm}
                  disabled={aprobarSolicitud.isPending}
                >
                  {aprobarSolicitud.isPending ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Aprobando...
                    </>
                  ) : (
                    "Aprobar"
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
                  onClick={handleCancelApprove}
                  disabled={aprobarSolicitud.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
        </Modal>
      )}

      {!isInitialLoading && table.getRowModel().rows.length > 0 && (
        <AdminTableFooter>
          <span className="text-sm text-text-muted">
            <strong className="text-text">{totalItems}</strong> registros
          </span>
          <AdminPagination>
            <AdminPaginationButton
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={!canPreviousPage}
              aria-label="Página anterior"
            >
              <ChevronLeft
                size={16}
                strokeWidth={2}
              />
            </AdminPaginationButton>
            <span className="text-sm text-text-muted">
              <strong className="text-text">{currentPage}</strong> de{" "}
              <strong className="text-text">{totalPages}</strong>
            </span>
            <AdminPaginationButton
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={!canNextPage}
              aria-label="Página siguiente"
            >
              <ChevronRight
                size={16}
                strokeWidth={2}
              />
            </AdminPaginationButton>
          </AdminPagination>
        </AdminTableFooter>
      )}
    </AdminModule>
  );
};

export default TableSacramentos;
