import { useMemo } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Usuario } from 'src/types/Usuario';
import '../styles/UserList.css';

interface UserListProps {
    users: Usuario[];
}

const columnHelper = createColumnHelper<Usuario>();

export const UserList = ({ users }: UserListProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(
        () => [
            columnHelper.accessor('UserName', {
                header: 'Nombre de Usuario',
                cell: (info) => info.getValue(),
                footer: (props) => props.column.id,
            }),
            columnHelper.accessor('Email', {
                header: 'Email',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('PhoneNumber', {
                header: 'Teléfono',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('UserRole', {
                header: 'Rol',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('State', {
                header: 'Estado',
                cell: (info) => (
                    <span className={info.getValue() ? 'status-active' : 'status-inactive'}>
                        {info.getValue() ? 'Activo' : 'Inactivo'}
                    </span>
                ),
            }),
            columnHelper.accessor('CreationDate', {
                header: 'Fecha de Creación',
                cell: (info) => new Date(info.getValue()).toLocaleDateString('es-ES'),
            }),
        ],
        []
    );

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="user-list-container">
            <div className="table-header">
                <h2>Gestión de Usuarios</h2>
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="table-header-cell"
                                    >
                                        <div className="header-content">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getIsSorted() && (
                                                <span className="sort-indicator">
                                                    {header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="table-row">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="table-cell">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="no-data">
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="table-footer">
                <span>Total de registros: {table.getRowModel().rows.length}</span>
            </div>
        </div>
    );
};