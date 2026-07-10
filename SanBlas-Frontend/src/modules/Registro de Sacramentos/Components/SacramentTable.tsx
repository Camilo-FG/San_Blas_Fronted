import { Pencil, Trash2, MapPin, Calendar, FileText, Eye } from "lucide-react";
import { AdminRecordCard } from "../../../shared/components/admin/AdminRecordCard";
import {
  AdminTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  Button,
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

const colorPorTipo = {
  Bautismo: "#E8F5E9",
  Comunión: "#E3F2FD",
  Confirmación: "#FFF3E0",
  Matrimonio: "#F3E5F5",
};

const textColorPorTipo = {
  Bautismo: "#2E7D32",
  Comunión: "#1565C0",
  Confirmación: "#E65100",
  Matrimonio: "#6A1B9A",
};

const SacramentTable = ({
  sacramentos,
  onViewDetails,
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection,
}: Props) => {
  const renderTipoBadge = (tipo: Sacrament["tipo"]) => (
    <span
      className="inline-block rounded-full px-3 py-1.5 text-xs font-semibold uppercase"
      style={{
        backgroundColor: colorPorTipo[tipo],
        color: textColorPorTipo[tipo],
      }}
    >
      {tipo}
    </span>
  );

  const sortableHeader = (column: string, label: string) => (
    <AdminTableHeaderCell
      onClick={() => onSort?.(column)}
      className={cn(onSort && "cursor-pointer")}
    >
      {label}
      {sortColumn === column && (sortDirection === "asc" ? " ↑" : " ↓")}
    </AdminTableHeaderCell>
  );

  return (
    <div>
      <AdminTablePanel className="hidden min-w-0 md:block">
        <AdminTable className="min-w-[800px]">
          <AdminTableHead>
            <tr>
              {sortableHeader("tipo", "SACRAMENTO")}
              {sortableHeader("nombre", "REGISTRADO / CONTRAYENTE")}
              {sortableHeader("fechaCelebracion", "FECHA DE CELEBRACIÓN")}
              {sortableHeader("lugar", "LUGAR / PARROQUIA")}
              <AdminTableHeaderCell>DETALLES</AdminTableHeaderCell>
              <AdminTableHeaderCell>ACCIONES</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <tbody>
            {sacramentos.map((sacramento) => (
              <AdminTableRow key={sacramento.id}>
                <AdminTableCell>{renderTipoBadge(sacramento.tipo)}</AdminTableCell>
                <AdminTableCell>{sacramento.nombre}</AdminTableCell>
                <AdminTableCell>{sacramento.fechaCelebracion}</AdminTableCell>
                <AdminTableCell>{sacramento.lugar}</AdminTableCell>
                <AdminTableCell>
                  <button
                    type="button"
                    className="cursor-pointer rounded border-0 bg-transparent px-3 py-2 text-[13px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    onClick={() => onViewDetails(sacramento)}
                  >
                    VER ACTA &gt;
                  </button>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminTableActions>
                    <Button
                      type="button"
                      onClick={() => onEdit(sacramento)}
                      className="bg-green-500 px-3 py-1.5 text-xs hover:bg-green-600"
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDelete(sacramento)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Eliminar
                    </Button>
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
            accent={textColorPorTipo[sacramento.tipo]}
            code={sacramento.tipo}
            title={sacramento.nombre}
            subtitle={sacramento.lugar}
            badges={renderTipoBadge(sacramento.tipo)}
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
};

export default SacramentTable;
