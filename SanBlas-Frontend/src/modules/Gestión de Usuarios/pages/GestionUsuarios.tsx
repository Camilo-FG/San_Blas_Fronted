import { useState } from 'react';
import { UserList } from '../components/UserList/UserList';
import CreateUserModal from '../components/CreateUserModal/CreateUserModal';
import { useGetUserList } from '../hooks/hooksUsuarios/useGetUserList';
import { useCreateUser } from '../hooks/hooksUsuarios/useCreateUser';
import { AdminModule, ErrorMessage, PageLoader } from '../../../shared/ui';

const GestionUsuarios = () => {
    const { users, loading, error, refetch } = useGetUserList();
    const { crearUsuario, loading: creando } = useCreateUser();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveUser = async (userData: {
        nombre: string;
        correo: string;
        telefono: string;
        contraseña: string;
        rol: 'user' | 'admin';
    }) => {
        const ok = await crearUsuario({
            userName: userData.nombre,
            email: userData.correo,
            phoneNumber: userData.telefono,
            password: userData.contraseña,
            confirmPassword: userData.contraseña,
            role: userData.rol,
        });

        if (ok) {
            setIsModalOpen(false);
            refetch();
        }
    };

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <AdminModule>
            <UserList
                users={users}
                onAddUser={() => setIsModalOpen(true)}
                onRefetch={refetch}
            />
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                users={users}
            />
            {creando && (
                <p
                    className="fixed inset-x-0 bottom-6 z-[1300] mx-auto w-fit rounded-xl bg-royal-blue px-4 py-2 text-sm font-semibold text-white shadow-lg"
                    role="status"
                >
                    Guardando...
                </p>
            )}
        </AdminModule>
    );
};

export default GestionUsuarios;
