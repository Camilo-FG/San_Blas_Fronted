//los hooks usan a los servicios
import { useEffect, useState } from "react";
import { Usuario } from "../../../../types/Usuario";
import { getUsers } from "../../services/userServices";

export const useGetUserList = () => {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Error al hacer fetch a los usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    return { users, loading, error, refetch: cargarUsuarios };
};