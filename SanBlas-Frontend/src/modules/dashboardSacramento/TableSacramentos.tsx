import { useEffect, useMemo, useState } from 'react';
import { ScrollText, Phone, IdCard, Eye } from 'lucide-react';
import { useUpdateSolicitudEstado } from '../solicSacramento/hooks/useUpdateSolicitudEstado';
import { FormSacramento } from '../../types/formSacramento';
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useGetSolicitudes } from '../solicSacramento/hooks/useGetSolicitudes';
import { usePagination } from '../../shared/hooks/usePagination';
import { ApiError } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { AdminRecordCard } from '../../shared/components/admin/AdminRecordCard';
import { AdminRecordDetailSheet } from '../../shared/components/admin/AdminRecordDetailSheet';
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
} from '../../shared/ui';

const columnHelper = createColumnHelper<FormSacramento>();

const columns = [
  columnHelper.accessor('Nombre', {
    header: () => 'Nombre',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('PrimerApellido', {
    header: () => 'Primer Apellido',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('SegundoApellido', {
    header: () => 'Segundo Apellido',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('Cedula', {
    header: () => 'Cédula',
  }),
  columnHelper.accessor('Correo', {
    header: () => 'Correo',
  }),
  columnHelper.accessor('Telefono', {
    header: () => 'Teléfono',
  }),
  columnHelper.accessor('TipoSacramento', {
    header: () => 'Tipo Sacramento',
  }),
  columnHelper.accessor('Motivo', {
    header: () => 'Motivo',
  }),
  columnHelper.accessor('Estado', {
    header: () => 'Estado',
  }),
];

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const nombreCompleto = (row: FormSacramento) =>
  [row.Nombre, row.PrimerApellido, row.SegundoApellido].filter(Boolean).join(' ');

const getEstadoBadgeVariant = (estado?: string): BadgeVariant => {
  const normalized = (estado ?? 'Pendiente').toLowerCase();
  if (normalized === 'aprobado') return 'success';
  if (normalized === 'rechazado') return 'danger';
  return 'warning';
};

const estadoSelectClass = (estado?: string) =>
  cn(
    'rounded-full border bg-transparent font-bold',
    (estado ?? 'Pendiente').toLowerCase() === 'aprobado' &&
      'border-emerald-300 bg-success-bg text-success',
    (estado ?? 'Pendiente').toLowerCase() === 'rechazado' &&
      'border-red-300 bg-danger-bg text-danger',
    (estado ?? 'Pendiente').toLowerCase() === 'pendiente' &&
      'border-orange-300 bg-warning-bg text-warning',
  );

const TableSacramentos = () => {
  const [query, setQuery] = useState('');
  const [localRows, setLocalRows] = useState<FormSacramento[]>([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<FormSacramento | null>(null);
  const { isAdmin } = useAuth();
  const { data, error, isPending } = useGetSolicitudes();
  const { mutate: updateEstado, isPending: isUpdatingEstado } = useUpdateSolicitudEstado();

  const rows: FormSacramento[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (rows.length > 0 && localRows.length === 0) {
      setLocalRows(rows);
    }
  }, [rows, localRows.length]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const sourceRows = localRows.length > 0 ? localRows : rows;

    if (!normalizedQuery) {
      return sourceRows;
    }

    return sourceRows.filter((row) => {
      const searchable = [row.Nombre, row.PrimerApellido, row.SegundoApellido, row.Cedula]
        .map(normalizeText)
        .join(' ');

      return searchable.includes(normalizedQuery);
    });
  }, [query, rows, localRows]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      pagination: { pageSize: 7 },
    },
    getPaginationRowModel: getPaginationRowModel(),
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value || '');

  const handleEstadoChange = (id: number | string | undefined, nextEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
    if (id === undefined || id === null) {
      return;
    }

    updateEstado(
      { id, Estado: nextEstado },
      {
        onSuccess: () => {
          setLocalRows((current) =>
            current.map((solicitud) =>
              String(solicitud.id) === String(id)
                ? { ...solicitud, Estado: nextEstado }
                : solicitud,
            ),
          );

          if (solicitudSeleccionada && String(solicitudSeleccionada.id) === String(id)) {
            setSolicitudSeleccionada({ ...solicitudSeleccionada, Estado: nextEstado });
          }
        },
        onError: (err) => {
          const mensaje = err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar el estado.';
          alert(mensaje);
        },
      },
    );
  };

  const renderEstadoBadge = (estado?: string) => {
    const currentEstado = estado ?? 'Pendiente';
    return <Badge variant={getEstadoBadgeVariant(currentEstado)}>{currentEstado}</Badge>;
  };

  if (error) {
    const mensaje = error instanceof ApiError
      ? error.message
      : 'No se pudieron cargar las solicitudes.';
    return <div>{mensaje}</div>;
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
                        if (cell.column.id === 'Estado') {
                          const originalRow = row.original;
                          const currentEstado = originalRow.Estado ?? 'Pendiente';

                          return (
                            <AdminTableCell key={cell.id}>
                              <div className={cn('inline-flex items-center rounded-full p-1', estadoSelectClass(currentEstado))}>
                                {isAdmin ? (
                                  <Select
                                    className="min-h-0 border-0 bg-transparent px-2 py-1 text-xs font-bold shadow-none focus-visible:ring-0"
                                    value={currentEstado}
                                    onChange={(e) =>
                                      handleEstadoChange(
                                        originalRow.id,
                                        e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
                                      )
                                    }
                                    disabled={isUpdatingEstado}
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                  </Select>
                                ) : (
                                  <span className="px-2 py-1">{currentEstado}</span>
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
                subtitle={row.TipoSacramento ?? 'Sacramento'}
                badges={renderEstadoBadge(row.Estado)}
                meta={[
                  {
                    icon: <IdCard size={12} />,
                    label: 'Cédula',
                    value: row.Cedula ?? '—',
                  },
                  {
                    icon: <Phone size={12} />,
                    label: 'Teléfono',
                    value: row.Telefono || 'No provisto',
                  },
                ]}
                footer={
                  isAdmin ? (
                    <Select
                      className={cn('w-full', estadoSelectClass(row.Estado))}
                      value={row.Estado ?? 'Pendiente'}
                      disabled={isUpdatingEstado}
                      aria-label={`Estado de solicitud de ${nombreCompleto(row)}`}
                      onChange={(e) =>
                        handleEstadoChange(
                          row.id,
                          e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
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
                    label: 'Ver solicitud',
                    icon: <Eye size={15} />,
                    variant: 'primary',
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
        title={solicitudSeleccionada ? nombreCompleto(solicitudSeleccionada) : 'Solicitud'}
        subtitle={solicitudSeleccionada?.TipoSacramento}
        badges={solicitudSeleccionada ? renderEstadoBadge(solicitudSeleccionada.Estado) : undefined}
        onClose={() => setSolicitudSeleccionada(null)}
        actions={
          solicitudSeleccionada && isAdmin ? (
            <label className="flex w-full flex-col gap-1.5 text-sm font-semibold text-slate-700">
              <span>Cambiar estado</span>
              <Select
                className={estadoSelectClass(solicitudSeleccionada.Estado)}
                value={solicitudSeleccionada.Estado ?? 'Pendiente'}
                onChange={(e) =>
                  handleEstadoChange(
                    solicitudSeleccionada.id,
                    e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
                  )
                }
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <p className="m-0 text-sm text-slate-600">
              <strong className="text-slate-800">Cédula:</strong> {solicitudSeleccionada.Cedula}
            </p>
            <p className="m-0 text-sm text-slate-600">
              <strong className="text-slate-800">Correo:</strong> {solicitudSeleccionada.Correo}
            </p>
            <p className="m-0 text-sm text-slate-600">
              <strong className="text-slate-800">Teléfono:</strong>{' '}
              {solicitudSeleccionada.Telefono || 'No provisto'}
            </p>
            <p className="m-0 text-sm text-slate-600">
              <strong className="text-slate-800">Motivo:</strong> {solicitudSeleccionada.Motivo}
            </p>
          </div>
        )}
      </AdminRecordDetailSheet>

      {!isPending && table.getRowModel().rows.length > 0 && (
        <AdminTableFooter>
          <span>
            Total de registros: <strong className="text-royal-blue">{totalItems}</strong>
          </span>
          <AdminPagination>
            <AdminPaginationButton
              type="button"
              onClick={goToPreviousPage}
              disabled={!canPreviousPage}
            >
              ← Anterior
            </AdminPaginationButton>
            <span>
              Página <strong className="text-royal-blue">{currentPage}</strong> de{' '}
              <strong className="text-royal-blue">{totalPages}</strong>
            </span>
            <AdminPaginationButton
              type="button"
              onClick={goToNextPage}
              disabled={!canNextPage}
            >
              Siguiente →
            </AdminPaginationButton>
          </AdminPagination>
        </AdminTableFooter>
      )}
    </AdminModule>
  );
};

export default TableSacramentos;
