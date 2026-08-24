import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AdminRecordCard } from "../../../shared/components/admin/AdminRecordCard";
import {
  AdminTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableFooter,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  cn,
} from "../../../shared/ui";
import { usePagination } from "../../../shared/hooks/usePagination";

interface Sacrament {
  id: string;
  nombre: string;
  cedula: string | number;
  fechaCelebracion: string;
  fechaRegistro: string;
  lugar: string;
  tipo: "Bautismo" | "Comunión" | "Confirmación" | "Matrimonio";
  detalles: any;
}

interface Props {
  sacramentos: Sacrament[];
  onViewDetails: (sacramento: Sacrament) => void;
  onEdit: (sacramento: Sacrament) => void;
  onDelete: (sacramento: Sacrament) => void;
  onSort?: (columna: string) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  searchNombre?: string;
}

const PAGE_SIZES = [10, 25, 50];

const formatearCedula = (valor: string | number): string => {
  const soloDigitos = String(valor ?? "").replace(/\D/g, "");
  if (!soloDigitos) return "";
  if (soloDigitos.length <= 1) return soloDigitos;
  if (soloDigitos.length <= 5)
    return `${soloDigitos[0]}-${soloDigitos.slice(1)}`;
  return `${soloDigitos[0]}-${soloDigitos.slice(1, 5)}-${soloDigitos.slice(5)}`;
};

const formatearFecha = (fecha: string): string => {
  if (!fecha) return "—";
  const m = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(fecha);
};

const resaltar = (texto: string, termino: string) => {
  const term = (termino || "").trim();
  if (!term) return texto;
  const lower = texto.toLowerCase();
  const termLower = term.toLowerCase();
  const idx = lower.indexOf(termLower);
  if (idx === -1) return texto;
  return (
    <>
      {texto.slice(0, idx)}
      <mark className="rounded-sm bg-yellow-200 px-0.5 font-semibold text-inherit">
        {texto.slice(idx, idx + term.length)}
      </mark>
      {texto.slice(idx + term.length)}
    </>
  );
};

const columnHelper = createColumnHelper<Sacrament>();

