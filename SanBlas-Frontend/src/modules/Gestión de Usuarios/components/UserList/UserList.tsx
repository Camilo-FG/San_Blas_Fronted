import { useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Mail,
    Pencil,
    Phone,
    Trash2,
    User,
} from 'lucide-react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';
import { Usuario } from '../../../../types/Usuario';
import { etiquetaRol, type Rol } from '../../../../types/Rol';
import { useAuth } from '../../../../context/AuthContext';
import UpdateUserModal from '../UpdateUserModal/UpdateUserModal';
import { PerfilUsuarioCard } from '../PerfilUsuarioCard/PerfilUsuarioCard';
import { useUpdateUser } from '../../hooks/hooksUsuarios/useUpdateUser';
import { useDeleteUser } from '../../hooks/hooksUsuarios/useDeleteUser';
import { normalizarTexto } from '../../Utils/normalizarTexto';
import { AdminRecordCard } from '../../../../shared/components/admin/AdminRecordCard';
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
    ConfirmacionAccionModal,
    ErrorMessage,
    Modal,
    PageLoader,
    cn,
    useToast,
} from '../../../../shared/ui';

interface UserListProps {
    users: Usuario[];
    total: number;
    totalPages: number;
    roles: Rol[];
    onAddUser: () => void;
    onRefetch: () => void;
    pagina: number;
    limite: number;
    busqueda: string;
    cargando: boolean;
    error: string | null;
    setPagina: (page: number) => void;
    setLimite: (size: number) => void;
    setBusqueda: (search: string) => void;
}

const TAMANOS_PAGINA = [10, 25, 50] as const;
const ACCENTO_ADMIN = '#003366'; // acento de las tarjetas de usuarios en móvil
const BOTON_ICONO_TABLA =
    'inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';
const BOTON_ICONO_ELIMINAR =
    'inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-40';

const columnHelper = createColumnHelper<Usuario>();

