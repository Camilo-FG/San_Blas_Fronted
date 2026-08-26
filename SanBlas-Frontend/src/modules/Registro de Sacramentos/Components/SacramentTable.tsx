import { Pencil, Trash2, ChevronLeft, ChevronRight, FileText, MapPin, Calendar, Eye } from 'lucide-react';
import { AdminRecordCard } from '../../../shared/components/admin/AdminRecordCard';
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
} from '../../../shared/ui';
import { SacramentoListaItem, TIPO_SACRAMENTO_LABEL } from '../../../types/sacramentosNuevos';

interface Props {
  sacramentos: SacramentoListaItem[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (sacramento: SacramentoListaItem) => void;
  onViewDetails: (sacramento: SacramentoListaItem) => void;
  onDelete: (sacramento: SacramentoListaItem) => void;
  searchNombre?: string;
}

const PAGE_SIZES = [10, 25, 50];

const formatearCedula = (valor: string | null | undefined): string => {
  const soloDigitos = String(valor ?? '').replace(/\D/g, '');
  if (!soloDigitos) return '';
  if (soloDigitos.length <= 1) return soloDigitos;
  if (soloDigitos.length <= 5) return `${soloDigitos[0]}-${soloDigitos.slice(1)}`;
  return `${soloDigitos[0]}-${soloDigitos.slice(1, 5)}-${soloDigitos.slice(5)}`;
};

const formatearFecha = (fecha: string | undefined | null): string => {
  if (!fecha) return '—';
  const m = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(fecha);
};

const resaltar = (texto: string, termino: string) => {
  const term = (termino || '').trim();
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

const SacramentTable = ({
  sacramentos,
  total,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onViewDetails,
  onDelete,
  searchNombre = '',
}: Props) => {
  const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, total);

  const Acciones = ({ sacramento }: { sacramento: SacramentoListaItem }) => (
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
        onClick={() => onViewDetails(sacramento)}
        className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        aria-label="Ver detalle"
      >
        <Eye size={15} strokeWidth={1.5} />
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
  );

  return (
    <div>
      <AdminTablePanel className="hidden md:block">
        <div className="max-h-[60vh] overflow-auto">
          <AdminTable className="min-w-[700px]">
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeaderCell>Nombre del fiel</AdminTableHeaderCell>
                <AdminTableHeaderCell>Cédula</AdminTableHeaderCell>
                <AdminTableHeaderCell>Sacramento</AdminTableHeaderCell>
                <AdminTableHeaderCell>Fecha</AdminTableHeaderCell>
                <AdminTableHeaderCell>Lugar</AdminTableHeaderCell>
                <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
              </AdminTableRow>
            </AdminTableHead>
            <tbody>
              {sacramentos.map((s, i) => (
                <AdminTableRow
                  key={s.id}
                  className={cn('cursor-pointer', i % 2 === 1 && 'bg-surface-muted/50')}
                  onClick={() => onViewDetails(s)}
                >
                  <AdminTableCell>
                    <span className="font-medium text-text">{resaltar(s.nombre, searchNombre)}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="tabular-nums text-text-secondary">{formatearCedula(s.cedula)}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="text-text-secondary">{TIPO_SACRAMENTO_LABEL[s.tipo]}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="tabular-nums text-text-secondary">
                      {formatearFecha(s.fechaRegistro || s.fecha)}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="text-text-secondary">{s.parroquia}</span>
                  </AdminTableCell>
                  <AdminTableCell onClick={(e) => e.stopPropagation()}>
                    <Acciones sacramento={s} />
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </div>

        <AdminTableFooter>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-text-muted">
              Mostrando {pageStart}-{pageEnd} de {total} registros
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-text-muted">
                Registros por página
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-sm text-text-muted">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
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
        {sacramentos.map((s) => (
          <AdminRecordCard
            key={s.id}
            icon={<FileText size={20} />}
            accent="#334155"
            code="Registro"
            title={s.nombre}
            subtitle={s.parroquia}
            meta={[
              {
                icon: <Calendar size={12} />,
                label: 'Fecha',
                value: formatearFecha(s.fechaRegistro || s.fecha),
              },
              {
                icon: <MapPin size={12} />,
                label: 'Cédula',
                value: formatearCedula(s.cedula),
              },
            ]}
            actions={[
              {
                label: 'Ver detalle',
                icon: <Eye size={15} />,
                variant: 'ghost',
                onClick: () => onViewDetails(s),
              },
              {
                label: 'Editar',
                icon: <Pencil size={15} />,
                variant: 'ghost',
                onClick: () => onEdit(s),
              },
              {
                label: 'Eliminar',
                icon: <Trash2 size={15} />,
                variant: 'danger',
                onClick: () => onDelete(s),
              },
            ]}
          />
        ))}
        {total > pageSize && (
          <div className="flex items-center justify-between px-1 pt-1 text-sm text-text-muted">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SacramentTable;