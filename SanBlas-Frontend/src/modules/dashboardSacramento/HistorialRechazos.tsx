import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { useGetHistorialRechazos } from "../solicSacramento/hooks/useGetHistorialRechazos";
import { ApiError } from "../../services/apiClient";
import type { HistorialRechazo } from "../../services/constancias/constanciasService";
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
} from "../../shared/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";

const columnHelper = createColumnHelper<HistorialRechazo>();

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const HistorialRechazos = () => {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<HistorialRechazo | null>(null);
  const { data, error, isPending } = useGetHistorialRechazos();

  const rows: HistorialRechazo[] = Array.isArray(data) ? data : [];
  const debouncedNombre = useDebouncedValue(filtroNombre.trim().toLowerCase(), 500);
  const debouncedFechaDesde = useDebouncedValue(fechaDesde, 500);
  const debouncedFechaHasta = useDebouncedValue(fechaHasta, 500);
  const filteredRows = useMemo(
    () => rows.filter((row) => {
      const rowDate = row.creado_en.slice(0, 10);
      const matchesName = !debouncedNombre || (row.nombre_solicitante ?? "").toLowerCase().includes(debouncedNombre);
      const matchesFrom = !debouncedFechaDesde || rowDate >= debouncedFechaDesde;
      const matchesTo = !debouncedFechaHasta || rowDate <= debouncedFechaHasta;
      return matchesName && matchesFrom && matchesTo;
    }),
    [rows, debouncedNombre, debouncedFechaDesde, debouncedFechaHasta],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre_solicitante", {
        header: () => "Solicitante",
        cell: (info) => (
          <div className="min-w-[170px]">
            <span className="block font-semibold text-text">
              {info.getValue() ?? "Sin datos"}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "fechaHora",
        header: () => "Fecha y Hora",
        cell: (info) => (
          <span className="block min-w-[150px] text-sm text-text-secondary tabular-nums">
            {formatDate(info.row.original.creado_en)}
          </span>
        ),
      }),
      columnHelper.accessor("nombre_usuario_rechazo", {
        header: () => "Usuario Responsable",
        cell: (info) => (
          <Badge variant="secondary" className="inline-flex max-w-[180px] truncate gap-1.5">
            <span className="truncate">{info.getValue() ?? "Sin datos"}</span>
          </Badge>
        ),
      }),
      columnHelper.accessor("motivo", {
        header: () => "Motivo",
        cell: (info) => (
          <span className="inline-flex max-w-[200px] truncate rounded-full border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "detalle",
        header: () => "Detalle",
        cell: (info) => (
          <span className="block max-w-[260px] truncate text-sm text-text-secondary">
            {truncateText(info.row.original.detalle || "-", 50)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: () => "Acciones",
        cell: (info) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRegistroSeleccionado(info.row.original)}
              aria-label={`Ver detalle completo de la solicitud ${info.row.original.solicitud_id}`}
            >
              <Eye size={16} strokeWidth={1.5} />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const {
    totalItems,
    currentPage,
    totalPages,
    canPreviousPage,
    canNextPage,
    goToPreviousPage,
    goToNextPage,
  } = {
    totalItems: table.getFilteredRowModel().rows.length,
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    goToNextPage: () => table.nextPage(),
    goToPreviousPage: () => table.previousPage(),
    canNextPage: table.getCanNextPage(),
    canPreviousPage: table.getCanPreviousPage(),
  };

  if (error) {
    const mensaje = error instanceof ApiError ? error.message : "No se pudo cargar el historial de rechazos.";
    return <div className="p-4 text-sm text-danger">{mensaje}</div>;
  }

  return (
    <AdminModule className="p-2">
      <AdminToolbar>
        <div className="flex w-full flex-wrap items-center gap-2">
          <input
            type="search"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            placeholder="Nombre del solicitante"
            aria-label="Filtrar por nombre del solicitante"
            className="min-h-11 rounded-xl border border-border-strong bg-surface-muted px-3.5 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Desde
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              aria-label="Filtrar desde fecha"
              className="min-h-11 rounded-xl border border-border-strong bg-surface-muted px-3 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Hasta
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              aria-label="Filtrar hasta fecha"
              className="min-h-11 rounded-xl border border-border-strong bg-surface-muted px-3 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            />
          </label>
        </div>
      </AdminToolbar>

      {!isPending && (
        <>
          {filteredRows.length === 0 ? (
            <div className="py-12">
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-text-muted">
                <p className="text-base font-semibold text-slate-700">No hay registros de solicitudes rechazadas</p>
              </div>
            </div>
          ) : (
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
                          {row.getVisibleCells().map((cell) => (
                            <AdminTableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </AdminTableCell>
                          ))}
                        </AdminTableRow>
                      ))}
                    </tbody>
                  </AdminTable>
                </AdminTablePanel>
              </div>

              <div className="flex flex-col gap-2.5 md:hidden">
                {table.getFilteredRowModel().rows.map((row) => (
                  <div
                    key={String(row.original.id)}
                    className="rounded-2xl border border-border-strong bg-surface p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
                            Solicitante
                          </p>
                          <p className="truncate font-semibold text-text">
                            {row.original.nombre_solicitante ?? "Sin datos"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="max-w-[180px] truncate">
                          {row.original.nombre_usuario_rechazo ?? "Sin datos"}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-text-secondary">
                        <div>
                          <span className="font-medium text-text">Fecha: </span>
                          {formatDate(row.original.creado_en)}
                        </div>
                        <div>
                          <span className="font-medium text-text">Motivo: </span>
                          <span className="inline-flex rounded-full border border-border-strong bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                            {row.original.motivo}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-text">Detalle: </span>
                          {truncateText(row.original.detalle || "-", 50)}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRegistroSeleccionado(row.original)}
                          aria-label={`Ver detalle completo de la solicitud ${row.original.solicitud_id}`}
                        >
                          <Eye size={16} strokeWidth={1.5} />
                          Ver detalle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredRows.length > 0 && (
            <AdminTableFooter>
              <span className="text-sm text-text-muted">
                <strong className="text-text">{totalItems}</strong> registros
              </span>
              <AdminPagination>
                <AdminPaginationButton
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={!canPreviousPage}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </AdminPaginationButton>
                <span className="text-sm text-text-muted">
                  <strong className="text-text">{currentPage}</strong> de <strong className="text-text">{totalPages}</strong>
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
          )}
        </>
      )}

      {registroSeleccionado && (
        <Modal
          onClose={() => setRegistroSeleccionado(null)}
          title="Detalle del Rechazo"
          className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4 pr-16">
            <h2 className="m-0 text-lg font-semibold text-text">Detalle del Rechazo</h2>
          </div>
          <div className="max-h-[55vh] overflow-y-auto px-6 py-5 text-sm leading-relaxed text-text-secondary">
            <p className="mb-4 whitespace-pre-wrap">
              <strong className="text-text">Justificación:</strong>{"\n"}
              {registroSeleccionado.motivo || "No se ingresó una justificación adicional."}
            </p>
            <p className="m-0 whitespace-pre-wrap">
              <strong className="text-text">Detalle:</strong>{"\n"}
              {registroSeleccionado.detalle || "No se ingresó una justificación adicional."}
            </p>
          </div>
          <div className="flex justify-end border-t border-border px-6 py-4">
            <Button variant="secondary" onClick={() => setRegistroSeleccionado(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}
    </AdminModule>
  );
};

export default HistorialRechazos;