import { useEffect, useMemo, useState } from "react";
import {
  ScrollText,
  Phone,
  IdCard,
  Eye,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
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

const getEstadoBadgeVariant = (estado?: string): BadgeVariant => {
  const normalized = (estado ?? "Pendiente").toLowerCase();
  if (normalized === "aprobado") return "success";
  if (normalized === "rechazado") return "danger";
  return "warning";
};

const estadoSelectClass = (estado?: string) =>
  cn(
    "rounded-full border bg-transparent font-bold",
    (estado ?? "Pendiente").toLowerCase() === "aprobado" &&
      "border-emerald-300 bg-success-bg text-success",
    (estado ?? "Pendiente").toLowerCase() === "rechazado" &&
      "border-red-300 bg-danger-bg text-danger",
    (estado ?? "Pendiente").toLowerCase() === "pendiente" &&
      "border-orange-300 bg-warning-bg text-warning",
  );

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
  const [solicitudAprobar, setSolicitudAprobar] =
    useState<FormSacramento | null>(null);
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
    if (!solicitudAprobar?.id) return;

    updateEstado.mutate(
      { id: solicitudAprobar.id, nuevoEstado: "Aprobado" },
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
      columnHelper.accessor("TipoSacramento", {
        header: () => "Sacramento",
        cell: (info) => (
          <span className="text-[0.7rem] font-semibold tracking-wider text-text-muted uppercase">
            {info.getValue()}
          </span>
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
    data: rows,
    columns,
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEstadoChange = (
    id: number | string | undefined,
    nextEstado: "Pendiente" | "Aprobado" | "Rechazado",
  ) => {
    if (id === undefined || id === null) return;

    // Si se selecciona "Rechazado", abrir modal de rechazo en lugar de actualizar directamente
    if (nextEstado === "Rechazado") {
      const solicitud = rows.find((r) => String(r.id) === String(id));
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
        setSolicitudAprobar(solicitud);
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
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-royal-blue text-white shadow-sm">
                <Search
                  size={17}
                  strokeWidth={2.2}
                />
              </span>
              <div>
                <h2 className="m-0 text-sm font-extrabold text-royal-blue sm:text-base">
                  Buscar solicitudes
                </h2>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() =>
                navigate({ to: Rutas.dashboardUrl.historialRechazos })
              }
            >
              Ver historial de rechazos
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)]">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-bold tracking-wide text-text-secondary uppercase">
                Solicitante
              </span>
              <input
                type="text"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                placeholder="Nombre completo"
                className="min-h-11 w-full rounded-xl border border-border-strong bg-surface-muted px-3.5 text-sm text-text outline-none transition-[border-color,box-shadow,background-color] placeholder:text-text-muted focus:border-royal-blue focus:bg-surface focus:ring-3 focus:ring-royal-blue/10"
                aria-label="Filtrar por nombre completo"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-bold tracking-wide text-text-secondary uppercase">
                Cédula
              </span>
              <input
                type="number"
                value={filtroCedula || ""}
                onChange={(e) => setFiltroCedula(e.target.value || "")}
                placeholder="Número de cédula"
                className="min-h-11 w-full rounded-xl border border-border-strong bg-surface-muted px-3.5 text-sm text-text outline-none transition-[border-color,box-shadow,background-color] placeholder:text-text-muted focus:border-royal-blue focus:bg-surface focus:ring-3 focus:ring-royal-blue/10"
                aria-label="Filtrar por cédula"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-bold tracking-wide text-text-secondary uppercase">
                Estado
              </span>
              <select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(
                    e.target.value as
                      | "Pendiente"
                      | "Aprobado"
                      | "Rechazado"
                      | "",
                  )
                }
                className="min-h-11 w-full rounded-xl border border-border-strong bg-surface-muted px-3.5 text-sm font-semibold text-text outline-none transition-[border-color,box-shadow,background-color] focus:border-royal-blue focus:bg-surface focus:ring-3 focus:ring-royal-blue/10"
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </label>
          </div>

          <div className="flex min-h-5 items-center justify-end gap-2 text-xs font-medium text-text-muted">
            {isFiltering && (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span>Actualizando resultados...</span>
              </>
            )}
          </div>
        </div>
      </AdminToolbar>

      {isInitialLoading && (
        <p className="py-6 text-center text-sm text-text-muted">
          Cargando solicitudes...
        </p>
      )}

      {!isInitialLoading && rows.length === 0 && (
        <p className="py-6 text-center text-sm text-text-muted">
          No se encontraron solicitudes con los filtros seleccionados.
        </p>
      )}

      {!isInitialLoading && rows.length > 0 && (
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
                              <div
                                className={cn(
                                  "inline-flex items-center rounded-full p-1",
                                  estadoSelectClass(currentEstado),
                                )}
                              >
                                {isAdmin ? (
                                  <Select
                                    className="min-h-0 border-0 bg-transparent px-2 py-1 text-xs font-bold shadow-none focus-visible:ring-0"
                                    value={currentEstado}
                                    onChange={(e) =>
                                      handleEstadoChange(
                                        originalRow.id,
                                        e.target.value as
                                          | "Pendiente"
                                          | "Aprobado"
                                          | "Rechazado",
                                      )
                                    }
                                    disabled={
                                      isUpdatingEstado ||
                                      ["aprobado", "rechazado"].includes(
                                        currentEstado.toLowerCase(),
                                      )
                                    }
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                  </Select>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-bold">
                                    {currentEstado}
                                  </span>
                                )}
                              </div>
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
                subtitle={row.TipoSacramento ?? "Sacramento"}
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
                footer={
                  isAdmin ? (
                    <Select
                      className={cn("w-full", estadoSelectClass(row.Estado))}
                      value={row.Estado ?? "Pendiente"}
                      disabled={
                        isUpdatingEstado ||
                        ["aprobado", "rechazado"].includes(
                          row.Estado?.toLowerCase() ?? "",
                        )
                      }
                      aria-label={`Estado de solicitud de ${nombreCompleto(row)}`}
                      onChange={(e) =>
                        handleEstadoChange(
                          row.id,
                          e.target.value as
                            | "Pendiente"
                            | "Aprobado"
                            | "Rechazado",
                        )
                      }
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                    </Select>
                  ) : undefined
                }
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
              <Select
                className={estadoSelectClass(solicitudSeleccionada.Estado)}
                value={solicitudSeleccionada.Estado ?? "Pendiente"}
                onChange={(e) =>
                  handleEstadoChange(
                    solicitudSeleccionada.id,
                    e.target.value as "Pendiente" | "Aprobado" | "Rechazado",
                  )
                }
                disabled={
                  isUpdatingEstado ||
                  ["aprobado", "rechazado"].includes(
                    solicitudSeleccionada.Estado?.toLowerCase() ?? "",
                  )
                }
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </Select>
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

      {solicitudAprobar && (
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
                La solicitud de {nombreCompleto(solicitudAprobar)} cambiará a
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
