import { useMemo, useState } from 'react';
import { Pencil, User, Mail, Phone, Shield } from 'lucide-react';
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
    Button,
    cn,
} from '../../../../shared/ui';

interface UserListProps {
    users: Usuario[];
    onAddUser: () => void;
    onRefetch: () => void;
}

const columnHelper = createColumnHelper<Usuario>();

export const UserList = ({ users, onAddUser, onRefetch }: UserListProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const { actualizarUsuario } = useUpdateUser();

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
                cell: (info) => (
                    <span className="font-semibold text-royal-blue">{info.getValue()}</span>
                ),
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
                cell: (info) => (isAdminRole(info.getValue()) ? 'Admin' : 'User'),
            }),
            columnHelper.accessor('state', {
                header: 'Estado',
                cell: (info) => (
                    <Badge variant={info.getValue() ? 'info' : 'danger'}>
                        {info.getValue() ? 'Activo' : 'Inactivo'}
                    </Badge>
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
                    <Button
                        variant="royal"
                        className="min-h-9 px-3.5 py-1.5 text-xs"
                        onClick={() => setUsuarioEditando(row.original)}
                    >
                        <Pencil size={14} />
                        Editar
                    </Button>
                ),
            }),
        ],
        [],
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
        <AdminModule>
            <AdminToolbar>
                <AdminSearch
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    aria-label="Buscar usuarios"
                />
                <Button variant="primary" onClick={onAddUser}>
                    + Agregar usuario
                </Button>
            </AdminToolbar>

            <div className="hidden md:block">
                <AdminTablePanel>
                    <AdminTable>
                        <AdminTableHead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <AdminTableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <AdminTableHeaderCell
                                            key={header.id}
                                            className={cn(
                                                header.column.getCanSort() && 'cursor-pointer select-none',
                                            )}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getIsSorted() && (
                                                    <span className="text-xs opacity-60">
                                                        {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </div>
                                        </AdminTableHeaderCell>
                                    ))}
                                </AdminTableRow>
                            ))}
                        </AdminTableHead>
                        <tbody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <AdminTableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <AdminTableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </AdminTableCell>
                                        ))}
                                    </AdminTableRow>
                                ))
                            ) : (
                                <AdminTableRow>
                                    <AdminTableCell
                                        colSpan={columns.length}
                                        className="py-10 text-center text-text-muted"
                                    >
                                        No se encontraron usuarios
                                    </AdminTableCell>
                                </AdminTableRow>
                            )}
                        </tbody>
                    </AdminTable>
                </AdminTablePanel>
            </div>

            <div className="flex flex-col gap-2.5 md:hidden">
                {table.getRowModel().rows.map((row) => {
                    const usuario = row.original;
                    return (
                        <AdminRecordCard
                            key={usuario.id}
                            icon={<User size={20} />}
                            accent={isAdminRole(usuario.role) ? '#7c3aed' : '#003366'}
                            code={`USR-${usuario.id}`}
                            title={usuario.userName}
                            subtitle={isAdminRole(usuario.role) ? 'Administrador' : 'Usuario'}
                            badges={
                                <Badge variant={usuario.state ? 'info' : 'danger'}>
                                    {usuario.state ? 'Activo' : 'Inactivo'}
                                </Badge>
                            }
                            meta={[
                                {
                                    icon: <Mail size={12} />,
                                    label: 'Correo',
                                    value: usuario.email,
                                },
                                {
                                    icon: <Phone size={12} />,
                                    label: 'Teléfono',
                                    value: usuario.phoneNumber || 'No provisto',
                                },
                            ]}
                            actions={[
                                {
                                    label: 'Editar',
                                    icon: <Pencil size={15} />,
                                    variant: 'primary',
                                    onClick: () => setUsuarioEditando(usuario),
                                },
                                {
                                    label: 'Perfil',
                                    icon: <Shield size={15} />,
                                    variant: 'ghost',
                                    onClick: () => setUsuarioSeleccionado(usuario),
                                },
                            ]}
                        />
                    );
                })}
            </div>

            <AdminTableFooter>
                <span>
                    Total de registros: <strong className="text-royal-blue">{totalItems}</strong>
                </span>
                <AdminPagination>
                    <AdminPaginationButton
                        onClick={goToPreviousPage}
                        disabled={!canPreviousPage}
                    >
                        ← Anterior
                    </AdminPaginationButton>
                    <span>
                        Página <strong className="text-royal-blue">{currentPage}</strong> de{' '}
                        <strong className="text-royal-blue">{totalPages}</strong>
                    </span>
                    <AdminPaginationButton onClick={goToNextPage} disabled={!canNextPage}>
                        Siguiente →
                    </AdminPaginationButton>
                </AdminPagination>
            </AdminTableFooter>

            <AdminRecordDetailSheet
                open={usuarioSeleccionado !== null}
                title={usuarioSeleccionado?.userName ?? 'Usuario'}
                subtitle={usuarioSeleccionado?.email}
                badges={
                    usuarioSeleccionado ? (
                        <>
                            <Badge variant="neutral">
                                {isAdminRole(usuarioSeleccionado.role) ? 'Admin' : 'User'}
                            </Badge>
                            <Badge variant={usuarioSeleccionado.state ? 'info' : 'danger'}>
                                {usuarioSeleccionado.state ? 'Activo' : 'Inactivo'}
                            </Badge>
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
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <p className="m-0 text-sm text-slate-600">
                            <strong className="text-slate-800">Teléfono:</strong>{' '}
                            {usuarioSeleccionado.phoneNumber || 'No provisto'}
                        </p>
                        <p className="m-0 text-sm text-slate-600">
                            <strong className="text-slate-800">Fecha de creación:</strong>{' '}
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
        </AdminModule>
    );
};
