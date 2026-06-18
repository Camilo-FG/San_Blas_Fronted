import { useState } from 'react';
import { UserList } from '../components/UserList/UserList';
import CreateUserModal from '../components/CreateUserModal/CreateUserModal';
import { useGetUserList } from '../hooks/hooksUsuarios/useGetUserList';
import { useCreateUser } from '../hooks/hooksUsuarios/useCreateUser';

import "./GestionUsuarios.css";


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
            userRole: userData.rol === 'admin',
        });

        if (ok) {
            setIsModalOpen(false);
            refetch();
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <section className="gestion-usuarios">
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
            {creando && <div className="loading-overlay">Guardando...</div>}
        </section>
    );
};

export default GestionUsuarios;
