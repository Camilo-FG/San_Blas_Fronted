import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText, Phone, IdCard, Eye } from "lucide-react";
import type { FormSacramento } from "../../types/formSacramento";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useGetSolicitudes } from "../solicSacramento/hooks/useGetSolicitudes";
import { useUpdateSolicitudEstado } from "../solicSacramento/hooks/useUpdateSolicitudEstado";
import { usePagination } from "../../shared/hooks/usePagination";
import { ApiError } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { AdminRecordCard } from "../../shared/components/admin/AdminRecordCard";
import { AdminRecordDetailSheet } from "../../shared/components/admin/AdminRecordDetailSheet";
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
  Select,
  cn,
  type BadgeVariant,
} from "../../shared/ui";

const columnHelper = createColumnHelper<FormSacramento>();

const nombreCompleto = (row: FormSacramento) =>
  [row.Nombre, row.PrimerApellido, row.SegundoApellido].filter(Boolean).join(" ");

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
  const [query, setQuery] = useState("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<FormSacramento | null>(null);
  const { isAdmin } = useAuth();
  const { data, error, isPending } = useGetSolicitudes();
  const updateEstado = useUpdateSolicitudEstado();
  const isUpdatingEstado = updateEstado.isPending;

  const rows: FormSacramento[] = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return rows;
    return rows.filter((row) => {
      const searchable = [row.Nombre, row.PrimerApellido, row.SegundoApellido, String(row.Cedula)]
        .map(normalizeText)
        .join(" ");
      return searchable.includes(normalizedQuery);
    });
  }, [query, rows]);

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
              <span className="tabular-nums">{r.Telefono?.toString() || "—"}</span>
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
            <Eye size={13} strokeWidth={1.5} />
            Ver motivo
          </button>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: { pagination: { pageSize: 7 } },
    getPaginationRowModel: getPaginationRowModel(),
  });

  const {
    totalItems, currentPage, totalPages,
    canPreviousPage, canNextPage,
    goToPreviousPage, goToNextPage,
  } = usePagination(table);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value || "");

  const handleEstadoChange = (
    id: number | string | undefined,
    nextEstado: "Pendiente" | "Aprobado" | "Rechazado",
  ) => {
    if (id === undefined || id === null) return;
    updateEstado.mutate(
      { id, Estado: nextEstado },
      {
        onSuccess: () => {
          if (solicitudSeleccionada && String(solicitudSeleccionada.id) === String(id)) {
            setSolicitudSeleccionada({ ...solicitudSeleccionada, Estado: nextEstado });
          }
        },
        onError: (err: unknown) => {
          const mensaje = err instanceof ApiError ? err.message : "No se pudo actualizar el estado.";
          alert(mensaje);
        },
      },
    );
  };

  const renderEstadoBadge = (estado?: string) => {
    const currentEstado = estado ?? "Pendiente";
    return <Badge variant={getEstadoBadgeVariant(currentEstado)}>{currentEstado}</Badge>;
  };

  if (error) {
    const mensaje = error instanceof ApiError ? error.message : "No se pudieron cargar las solicitudes.";
    return <div className="p-4 text-sm text-danger">{mensaje}</div>;
  }

  return (
    <AdminModule className="p-2">
      <AdminToolbar>
        <AdminSearch
          value={query}
          type="search"
          placeholder="Buscar por nombre, apellidos o cédula"
          onChange={handleSearch}
          aria-label="Buscar solicitudes de constancia"
        />
      </AdminToolbar>

      {!isPending && (
        <>
          <div className="hidden md:block">
            <AdminTablePanel>
              <AdminTable>
                <AdminTableHead>
                  {table.getHeaderGroups().map((hg) => (
                    <AdminTableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <AdminTableHeaderCell key={h.id}>
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                          const currentEstado = originalRow.Estado ?? "Pendiente";
                          return (
                            <AdminTableCell key={cell.id}>
                              <div className={cn("inline-flex items-center rounded-full p-1", estadoSelectClass(currentEstado))}>
                                {isAdmin ? (
                                  <Select
                                    className="min-h-0 border-0 bg-transparent px-2 py-1 text-xs font-bold shadow-none focus-visible:ring-0"
                                    value={currentEstado}
                                    onChange={(e) => handleEstadoChange(originalRow.id, e.target.value as "Pendiente" | "Aprobado" | "Rechazado")}
                                    disabled={isUpdatingEstado}
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                  </Select>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-bold">{currentEstado}</span>
                                )}
                              </div>
                            </AdminTableCell>
                          );
                        }
                        return (
                          <AdminTableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            {filtered.map((row) => (
              <AdminRecordCard
                key={String(row.id)}
                icon={<ScrollText size={20} />}
                accent="#1d4ed8"
                code={`SOL-${row.id}`}
                title={nombreCompleto(row)}
                subtitle={row.TipoSacramento ?? "Sacramento"}
                badges={renderEstadoBadge(row.Estado)}
                meta={[
                  { icon: <IdCard size={12} />, label: "Cédula", value: String(row.Cedula ?? "—") },
                  { icon: <Phone size={12} />, label: "Teléfono", value: row.Telefono?.toString() || "No provisto" },
                ]}
                footer={
                  isAdmin ? (
                    <Select
                      className={cn("w-full", estadoSelectClass(row.Estado))}
                      value={row.Estado ?? "Pendiente"}
                      disabled={isUpdatingEstado}
                      aria-label={`Estado de solicitud de ${nombreCompleto(row)}`}
                      onChange={(e) => handleEstadoChange(row.id, e.target.value as "Pendiente" | "Aprobado" | "Rechazado")}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                    </Select>
                  ) : undefined
                }
                actions={[
                  { label: "Ver solicitud", icon: <Eye size={15} />, variant: "primary", onClick: () => setSolicitudSeleccionada(row) },
                ]}
              />
            ))}
          </div>
        </>
      )}

      <AdminRecordDetailSheet
        open={solicitudSeleccionada !== null}
        title={solicitudSeleccionada ? nombreCompleto(solicitudSeleccionada) : "Solicitud"}
        subtitle={solicitudSeleccionada?.TipoSacramento}
        badges={solicitudSeleccionada ? renderEstadoBadge(solicitudSeleccionada.Estado) : undefined}
        onClose={() => setSolicitudSeleccionada(null)}
        actions={
          solicitudSeleccionada && isAdmin ? (
            <label className="flex w-full flex-col gap-1.5 text-sm font-semibold text-text">
              <span>Cambiar estado</span>
              <Select
                className={estadoSelectClass(solicitudSeleccionada.Estado)}
                value={solicitudSeleccionada.Estado ?? "Pendiente"}
                onChange={(e) => handleEstadoChange(solicitudSeleccionada.id, e.target.value as "Pendiente" | "Aprobado" | "Rechazado")}
                disabled={isUpdatingEstado}
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
          <div className="flex flex-col gap-2">
            <h4 className="m-0 text-xs font-semibold tracking-wider text-text-muted uppercase">Motivo</h4>
            <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {solicitudSeleccionada.Motivo}
            </p>
          </div>
        )}
      </AdminRecordDetailSheet>

      {!isPending && table.getRowModel().rows.length > 0 && (
        <AdminTableFooter>
          <span className="text-sm text-text-muted">
            <strong className="text-text">{totalItems}</strong> registros
          </span>
          <AdminPagination>
            <AdminPaginationButton type="button" onClick={goToPreviousPage} disabled={!canPreviousPage} aria-label="Página anterior">
              <ChevronLeft size={16} strokeWidth={2} />
            </AdminPaginationButton>
            <span className="text-sm text-text-muted">
              <strong className="text-text">{currentPage}</strong> de <strong className="text-text">{totalPages}</strong>
            </span>
            <AdminPaginationButton type="button" onClick={goToNextPage} disabled={!canNextPage} aria-label="Página siguiente">
              <ChevronRight size={16} strokeWidth={2} />
            </AdminPaginationButton>
          </AdminPagination>
        </AdminTableFooter>
      )}
    </AdminModule>
  );
};

export default TableSacramentos;
