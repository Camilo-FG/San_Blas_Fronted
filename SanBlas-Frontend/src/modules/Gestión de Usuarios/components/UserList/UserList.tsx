import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Mail,
    Pencil,
    Phone,
    RefreshCw,
    SlidersHorizontal,
    Trash2,
    User,
    X,
} from 'lucide-react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
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
import type { FiltrosAvanzados } from '../../hooks/hooksUsuarios/useGetUsuariosPaginados';
import type { OrdenUsuarios } from '../../services/userServices';
import {
    ordenDesdeSorting,
    sortingDesdeOrden,
    textoABusqueda,
} from '../../Utils/usuariosBusqueda';
import { useDebouncedValue } from '../../../../shared/hooks/useDebouncedValue';
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
    EmptyState,
    ErrorMessage,
    Modal,
    PageLoader,
    Select,
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
    filtros: FiltrosAvanzados;
    filtrosActivos: number;
    orden: OrdenUsuarios;
    cargando: boolean;
    error: string | null;
    setPagina: (page: number) => void;
    setLimite: (size: number) => void;
    setBusqueda: (search: string) => void;
    setOrden: (orden: OrdenUsuarios) => void;
    aplicarFiltros: (filtros: FiltrosAvanzados) => void;
    limpiarFiltros: () => void;
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
    filtros,
    filtrosActivos,
    orden,
    cargando,
    error,
    setPagina,
    setLimite,
    setBusqueda,
    setOrden,
    aplicarFiltros,
    limpiarFiltros,
}: UserListProps) => {
    const { user: usuarioSesion } = useAuth();
    const { showToast } = useToast();
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
    const { actualizarUsuario } = useUpdateUser();
    const { eliminarUsuario, loading: eliminando } = useDeleteUser();
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtroRolTemp, setFiltroRolTemp] = useState(filtros.role ?? '');
    const [filtroEstadoTemp, setFiltroEstadoTemp] = useState(filtros.state ?? '');
    const [textoBusqueda, setTextoBusqueda] = useState(busqueda);
    const textoDebounced = useDebouncedValue(textoBusqueda, 400);
    // último texto que nosotros mandamos, para distinguirlo de un clear que venga del padre
    const textoAplicadoRef = useRef('');
    // hay datos viejos en pantalla mientras llega la respuesta nueva
    const ocupado = cargando && users.length > 0;

    // manda el texto al hook de paginación; con menos de 2 caracteres no se filtra
    // (y si el padre limpió los filtros, que el input no quede con texto fantasma)
    const aplicarBusqueda = (texto: string) => {
        const valor = textoABusqueda(texto);
        textoAplicadoRef.current = valor;
        setBusqueda(valor);
    };

    // busca sola después de dejar de escribir, en vez de un request por tecla
    useEffect(() => {
        aplicarBusqueda(textoDebounced);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textoDebounced]);

    // si el padre vació la búsqueda (p. ej. "Limpiar"), reflejarlo en el input
    useEffect(() => {
        if (busqueda === '' && textoAplicadoRef.current !== '') {
            textoAplicadoRef.current = '';
            setTextoBusqueda('');
        }
    }, [busqueda]);

    // el orden lo manda el servidor: la flecha del encabezado solo refleja ese estado
    const sorting: SortingState = useMemo(() => sortingDesdeOrden(orden), [orden]);

    // al clicar un encabezado pasamos el orden al hook, que reconsulta y vuelve a la pág 1.
    // tanstack puede mandar el array directo o un updater: hay que resolver ambos
    const manejarCambioOrden = (
        nuevo:
            | SortingState
            | ((previo: SortingState) => SortingState),
    ) => {
        const siguiente = typeof nuevo === 'function' ? nuevo(sorting) : nuevo;
        setOrden(ordenDesdeSorting(siguiente));
    };

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

    // paginación y orden son server-side; la tabla solo pinta la página actual.
    // sin getSortedRowModel evitamos reordenar a medias la página visible (el backend ya lo hizo).
    // enableSortingRemoval en false: sin esto, al clicar la columna ya ordenada tanstack
    // borra el orden y como volvemos al default (mismo valor) la flecha nunca cambiaba
    const table = useReactTable({
        data: users,
        columns,
        state: { sorting },
        onSortingChange: manejarCambioOrden,
        enableSortingRemoval: false,
        getCoreRowModel: getCoreRowModel(),
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
                    value={textoBusqueda}
                    onChange={(e) => setTextoBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                        // Enter busca al toque, sin esperar el debounce de 400ms
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        aplicarBusqueda(textoBusqueda);
                    }}
                    aria-label="Buscar usuarios"
                    className="min-w-[200px] flex-1"
                />
                <div className="relative flex items-center gap-2">
                    <Button
                        variant={mostrarFiltros ? 'primary' : 'secondary'}
                        className="shrink-0 gap-1.5"
                        onClick={() => setMostrarFiltros((p) => !p)}
                    >
                        <SlidersHorizontal size={16} />
                        <span className="max-sm:hidden">Filtros</span>
                        {filtrosActivos > 0 && (
                            <Badge variant="info" className="ml-1 text-[10px]">
                                {filtrosActivos}
                            </Badge>
                        )}
                    </Button>
                    <Button variant="royal" className="shrink-0" onClick={onAddUser}>
                        + Agregar usuario
                    </Button>
                </div>
            </AdminToolbar>

            {ocupado && (
                <p
                    role="status"
                    aria-live="polite"
                    className="m-0 flex items-center gap-2 text-sm text-text-muted"
                >
                    <Loader2 size={16} className="animate-spin" />
                    Buscando usuarios...
                </p>
            )}

            {mostrarFiltros && (
                <div className="flex flex-col gap-3 rounded-xl border border-border-strong bg-surface-muted p-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-bold text-text-muted uppercase">
                            Rol
                        </label>
                        <Select
                            value={filtroRolTemp}
                            onChange={(e) => setFiltroRolTemp(e.target.value)}
                            className="min-h-10"
                        >
                            <option value="">Todos los roles</option>
                            {roles.map((rol) => (
                                <option key={rol.id} value={rol.clave}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-bold text-text-muted uppercase">
                            Estado
                        </label>
                        <Select
                            value={filtroEstadoTemp}
                            onChange={(e) => setFiltroEstadoTemp(e.target.value)}
                            className="min-h-10"
                        >
                            <option value="">Todos</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="royal"
                            className="min-h-10 gap-1.5"
                            disabled={cargando}
                            onClick={() => {
                                aplicarFiltros({
                                    role: filtroRolTemp || undefined,
                                    state: filtroEstadoTemp || undefined,
                                });
                                aplicarBusqueda(textoBusqueda);
                            }}
                        >
                            {cargando ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : null}
                            Buscar
                        </Button>
                        {(filtroRolTemp || filtroEstadoTemp) && (
                            <Button
                                variant="secondary"
                                className="min-h-10 gap-1"
                                onClick={() => {
                                    setFiltroRolTemp('');
                                    setFiltroEstadoTemp('');
                                    limpiarFiltros();
                                }}
                            >
                                <X size={14} />
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {cargando && users.length === 0 ? (
                <PageLoader />
            ) : error ? (
                <div className="flex flex-col items-start gap-3">
                    <ErrorMessage message={error} className="w-full" />
                    <Button
                        variant="royal"
                        className="gap-1.5"
                        onClick={onRefetch}
                    >
                        <RefreshCw size={16} />
                        Reintentar
                    </Button>
                </div>
            ) : (
                <>
                    <div
                        className={cn('hidden md:block', ocupado && 'opacity-60')}
                        aria-busy={ocupado}
                    >
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
                                                className="py-10"
                                            >
                                                <EmptyState
                                                    title={
                                                        busqueda.trim() || filtrosActivos > 0
                                                            ? 'No se encontraron resultados'
                                                            : 'No hay usuarios registrados'
                                                    }
                                                    description={
                                                        busqueda.trim() || filtrosActivos > 0
                                                            ? `No hubo coincidencias para "${busqueda.trim() || "filtros aplicados"}". Intente ajustar o limpiar los criterios de búsqueda.`
                                                            : undefined
                                                    }
                                                />
                                            </AdminTableCell>
                                        </AdminTableRow>
                                    )}
                                </tbody>
                            </AdminTable>
                        </AdminTablePanel>
                    </div>

                    <div
                        className={cn(
                            'flex flex-col gap-2.5 md:hidden',
                            ocupado && 'opacity-60',
                        )}
                        aria-busy={ocupado}
                    >
                        {table.getRowModel().rows.length === 0 ? (
                            <EmptyState
                                title={
                                    busqueda.trim() || filtrosActivos > 0
                                        ? 'No se encontraron resultados'
                                        : 'No hay usuarios registrados'
                                }
                                description={
                                    busqueda.trim() || filtrosActivos > 0
                                        ? `No hubo coincidencias para "${busqueda.trim() || "filtros aplicados"}". Intente ajustar o limpiar los criterios de búsqueda.`
                                        : undefined
                                }
                            />
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
                    const rolesPrevios = [
                        ...(usuarioEditando.roles &&
                        usuarioEditando.roles.length > 0
                          ? usuarioEditando.roles
                          : [usuarioEditando.role]),
                    ]
                        .sort()
                        .join(",");
                    const rolesNuevos = [...data.roles].sort().join(",");

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
                                  // los roles solo se envían si cambiaron para no pisar roles del backend
                                  ...(rolesNuevos !== rolesPrevios
                                      ? { roles: data.roles }
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