const formatFechaCreacion = (fecha?: string | null) => {
    if (!fecha) return '—';
    const date = new Date(fecha.includes('T') ? fecha : `${fecha}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const esElUsuarioActual = (
    usuario: Usuario,
    actualId: number | null | undefined,
    actualEmail?: string,
) => {
    if (actualId != null && usuario.id === actualId) return true;
    if (!actualEmail) return false;
    return usuario.email.toLowerCase() === actualEmail.toLowerCase();
};

export const UserList = ({
    users,
    total,
    totalPages,
    roles,
    onAddUser,
    onRefetch,
    pagina,
    limite,
    busqueda,
    cargando,
    error,
    setPagina,
    setLimite,
    setBusqueda,
}: UserListProps) => {
    const { user: usuarioSesion } = useAuth();
    const { showToast } = useToast();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
    const { actualizarUsuario } = useUpdateUser();
    const { eliminarUsuario, loading: eliminando } = useDeleteUser();

    const columns = useMemo(
        () => [
            columnHelper.accessor('userName', {
                header: 'Nombre de Usuario',
                cell: (info) => (
                    <span className="font-medium text-text">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => (
                    <span className="text-text-secondary">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('phoneNumber', {
                header: 'Teléfono',
                cell: (info) => (
                    <span className="tabular-nums text-text-secondary">
                        {info.getValue() || '—'}
                    </span>
                ),
            }),
            columnHelper.accessor('role', {
                header: 'Rol',
                cell: (info) => (
                    <span className="text-text-secondary">{etiquetaRol(info.getValue(), roles)}</span>
                ),
            }),
            columnHelper.accessor('state', {
                header: 'Estado',
                cell: (info) => (
                    <Badge variant={info.getValue() ? 'success' : 'danger'}>
                        {info.getValue() ? 'Activo' : 'Inactivo'}
                    </Badge>
                ),
            }),
            columnHelper.accessor('creationDate', {
                header: 'Fecha de Creación',
                cell: (info) => (
                    <span className="tabular-nums text-text-secondary">
                        {formatFechaCreacion(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => {
                    const usuario = row.original;
                    const esPropio = esElUsuarioActual(
                        usuario,
                        usuarioSesion?.id,
                        usuarioSesion?.email,
                    );
                    return (
                        <span className="inline-flex items-center gap-0.5">
                            <button
                                type="button"
                                onClick={() => setUsuarioSeleccionado(usuario)}
                                aria-label="Ver perfil"
                                className={BOTON_ICONO_TABLA}
                            >
                                <Eye size={17} strokeWidth={1.5} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setUsuarioEditando(usuario)}
                                aria-label="Editar usuario"
                                className={BOTON_ICONO_TABLA}
                            >
                                <Pencil size={17} strokeWidth={1.5} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setUsuarioAEliminar(usuario)}
                                aria-label="Eliminar usuario"
                                className={BOTON_ICONO_ELIMINAR}
                                disabled={esPropio}
                                title={
                                    esPropio
                                        ? 'No puede eliminar su propia cuenta'
                                        : 'Eliminar usuario'
                                }
                            >
                                <Trash2 size={17} strokeWidth={1.5} />
                            </button>
                        </span>
                    );
                },
            }),
        ],
        [usuarioSesion?.email, usuarioSesion?.id, roles],
    );

    // paginación y búsqueda ahora son server-side; la tabla solo recibe la página actual
    const table = useReactTable({
        data: users,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const canPreviousPage = pagina > 1 && !cargando;
    const canNextPage = pagina < totalPages && !cargando;
    const primerRegistro = total === 0 ? 0 : (pagina - 1) * limite + 1;
    const ultimoRegistro = Math.min(pagina * limite, total);

    return (
        <AdminModule>
            <AdminToolbar>
                <AdminSearch
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar usuarios"
                    className="min-w-[200px] flex-1"
                />
                <Button variant="royal" className="shrink-0" onClick={onAddUser}>
                    + Agregar usuario
                </Button>
            </AdminToolbar>

            {cargando && users.length === 0 ? (
                <PageLoader />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : (
                <>
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
                        {table.getRowModel().rows.length === 0 ? (
                            <p className="m-0 rounded-2xl border border-border-strong bg-surface px-4 py-10 text-center text-sm text-text-muted">
                                No se encontraron usuarios
                            </p>
                        ) : (
                            table.getRowModel().rows.map((row) => {
                                const usuario = row.original;
                                return (
                                    <AdminRecordCard
                                        key={usuario.id}
                                        icon={<User size={20} />}
                                        accent={ACCENTO_ADMIN}
                                        code={`USR-${usuario.id}`}
                                        title={usuario.userName}
                                        subtitle={etiquetaRol(usuario.role, roles)}
                                        badges={
                                            <Badge variant={usuario.state ? 'success' : 'danger'}>
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
                                                label: 'Ver perfil',
                                                icon: <Eye size={15} />,
                                                variant: 'primary',
                                                onClick: () => setUsuarioSeleccionado(usuario),
                                            },
                                            {
                                                label: 'Editar',
                                                icon: <Pencil size={15} />,
                                                variant: 'ghost',
                                                onClick: () => setUsuarioEditando(usuario),
                                            },
                                            ...(!esElUsuarioActual(
                                                usuario,
                                                usuarioSesion?.id,
                                                usuarioSesion?.email,
                                            )
                                                ? [
                                                      {
                                                          label: 'Eliminar',
                                                          icon: <Trash2 size={15} />,
                                                          variant: 'danger' as const,
                                                          onClick: () => setUsuarioAEliminar(usuario),
                                                      },
                                                  ]
                                                : []),
                                        ]}
                                    />
                                );
                            })
                        )}
                    </div>

                    <AdminTableFooter pegadoAbajo>
                        <span className="text-sm text-text-muted">
                            Mostrando{' '}
                            <strong className="text-text tabular-nums">
                                {primerRegistro}-{ultimoRegistro}
                            </strong>{' '}
                            de <strong className="text-text tabular-nums">{total}</strong> registros
                        </span>
                        <AdminPagination>
                            <label className="mr-1 flex items-center gap-2 text-sm text-text-muted">
                                <span className="max-sm:hidden">Registros por página</span>
                                <span className="sm:hidden">Por página</span>
                                <select
                                    value={limite}
                                    onChange={(e) => setLimite(Number(e.target.value))}
                                    className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm tabular-nums text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                                    aria-label="Cantidad de registros por página"
                                >
                                    {TAMANOS_PAGINA.map((tamano) => (
                                        <option key={tamano} value={tamano}>
                                            {tamano}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <AdminPaginationButton
                                type="button"
                                onClick={() => setPagina(pagina - 1)}
                                disabled={!canPreviousPage}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={16} strokeWidth={2} />
                            </AdminPaginationButton>
                            <span className="text-sm whitespace-nowrap text-text-muted">
                                Página{' '}
                                <strong className="text-text tabular-nums">{pagina}</strong> de{' '}
                                <strong className="text-text tabular-nums">{totalPages || 1}</strong>
                            </span>
                            <AdminPaginationButton
                                type="button"
                                onClick={() => setPagina(pagina + 1)}
                                disabled={!canNextPage}
                                aria-label="Página siguiente"
                            >
                                <ChevronRight size={16} strokeWidth={2} />
                            </AdminPaginationButton>
                        </AdminPagination>
                    </AdminTableFooter>
                </>
            )}

            {usuarioSeleccionado && (
                <Modal
                    onClose={() => setUsuarioSeleccionado(null)}
                    title={`Perfil de ${usuarioSeleccionado.userName}`}
                    className="max-w-2xl p-0"
                    cerrarAlClicFuera={false}
                >
                    <PerfilUsuarioCard
                        usuario={usuarioSeleccionado}
                        roles={roles}
                        titulo="Perfil"
                        className="border-0 shadow-none"
                        espacioParaCerrar
                        onEstadoCambiado={() => onRefetch()}
                    />
                </Modal>
            )}

            <ConfirmacionAccionModal
                open={usuarioAEliminar !== null}
                title="Eliminar usuario"
                parteSubrayada="Eliminar usuario"
                iconoAdvertencia
                confirmVariant="danger"
                mensaje={
                    usuarioAEliminar ? (
                        <>
                            ¿Está seguro de eliminar a{' '}
                            <strong className="font-semibold text-text">
                                {usuarioAEliminar.userName}
                            </strong>
                            ? Esta acción no se puede deshacer: la cuenta quedará
                            inactiva y dejará de aparecer en el listado.
                        </>
                    ) : (
                        ''
                    )
                }
                confirmLabel="Sí, eliminar"
                pendingLabel="Eliminando..."
                isPending={eliminando}
                onConfirm={() => {
                    void (async () => {
                        if (!usuarioAEliminar) return;
                        const resultado = await eliminarUsuario(usuarioAEliminar.id);
                        if (resultado.ok) {
                            showToast('Usuario eliminado correctamente', 'error');
                            setUsuarioAEliminar(null);
                            onRefetch();
                            return;
                        }
                        showToast(resultado.mensaje, 'error');
                    })();
                }}
                onCancel={() => {
                    if (!eliminando) setUsuarioAEliminar(null);
                }}
            />

            <UpdateUserModal
                isOpen={usuarioEditando !== null}
                onClose={() => setUsuarioEditando(null)}
                onSave={async (data) => {
                    if (!usuarioEditando) return;
                    const esPropio = esElUsuarioActual(
                        usuarioEditando,
                        usuarioSesion?.id,
                        usuarioSesion?.email,
                    );

                    const resultado = await actualizarUsuario(usuarioEditando.id, {
                        ...(normalizarTexto(data.nombre) !==
                        normalizarTexto(usuarioEditando.userName)
                            ? { userName: normalizarTexto(data.nombre) }
                            : {}),
                        phoneNumber: normalizarTexto(data.telefono),
                        ...(data.contraseña.trim()
                            ? {
                                  password: data.contraseña.trim(),
                                  confirmPassword: data.contraseña.trim(),
                              }
                            : {}),
                        ...(esPropio
                            ? {}
                            : {
                                  // solo se envían si cambiaron para no pisar roles custom del backend
                                  ...(data.rol !== usuarioEditando.role
                                      ? { role: data.rol }
                                      : {}),
                                  ...(data.estado !== usuarioEditando.state
                                      ? { state: data.estado }
                                      : {}),
                              }),
                    });

                    if (resultado.ok) {
                        showToast('Usuario actualizado correctamente', 'success');
                        setUsuarioEditando(null);
                        onRefetch();
                        return;
                    }

                    showToast(resultado.mensaje, 'error');
                }}
                usuario={usuarioEditando}
                users={users}
                roles={roles}
                esUsuarioActual={
                    usuarioEditando
                        ? esElUsuarioActual(
                              usuarioEditando,
                              usuarioSesion?.id,
                              usuarioSesion?.email,
                          )
                        : false
                }
            />
        </AdminModule>
    );
};