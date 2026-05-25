//los hooks usan a los servicios
import { useEffect, useState } from "react";
import { Usuario } from "src/types/Usuario";
import { getUsers } from "../../services/userServices";

export const useGetUserList = () => {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            }catch(err) {
                setError('error al hacer fetch a los usuarios');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarUsuarios();
    }, [])

    return { users, loading, error };
};