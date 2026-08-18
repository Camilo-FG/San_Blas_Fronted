import { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import { AdminRecordCard } from "../../../shared/components/admin/AdminRecordCard";
import {
  AdminTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  cn,
} from "../../../shared/ui";

interface Sacrament {
  id: string;
  nombre: string;
  cedula: string | number;
  fechaCelebracion: string;
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
  searchCedula?: string;
}

const hexTipo: Record<Sacrament["tipo"], string> = {
  Bautismo: "#0f766e",
  Comunión: "#1d4ed8",
  Confirmación: "#c2410c",
  Matrimonio: "#f59e0b",
};

const PAGE_SIZES = [10, 25, 50];

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

function SacramentTable({
  sacramentos,
  onViewDetails,
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection,
  searchNombre = "",
  searchCedula = "",
}: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalRegistros = sacramentos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / pageSize));

  const paginaActualSegura = useMemo(
    () => Math.min(pageIndex, totalPaginas - 1),
    [pageIndex, totalPaginas],
  );

  const paginados = useMemo(
    () =>
      sacramentos.slice(
        paginaActualSegura * pageSize,
        paginaActualSegura * pageSize + pageSize,
      ),
    [sacramentos, paginaActualSegura, pageSize],
  );

  const inicioRango = totalRegistros === 0 ? 0 : paginaActualSegura * pageSize + 1;
  const finRango = Math.min((paginaActualSegura + 1) * pageSize, totalRegistros);

  const SortIcon = sortDirection === "asc" ? ChevronUp : ChevronDown;

  const cambiarPagina = (nuevaPagina: number) => {
    setPageIndex(Math.max(0, Math.min(nuevaPagina, totalPaginas - 1)));
  };

  const sortableHeader = (column: string, label: string) => (
    <AdminTableHeaderCell
      onClick={() => onSort?.(column)}
      className={cn(onSort && "cursor-pointer select-none")}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {sortColumn === column ? (
          <SortIcon size={13} strokeWidth={2.5} className="text-text-muted" />
        ) : (
          <span className="inline-block w-[13px]" />
        )}
      </span>
    </AdminTableHeaderCell>
  );

  return (
    <div>
      <AdminTablePanel className="hidden md:block">
        <div className="max-h-[60vh] overflow-auto">
          <AdminTable className="min-w-[900px]">
            <AdminTableHead>
              <tr>
                {sortableHeader("tipo", "Sacramento")}
                {sortableHeader("nombre", "Registrado")}
                <AdminTableHeaderCell>Cédula</AdminTableHeaderCell>
                {sortableHeader("fechaCelebracion", "Fecha")}
                {sortableHeader("lugar", "Lugar")}
                <AdminTableHeaderCell className="w-24">Acta</AdminTableHeaderCell>
                <AdminTableHeaderCell className="w-28">Acciones</AdminTableHeaderCell>
              </tr>
            </AdminTableHead>
            <tbody>
              {paginados.map((sacramento, i) => (
                <AdminTableRow
                  key={sacramento.id}
                  style={{
                    "--accent": hexTipo[sacramento.tipo],
                    borderLeft: "3px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                  } as React.CSSProperties}
                  className={cn(
                    "cursor-pointer transition-[border-color] hover:![border-left-color:var(--accent)]",
                    i % 2 === 1 && "bg-surface-muted/50",
                  )}
                  onClick={() => onViewDetails(sacramento)}
                >
                  <AdminTableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: hexTipo[sacramento.tipo] }}
                      />
                      <span className="text-[0.7rem] font-semibold tracking-wider text-text-muted uppercase">
                        {sacramento.tipo}
                      </span>
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-text">
                    {resaltar(sacramento.nombre, searchNombre)}
                  </AdminTableCell>
                  <AdminTableCell className="text-text-secondary">
                    {resaltar(String(sacramento.cedula ?? ""), searchCedula)}
                  </AdminTableCell>
                  <AdminTableCell
                    className="text-text-secondary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {sacramento.fechaCelebracion}
                  </AdminTableCell>
                  <AdminTableCell className="text-text-secondary">
                    {sacramento.lugar}
                  </AdminTableCell>
                  <AdminTableCell onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onViewDetails(sacramento)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent px-2 py-1.5 text-[0.7rem] font-bold tracking-wider text-info uppercase transition-colors hover:bg-info-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    >
                      <Eye size={13} strokeWidth={1.5} />
                      Acta
                    </button>
                  </AdminTableCell>
                  <AdminTableCell onClick={(e) => e.stopPropagation()}>
                    <AdminTableActions>
                      <button
                        type="button"
                        onClick={() => onEdit(sacramento)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                        aria-label="Editar"
                      >
                        <Pencil size={15} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(sacramento)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-text-muted transition-colors hover:bg-danger-bg hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </AdminTableActions>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-strong px-4 py-3">
          <span className="text-sm text-text-secondary">
            Mostrando {inicioRango}-{finRango} de {totalRegistros} registros
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              Registros por página
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                className="min-h-9 rounded-lg border border-border-strong bg-surface px-2 text-sm text-text focus-visible:outline-none"
              >
                {PAGE_SIZES.map((tam) => (
                  <option key={tam} value={tam}>
                    {tam}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActualSegura - 1)}
                disabled={paginaActualSegura === 0}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-sm text-text-secondary">
                Página {paginaActualSegura + 1} de {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActualSegura + 1)}
                disabled={paginaActualSegura + 1 >= totalPaginas}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </AdminTablePanel>

      <div className="flex flex-col gap-2.5 md:hidden">
        {paginados.map((sacramento) => (
          <AdminRecordCard
            key={sacramento.id}
            icon={<FileText size={20} />}
            accent={hexTipo[sacramento.tipo]}
            code={sacramento.tipo}
            title={sacramento.nombre}
            subtitle={sacramento.lugar}
            badges={
              <span
                style={{ backgroundColor: hexTipo[sacramento.tipo] }}
                className="inline-block h-2 w-2 rounded-full"
              />
            }
            meta={[
              {
                icon: <Calendar size={12} />,
                label: "Celebración",
                value: sacramento.fechaCelebracion,
              },
              {
                icon: <MapPin size={12} />,
                label: "Lugar",
                value: sacramento.lugar,
              },
            ]}
            actions={[
              {
                label: "Acta",
                icon: <Eye size={15} />,
                variant: "ghost",
                onClick: () => onViewDetails(sacramento),
              },
              {
                label: "Editar",
                icon: <Pencil size={15} />,
                variant: "primary",
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
        ))}
        {totalRegistros > pageSize && (
          <div className="flex items-center justify-between px-1 pt-1 text-sm text-text-secondary">
            <button
              type="button"
              onClick={() => cambiarPagina(paginaActualSegura - 1)}
              disabled={paginaActualSegura === 0}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span>
              {inicioRango}-{finRango} de {totalRegistros}
            </span>
            <button
              type="button"
              onClick={() => cambiarPagina(paginaActualSegura + 1)}
              disabled={paginaActualSegura + 1 >= totalPaginas}
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