import { Eye, Pencil, Trash2, ChevronUp, ChevronDown, FileText, MapPin, Calendar } from "lucide-react";
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
}

const hexTipo: Record<Sacrament["tipo"], string> = {
  Bautismo: "#0f766e",
  Comunión: "#1d4ed8",
  Confirmación: "#c2410c",
  Matrimonio: "#f59e0b",
};

function SacramentTable({
  sacramentos,
  onViewDetails,
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection,
}: Props) {
  const SortIcon = sortDirection === "asc" ? ChevronUp : ChevronDown;

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
        <AdminTable>
          <AdminTableHead>
            <tr>
              {sortableHeader("tipo", "Sacramento")}
              {sortableHeader("nombre", "Registrado")}
              {sortableHeader("fechaCelebracion", "Fecha")}
              {sortableHeader("lugar", "Lugar")}
              <AdminTableHeaderCell className="w-24">Acta</AdminTableHeaderCell>
              <AdminTableHeaderCell className="w-28">Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <tbody>
            {sacramentos.map((sacramento) => (
              <AdminTableRow
                key={sacramento.id}
                style={{
                  "--accent": hexTipo[sacramento.tipo],
                  borderLeft: "3px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                } as React.CSSProperties}
                className="transition-[border-color] hover:![border-left-color:var(--accent)]"
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
                  {sacramento.nombre}
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
                <AdminTableCell>
                  <button
                    type="button"
                    onClick={() => onViewDetails(sacramento)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent px-2 py-1.5 text-[0.7rem] font-bold tracking-wider text-info uppercase transition-colors hover:bg-info-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    <Eye size={13} strokeWidth={1.5} />
                    Acta
                  </button>
                </AdminTableCell>
                <AdminTableCell>
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
      </AdminTablePanel>

      <div className="flex flex-col gap-2.5 md:hidden">
        {sacramentos.map((sacramento) => (
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
      </div>
    </div>
  );
}

export default SacramentTable;
