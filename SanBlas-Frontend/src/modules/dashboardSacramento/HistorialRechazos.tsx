import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
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
  Button,
  Modal,
  cn,
  type BadgeVariant,
  useToast,
} from "../../shared/ui";

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
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<string | null>(null);
  const { data, error, isPending } = useGetHistorialRechazos();
  const { showToast } = useToast();

  const rows: HistorialRechazo[] = Array.isArray(data) ? data : [];

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
            {truncateText(info.row.original.detalle ?? "", 60)}
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
              onClick={() => setDetalleSeleccionado(info.row.original.detalle ?? "")}
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
    data: rows,
    columns,
    state: {
      sorting,
      globalFilter: query,
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value || "");

  if (error) {
    const mensaje = error instanceof ApiError ? error.message : "No se pudo cargar el historial de rechazos.";
    return <div className="p-4 text-sm text-danger">{mensaje}</div>;
  }

  return (
    <AdminModule className="p-2">
      <AdminToolbar>
        <AdminSearch
          value={query}
          type="search"
          placeholder="Buscar por solicitud, motivo, usuario..."
          onChange={handleSearch}
          aria-label="Buscar en historial de rechazos"
        />
      </AdminToolbar>

      {!isPending && (
        <>
          {rows.length === 0 ? (
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
                          {truncateText(row.original.detalle ?? "", 80)}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetalleSeleccionado(row.original.detalle ?? "")}
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

          {rows.length > 0 && (
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

      {detalleSeleccionado && (
        <Modal onClose={() => setDetalleSeleccionado(null)} title="Detalle completo">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {detalleSeleccionado}
          </div>
        </Modal>
      )}
    </AdminModule>
  );
};

export default HistorialRechazos;