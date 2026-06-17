import { useState } from 'react';
import { UserList } from '../components/UserList/UserList';
import CreateUserModal from '../components/CreateUserModal/CreateUserModal';
import { useGetUserList } from '../hooks/hooksUsuarios/useGetUserList'
import { usePutUser } from '../hooks/hooksUsuarios/usePutUser';
import { Usuario } from "../../../types/Usuario";

import "./GestionUsuarios.css";


const GestionUsuarios = () => {

    const { users, loading, error, refetch } = useGetUserList();
    const { crearUsuario, loading: creando } = usePutUser();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };  

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveUser = async (userData: any) => {
    const nuevoUsuario: Usuario = {
        ID: Math.max(0, ...users.map(u => u.ID)) + 1,
        UserName: userData.nombre,
        Email: userData.correo,
        PhoneNumber: userData.telefono,
        Password: userData.contraseña,
        UserRole: userData.rol === 'admin', //true si admin, false si user
        State: true,
        CreationDate: new Date().toISOString(),
    };

    const ok = await crearUsuario(nuevoUsuario);
    if (ok) {
        setIsModalOpen(false);
        refetch();
    }
};

    if(loading) return <div>Loading...</div>
    if(error) return <div>{error}</div>

    return(
         <section className="gestion-usuarios">
            <UserList
                users={users}
                onAddUser={() => setIsModalOpen(true)}
                onRefetch={refetch} // ← nuevo
            />
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                users={users}/>
            {creando && <div className="loading-overlay">Guardando...</div>}
        </section>
    )
};

export default GestionUsuarios;