function SacramentTable({
  sacramentos,
  onViewDetails,
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection,
  searchNombre = "",
}: Props) {
  const SortIcon = sortDirection === "asc" ? ChevronUp : ChevronDown;

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: () => "Nombre del fiel",
        cell: (info) => (
          <span className="font-medium text-text">
            {resaltar(info.getValue(), searchNombre)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "cedula",
        header: () => "Cédula",
        cell: (info) => (
          <span className="tabular-nums text-text-secondary">
            {formatearCedula(info.row.original.cedula)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "fechaRegistro",
        header: () => (
          <span className="inline-flex flex-col leading-tight">
            Fecha de Registro
            <span className="text-[0.6rem] font-medium text-text-muted normal-case">
              fecha en que se registró
            </span>
          </span>
        ),
        cell: (info) => (
          <span className="tabular-nums text-text-secondary">
            {formatearFecha(
              info.row.original.fechaRegistro ||
                info.row.original.fechaCelebracion,
            )}
          </span>
        ),
      }),
      columnHelper.accessor("lugar", {
        header: () => "Lugar",
        cell: (info) => (
          <span className="text-text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: () => "Acciones",
        cell: (info) => (
          <AdminTableActions>
            <button
              type="button"
              onClick={() => onEdit(info.row.original)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              aria-label="Editar"
            >
              <Pencil
                size={15}
                strokeWidth={1.5}
              />
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(info.row.original)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              aria-label="Ver detalle"
            >
              <Eye
                size={15}
                strokeWidth={1.5}
              />
            </button>
            <button
              type="button"
              onClick={() => onDelete(info.row.original)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-text-muted transition-colors hover:bg-danger-bg hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              aria-label="Eliminar"
            >
              <Trash2
                size={15}
                strokeWidth={1.5}
              />
            </button>
          </AdminTableActions>
        ),
      }),
    ],
    [searchNombre, onEdit, onDelete, onViewDetails],
  );

  const table = useReactTable({
    data: sacramentos,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
  } = usePagination(table);

  const pageStart =
    totalItems === 0
      ? 0
      : (currentPage - 1) * table.getState().pagination.pageSize + 1;
  const pageEnd = Math.min(
    currentPage * table.getState().pagination.pageSize,
    totalItems,
  );

  const sortableHeader = (column: string, label: React.ReactNode) => (
    <AdminTableHeaderCell
      key={column}
      onClick={() => onSort?.(column)}
      className={cn(onSort && "cursor-pointer select-none")}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {sortColumn === column ? (
          <SortIcon
            size={13}
            strokeWidth={2.5}
            className="text-text-muted"
          />
        ) : (
          <span className="inline-block w-[13px]" />
        )}
      </span>
    </AdminTableHeaderCell>
  );

  const rows = table.getRowModel().rows;

  return (
    <div>
      <AdminTablePanel className="hidden md:block">
        <div className="max-h-[60vh] overflow-auto">
          <AdminTable className="min-w-[700px]">
            <AdminTableHead>
              {table.getHeaderGroups().map((hg) => (
                <AdminTableRow key={hg.id}>
                  {hg.headers.map((header) =>
                    header.id === "nombre" ? (
                      sortableHeader("nombre", "Nombre del fiel")
                    ) : header.id === "lugar" ? (
                      sortableHeader("lugar", "Lugar")
                    ) : (
                      <AdminTableHeaderCell key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </AdminTableHeaderCell>
                    ),
                  )}
                </AdminTableRow>
              ))}
            </AdminTableHead>
            <tbody>
              {rows.map((row, i) => (
                <AdminTableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer",
                    i % 2 === 1 && "bg-surface-muted/50",
                  )}
                  onClick={() => onViewDetails(row.original)}
                >
                  {row.getVisibleCells().map((cell) =>
                    cell.column.id === "acciones" ? (
                      <AdminTableCell
                        key={cell.id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </AdminTableCell>
                    ) : (
                      <AdminTableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </AdminTableCell>
                    ),
                  )}
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </div>

        <AdminTableFooter>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-text-muted">
              Mostrando {pageStart}-{pageEnd} de {totalItems} registros
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-text-muted">
                Registros por página
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="min-h-9 rounded-lg border border-border-strong bg-surface px-2 text-sm text-text focus-visible:outline-none"
                >
                  {PAGE_SIZES.map((tam) => (
                    <option
                      key={tam}
                      value={tam}
                    >
                      {tam}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={!canPreviousPage}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-sm text-text-muted">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={!canNextPage}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </AdminTableFooter>
      </AdminTablePanel>

      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((row) => {
          const sacramento = row.original;
          return (
            <AdminRecordCard
              key={sacramento.id}
              icon={<FileText size={20} />}
              accent="#334155"
              code="Registro"
              title={sacramento.nombre}
              subtitle={sacramento.lugar}
              meta={[
                {
                  icon: <Calendar size={12} />,
                  label: "Fecha registro",
                  value: formatearFecha(
                    sacramento.fechaRegistro || sacramento.fechaCelebracion,
                  ),
                },
                {
                  icon: <MapPin size={12} />,
                  label: "Cédula",
                  value: formatearCedula(sacramento.cedula),
                },
              ]}
              actions={[
                {
                  label: "Ver detalle",
                  icon: <Eye size={15} />,
                  variant: "ghost",
                  onClick: () => onViewDetails(sacramento),
                },
                {
                  label: "Editar",
                  icon: <Pencil size={15} />,
                  variant: "ghost",
                  onClick: () => onEdit(sacramento),
                },
                {
                  label: "Eliminar",
                  icon: <Trash2 size={15} />,
                  variant: "danger",
                  onClick: () => onDelete(sacramento),
                },
              ]}
            />
          );
        })}
        {totalItems > table.getState().pagination.pageSize && (
          <div className="flex items-center justify-between px-1 pt-1 text-sm text-text-muted">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!canPreviousPage}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={!canNextPage}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SacramentTable;
