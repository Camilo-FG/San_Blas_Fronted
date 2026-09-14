import { useState } from 'react';
import { UserList } from '../components/UserList/UserList';
import CreateUserModal from '../components/CreateUserModal/CreateUserModal';
import CreateRolModal from '../components/CreateRolModal/CreateRolModal';
import { RolesYPermisos } from '../components/RolesYPermisos/RolesYPermisos';
import { useGetUserList } from '../hooks/hooksUsuarios/useGetUserList';
import { useGetUsuariosPaginados } from '../hooks/hooksUsuarios/useGetUsuariosPaginados';
import { useCreateUser } from '../hooks/hooksUsuarios/useCreateUser';
import { useGetRoles } from '../hooks/hooksUsuarios/useGetRoles';
import { useCreateRol } from '../hooks/hooksUsuarios/useCreateRol';
import { AdminModule, ErrorMessage, PageLoader, cn, useToast } from '../../../shared/ui';

type PestanaUsuarios = 'usuarios' | 'roles';

const PESTANAS: { id: PestanaUsuarios; label: string }[] = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'roles', label: 'Roles y permisos' },
];

const GestionUsuarios = () => {
    const { users, loading, error, refetch } = useGetUserList();
    // la lista paginada para la tabla; la completa sigue usándose para validar duplicados y contar roles
    const {
        users: usuariosPagina,
        total: totalUsuarios,
        totalPages,
        loading: cargandoPagina,
        error: errorPagina,
        pagina,
        limite,
        busqueda,
        setPagina,
        setLimite,
        setBusqueda,
        refetch: refetchPagina,
    } = useGetUsuariosPaginados();
    const { roles, loading: cargandoRoles, error: errorRoles, refetch: refetchRoles } = useGetRoles();
    const { crearUsuario, loading: creando } = useCreateUser();
    const { crear: crearRol, loading: creandoRol } = useCreateRol();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalRolAbierto, setModalRolAbierto] = useState(false);
    const [pestana, setPestana] = useState<PestanaUsuarios>('usuarios');

    const handleSaveUser = async (userData: {
        nombre: string;
        correo: string;
        telefono: string;
        contraseña: string;
        confirmarContraseña: string;
        rol: string;
    }) => {
        const resultado = await crearUsuario({
            userName: userData.nombre,
            email: userData.correo,
            phoneNumber: userData.telefono,
            password: userData.contraseña,
            confirmPassword: userData.confirmarContraseña,
            role: userData.rol,
        });

        if (resultado.ok) {
            showToast('Usuario creado correctamente', 'success');
            setIsModalOpen(false);
            void refetch();
            void refetchPagina();
            return true;
        }

        showToast(resultado.mensaje, 'error');
        return false;
    };

    const handleSaveRol = async (data: {
        nombre: string;
        descripcion: string;
        permisos: string[];
    }) => {
        const resultado = await crearRol(data);
        if (resultado.ok) {
            showToast('Rol creado correctamente', 'success');
            setModalRolAbierto(false);
            void refetchRoles();
            return true;
        }
        showToast(resultado.mensaje, 'error');
        return false;
    };

    return (
        <AdminModule>
            <div
                className="flex gap-1 border-b border-border-strong"
                role="tablist"
                aria-label="Secciones de gestión de usuarios"
            >
                {PESTANAS.map((item) => {
                    const activa = pestana === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            id={`tab-${item.id}`}
                            aria-selected={activa}
                            aria-controls={`panel-${item.id}`}
                            tabIndex={activa ? 0 : -1}
                            className={cn(
                                'cursor-pointer border-0 border-b-2 bg-transparent px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring',
                                activa
                                    ? 'border-royal-blue text-royal-blue'
                                    : 'border-transparent text-text-muted hover:text-royal-blue',
                            )}
                            onClick={() => setPestana(item.id)}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {pestana === 'usuarios' && (
                <div
                    id="panel-usuarios"
                    role="tabpanel"
                    aria-labelledby="tab-usuarios"
                >
                    {loading ? (
                        <PageLoader />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <UserList
                            users={usuariosPagina}
                            total={totalUsuarios}
                            totalPages={totalPages}
                            roles={roles}
                            onAddUser={() => setIsModalOpen(true)}
                            onRefetch={() => {
                                void refetch();
                                void refetchPagina();
                            }}
                            pagina={pagina}
                            limite={limite}
                            busqueda={busqueda}
                            cargando={cargandoPagina}
                            error={errorPagina}
                            setPagina={setPagina}
                            setLimite={setLimite}
                            setBusqueda={setBusqueda}
                        />
                    )}
                </div>
            )}

            {pestana === 'roles' && (
                <div
                    id="panel-roles"
                    role="tabpanel"
                    aria-labelledby="tab-roles"
                >
                    {cargandoRoles ? (
                        <PageLoader />
                    ) : errorRoles ? (
                        <ErrorMessage message={errorRoles} />
                    ) : (
                        <RolesYPermisos
                            users={users}
                            roles={roles}
                            onCrearRol={() => setModalRolAbierto(true)}
                        />
                    )}
                </div>
            )}

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                users={users}
                roles={roles}
                guardando={creando}
            />
            <CreateRolModal
                isOpen={modalRolAbierto}
                onClose={() => setModalRolAbierto(false)}
                onSave={handleSaveRol}
                guardando={creandoRol}
            />
        </AdminModule>
    );
};

export default GestionUsuarios;
