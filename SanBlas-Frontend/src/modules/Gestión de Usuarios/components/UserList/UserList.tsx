import { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
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
import { Usuario, isAdminRole } from '../../../../types/Usuario';
import { usePagination } from '../../../../shared/hooks/usePagination';
import UpdateUserModal from '../UpdateUserModal/UpdateUserModal';
import { useUpdateUser } from '../../hooks/hooksUsuarios/useUpdateUser';
import { AdminRecordCard } from '../../../../shared/components/admin/AdminRecordCard';
import { AdminRecordDetailSheet } from '../../../../shared/components/admin/AdminRecordDetailSheet';

interface UserListProps {
    users: Usuario[];
    onAddUser: () => void;
    onRefetch: () => void;
}

const columnHelper = createColumnHelper<Usuario>();

export const UserList = ({ users, onAddUser, onRefetch  }: UserListProps) => { 
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const { actualizarUsuario } = useUpdateUser();

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
            columnHelper.accessor('userName', {
                header: 'Nombre de Usuario',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('phoneNumber', {
                header: 'Teléfono',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('role', {
                header: 'Rol',
                cell: (info) => isAdminRole(info.getValue()) ? 'Admin' : 'User',
            }),
            columnHelper.accessor('state', {
                header: 'Estado',
                cell: (info) => (
                    <span className={`status-badge ${info.getValue() ? 'status-active' : 'status-inactive'}`}>
                        {info.getValue() ? 'Activo' : 'Inactivo'}
                    </span>
                ),
            }),
            columnHelper.accessor('creationDate', {
                header: 'Fecha de Creación',
                cell: (info) => new Date(info.getValue()).toLocaleDateString('es-ES'),
            }),
            columnHelper.display({       
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => (
                <button
                    className="user-edit-button"
                    onClick={() => setUsuarioEditando(row.original)}
                >
                    ✏ Editar
                </button>
            ),
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

    const {
        totalItems,
        currentPage,
        totalPages,
        canPreviousPage,
        canNextPage,
        goToPreviousPage,
        goToNextPage,
    } = usePagination(table);

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
            <div className="admin-responsive-data">
            <table className="users-table admin-responsive-data__table">
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

            <div className="admin-responsive-data__cards">
                {table.getRowModel().rows.map((row) => {
                    const usuario = row.original;
                    return (
                        <AdminRecordCard
                            key={usuario.id}
                            title={usuario.userName}
                            subtitle={usuario.email}
                            badges={
                                <>
                                    <span className="status-badge">
                                        {isAdminRole(usuario.role) ? 'Admin' : 'User'}
                                    </span>
                                    <span className={`status-badge ${usuario.state ? 'status-active' : 'status-inactive'}`}>
                                        {usuario.state ? 'Activo' : 'Inactivo'}
                                    </span>
                                </>
                            }
                            onViewDetail={() => setUsuarioSeleccionado(usuario)}
                            viewLabel="Ver detalle"
                        />
                    );
                })}
            </div>
            </div>

            <div className="table-footer">
                <span className="table-records-count">
                    Total de registros: <strong>{totalItems}</strong>
                </span>
                <div className="pagination-controls">
                    <button
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
                        onClick={goToNextPage}
                        disabled={!canNextPage}
                        className="pagination-btn"
                    >
                        Siguiente →
                    </button>
                </div>
            </div>

            <AdminRecordDetailSheet
                open={usuarioSeleccionado !== null}
                title={usuarioSeleccionado?.userName ?? 'Usuario'}
                subtitle={usuarioSeleccionado?.email}
                badges={
                    usuarioSeleccionado ? (
                        <>
                            <span className="status-badge">
                                {isAdminRole(usuarioSeleccionado.role) ? 'Admin' : 'User'}
                            </span>
                            <span className={`status-badge ${usuarioSeleccionado.state ? 'status-active' : 'status-inactive'}`}>
                                {usuarioSeleccionado.state ? 'Activo' : 'Inactivo'}
                            </span>
                        </>
                    ) : undefined
                }
                onClose={() => setUsuarioSeleccionado(null)}
                primaryAction={
                    usuarioSeleccionado
                        ? {
                            label: 'Editar',
                            icon: <Pencil size={16} />,
                            onClick: () => {
                                setUsuarioEditando(usuarioSeleccionado);
                                setUsuarioSeleccionado(null);
                            },
                        }
                        : undefined
                }
            >
                {usuarioSeleccionado && (
                    <div className="admin-detail-fields">
                        <p className="admin-detail-field"><strong>Teléfono:</strong> {usuarioSeleccionado.phoneNumber || 'No provisto'}</p>
                        <p className="admin-detail-field">
                            <strong>Fecha de creación:</strong>{' '}
                            {new Date(usuarioSeleccionado.creationDate).toLocaleDateString('es-CR')}
                        </p>
                    </div>
                )}
            </AdminRecordDetailSheet>

<UpdateUserModal
    isOpen={usuarioEditando !== null}
    onClose={() => setUsuarioEditando(null)}
    onSave={async (data) => {
        if (!usuarioEditando) return;

        const ok = await actualizarUsuario(usuarioEditando.id, {
            ...(data.nombre.trim() !== usuarioEditando.userName
              ? { userName: data.nombre }
              : {}),
            email: data.correo,
            phoneNumber: data.telefono,
            ...(data.contraseña.trim()
              ? {
                  password: data.contraseña,
                  confirmPassword: data.contraseña,
                }
              : {}),
            role: data.rol,
            state: data.estado,
        });

        if (ok) {
            setUsuarioEditando(null);
            onRefetch();
        }
    }}
    usuario={usuarioEditando}
    users={users}
/>
        </div>
    );
};