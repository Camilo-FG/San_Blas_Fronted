import { useEffect, useMemo, useRef, useState } from "react";
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
import { useRechazarSolicitudSacramento } from "../solicSacramento/hooks/useRechazarSolicitudSacramento";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { ApiError } from "../../services/apiClient";
import { toFriendlySolicitudesMessage } from "../../services/constancias/solicitudesQueryHandler";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import Rutas from "../../routes/Rutas";
import { AdminRecordCard } from "../../shared/components/admin/AdminRecordCard";
import { AdminRecordDetailSheet } from "../../shared/components/admin/AdminRecordDetailSheet";
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
const nombreCompleto = (row: FormSacramento) =>
  [row.Nombre, row.PrimerApellido, row.SegundoApellido]
    .filter(Boolean)
    .join(" ");

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
      showToast("Solicitud rechazada correctamente", "success");
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

  const confirmarAprobacion = () => {
    if (!solicitudAAprobar?.id) return;

    updateEstado.mutate(
      { id: solicitudAAprobar.id, nuevoEstado: "Aprobado" },
      {
        onSuccess: () => {
          setSolicitudAprobar(null);
          showToast("Solicitud aprobada correctamente", "success");
        },
        onError: (err: unknown) => {
          const mensaje =
            err instanceof ApiError
              ? err.message
              : "No se pudo aprobar la solicitud.";
          showToast(mensaje, "error");
        },
      },
    );
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
            {info.getValue()}
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
        setSolicitudSeleccionada(null);
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
    handleEstadoChange(solicitudAAprobar.id, "Aprobado");
    setIsApproveModalOpen(false);
    setSolicitudAAprobar(null);
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
              <AdminTable>
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

      <AdminRecordDetailSheet
        open={solicitudSeleccionada !== null}
        hideHeader
        title={
          solicitudSeleccionada
            ? nombreCompleto(solicitudSeleccionada)
            : "Solicitud"
        }
        subtitle={solicitudSeleccionada?.TipoSacramento}
        badges={
          solicitudSeleccionada
            ? renderEstadoBadge(solicitudSeleccionada.Estado)
            : undefined
        }
        onClose={() => setSolicitudSeleccionada(null)}
        actions={
          solicitudSeleccionada && isAdmin ? (
            <label className="flex w-full flex-col gap-1.5 text-sm font-semibold text-text md:min-w-[260px] md:flex-[0_1_260px]">
              <span>Cambiar estado</span>
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
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-0 bg-surface px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border-0 bg-surface p-1 shadow-[0_16px_35px_rgba(0,0,0,0.18)]"
                  >
                    {(
                      [
                        {
                          valor: "Pendiente",
                          dot: "bg-amber-500",
                          text: "text-warning",
                        },
                        {
                          valor: "Aprobado",
                          dot: "bg-emerald-500",
                          text: "text-success",
                        },
                        {
                          valor: "Rechazado",
                          dot: "bg-red-500",
                          text: "text-danger",
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
                              } else if (opcion.valor === "Aprobado") {
                                setSolicitudSeleccionada(null);
                                setSolicitudAAprobar(solicitudSeleccionada);
                                setIsApproveModalOpen(true);
                              } else {
                                handleEstadoChange(
                                  solicitudSeleccionada.id,
                                  "Pendiente",
                                );
                              }
                              setEstadoMenuAbierto(false);
                            }}
                            className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-semibold transition-colors ${
                              activo
                                ? "bg-royal-blue/10 text-royal-blue"
                                : `text-slate-700 hover:bg-royal-blue/5 ${opcion.text}`
                            }`}
                          >
                            <span
                              className={`size-2 shrink-0 rounded-full ${opcion.dot}`}
                            />
                            {opcion.valor}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </label>
          ) : undefined
        }
      >
        {solicitudSeleccionada && (
          <div className="flex flex-col gap-4">
            <h3 className="m-0 font-heading text-xl font-extrabold text-royal-blue">
              Datos de la solicitud
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-3">
                <h4 className="m-0 text-[0.7rem] font-bold tracking-wider text-text-muted uppercase">
                  Nombre del solicitante
                </h4>
                <p className="m-0 mt-1 text-sm font-semibold text-text">
                  {nombreCompleto(solicitudSeleccionada)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-3">
                <h4 className="m-0 text-[0.7rem] font-bold tracking-wider text-text-muted uppercase">
                  Sacramento solicitado
                </h4>
                <p className="m-0 mt-1 text-sm font-semibold text-royal-blue">
                  {solicitudSeleccionada.TipoSacramento}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-3">
              <h4 className="m-0 text-[0.7rem] font-bold tracking-wider text-text-muted uppercase">
                Motivo
              </h4>
              <p className="m-0 mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {solicitudSeleccionada.Motivo}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-3">
              <h4 className="m-0 text-[0.7rem] font-bold tracking-wider text-text-muted uppercase">
                Contacto
              </h4>
              <div className="mt-2 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                <p className="m-0 min-w-0 break-words">
                  <span className="font-semibold text-text">Correo:</span>{" "}
                  {solicitudSeleccionada.Correo}
                </p>
                <p className="m-0">
                  <span className="font-semibold text-text">Teléfono:</span>{" "}
                  {solicitudSeleccionada.Telefono || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-3.5 py-3">
              <h4 className="m-0 text-[0.7rem] font-bold tracking-wider text-text-muted uppercase">
                Estado
              </h4>
              {renderEstadoBadge(solicitudSeleccionada.Estado)}
            </div>
          </div>
        )}
      </AdminRecordDetailSheet>

      {solicitudAAprobar && (
        <Modal
          onClose={() => setSolicitudAprobar(null)}
          title="Aprobar solicitud"
        >
          <div className="flex flex-col gap-5 pr-8">
            <div>
              <h3 className="m-0 text-lg font-extrabold text-royal-blue">
                ¿Desea aprobar la solicitud?
              </h3>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-text-secondary">
                La solicitud de {nombreCompleto(solicitudAAprobar)} cambiará a
                estado aprobado.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setSolicitudAprobar(null)}
                disabled={isUpdatingEstado}
              >
                Cancelar
              </Button>
              <Button
                variant="royal"
                onClick={confirmarAprobacion}
                disabled={isUpdatingEstado}
              >
                {isUpdatingEstado ? "Aprobando..." : "Aprobar solicitud"}
              </Button>
            </div>
          </div>
        </Modal>
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
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              ¿Está seguro/a de realizar este cambio? La acción no es
              reversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={handleCancelApprove}
                disabled={isUpdatingEstado}
              >
                Cancelar
              </Button>
              <Button
                variant="royal"
                onClick={handleApproveConfirm}
                disabled={isUpdatingEstado}
              >
                {isUpdatingEstado ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar"
                )}
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
