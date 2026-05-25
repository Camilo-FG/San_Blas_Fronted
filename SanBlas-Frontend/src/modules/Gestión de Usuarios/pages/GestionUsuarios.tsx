import { UserList } from '../components/UserList';
import { useGetUserList } from '../hooks/hooksUsuarios/useGetUserList'
import "./GestionUsuarios.css";

const GestionUsuarios = () => {

    const {users, loading, error} = useGetUserList();

    if(loading) return <div>Loading...</div>
    if(error) return <div>{error}</div>

    //si no se cumplen las condiciones anteriores pasa lo siguiente:
    return(
        <section className="gestion-usuarios">
            <UserList />
        </section>
    )
};

export default GestionUsuarios;