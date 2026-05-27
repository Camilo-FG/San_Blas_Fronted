import { useMemo, useState } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    SortingState,
} from '@tanstack/react-table';
import { Usuario } from 'src/types/Usuario';

interface UserListProps {
    users: Usuario[];
    onAddUser: () => void;
}

const columnHelper = createColumnHelper<Usuario>();

export const UserList = ({ users, onAddUser }: UserListProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    //se inverte el array para mostrar  usuarios más recientes primero
    const sortedUsers = useMemo(() => {
        const recordsLength = users.length;
        const inverted: Usuario[] = [];
        for (let i = 0; i < recordsLength; i++) {
            inverted.push(users[recordsLength - 1 - i]);
        }
        return inverted;
    }, [users]);

    const columns = useMemo(
        () => [
            columnHelper.accessor('UserName', {
                header: 'Nombre de Usuario',
                cell: (info) => info.getValue(),
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
                cell: (info) => info.getValue() ? 'Admin' : 'User',
            }),
            columnHelper.accessor('State', {
                header: 'Estado',
                cell: (info) => (
                    <span className={`status-badge ${info.getValue() ? 'status-active' : 'status-inactive'}`}>
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
        data: sortedUsers,
        columns,
        state: { sorting, globalFilter },
        initialState: {
            pagination: { pageSize: 7 },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="user-list-container">
            <div className="user-search-wrapper">
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="user-search-input"
                />
                <button onClick={onAddUser} className="user-add-button">
                    + Agregar usuario
                </button>
            </div>
            <table className="users-table">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                    <div className="table-header-cell">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() && (
                                            <span className="sort-indicator">
                                                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
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
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="table-no-data">
                                No se encontraron usuarios
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="table-footer">
                <span className="table-records-count">
                    Total de registros: <strong>{table.getFilteredRowModel().rows.length}</strong>
                </span>
                <div className="pagination-controls">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="pagination-btn"
                    >
                        ← Anterior
                    </button>
                    <span className="pagination-info">
                        Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de <strong>{table.getPageCount()}</strong>
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="pagination-btn"
                    >
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    );
};