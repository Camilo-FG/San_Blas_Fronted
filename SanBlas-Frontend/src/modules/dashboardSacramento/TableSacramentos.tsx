
import { useEffect, useMemo, useState } from 'react';
import { useGetSolicitudes } from '../solicSacramento/Api/useGetSolicitudes';
import { useUpdateSolicitudEstado } from '../solicSacramento/Api/useUpdateSolicitudEstado';
import { FormSacramento } from 'src/types/formSacramento';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const columnHelper = createColumnHelper<FormSacramento>()

const columns = [
  columnHelper.accessor('id', {
    header: () => 'ID',
    cell: (info) => info.getValue(),
  }),
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
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value || '');

  const handleEstadoChange = (id: number | string | undefined, nextEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
    if (id === undefined || id === null) {
      return;
    }

    updateEstado({
      id,
      Estado: nextEstado,
      currentRows: rows,
    });

    setLocalRows((current) =>
      current.map((solicitud) =>
        String(solicitud.id) === String(id) ? { ...solicitud, Estado: nextEstado } : solicitud,
      ),
    );
  };

  if (error) return <div>{JSON.stringify(error)}</div>;

  return (
    <div className="p-2">
      <input value={query} type="text" placeholder="Buscar por nombre, apellidos o cédula" onChange={handleSearch} />
      {!isPending && (
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
      )}
    </div>
  );
}

export default TableSacramentos