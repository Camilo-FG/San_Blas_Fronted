import { useEffect, useMemo, useState } from 'react';
import { useUpdateSolicitudEstado } from '../solicSacramento/hooks/useUpdateSolicitudEstado';
import { FormSacramento } from '../../types/formSacramento';
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useGetSolicitudes } from '../solicSacramento/hooks/useGetSolicitudes';
import { usePagination } from '../../shared/hooks/usePagination';
import { ApiError } from '../../services/apiClient';


const columnHelper = createColumnHelper<FormSacramento>()

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
]

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();


const TableSacramentos = () => {
  const [query, setQuery] = useState('');
  const [localRows, setLocalRows] = useState<FormSacramento[]>([]);
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

  if (error) {
    const mensaje = error instanceof ApiError
      ? error.message
      : 'No se pudieron cargar las solicitudes.';
    return <div>{mensaje}</div>;
  }

  return (
    <div className="p-2">
      <input value={query} type="text" placeholder="Buscar por nombre, apellidos o cédula" onChange={handleSearch} />
      {!isPending && (
        <div className="table-responsive">
          <table>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === 'Estado') {
                      const originalRow = row.original;
                      const currentEstado = originalRow.Estado ?? 'Pendiente';
                      const estadoClass = `estado-badge estado-badge--${String(currentEstado).toLowerCase()}`;

                      return (
                        <td key={cell.id}>
                          <div className={estadoClass}>
                            <select
                              value={currentEstado}
                              onChange={(e) => handleEstadoChange(originalRow.id, e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado')}
                              disabled={isUpdatingEstado}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Aprobado">Aprobado</option>
                              <option value="Rechazado">Rechazado</option>
                            </select>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isPending && table.getRowModel().rows.length > 0 && (
        <div className="table-footer">
          <span className="table-records-count">
            Total de registros: <strong>{totalItems}</strong>
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!canPreviousPage}
              className="pagination-btn"
            >
              ← Anterior
            </button>
            <span className="pagination-info">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={!canNextPage}
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableSacramentos
