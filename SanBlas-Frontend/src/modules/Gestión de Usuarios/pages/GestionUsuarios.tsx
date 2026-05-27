import { useState } from 'react';
import { UserList } from '../components/UserList/UserList';
import CreateUserModal from '../components/CreateUserModal/CreateUserModal';
import { useGetUserList } from '../hooks/hooksUsuarios/useGetUserList'
import "./GestionUsuarios.css";

const GestionUsuarios = () => {

    const {users, loading, error} = useGetUserList();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveUser = (userData: any) => {
        // Aquí iría la lógica para crear el usuario
        console.log('Usuario a crear:', userData);
        setIsModalOpen(false);
        // Luego hacer refetch de usuarios si lo deseas
    };

    if(loading) return <div>Loading...</div>
    if(error) return <div>{error}</div>

    //si no se cumplen las condiciones anteriores pasa lo siguiente:
    return(
        <section className="gestion-usuarios">
            <UserList users={users} onAddUser={handleOpenModal} />
            <CreateUserModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
            />
        </section>
    )
};

export default GestionUsuarios;