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
        setError(null);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            // el servicio ya traduce el error con handleApiError (distingue sin conexión de error del servidor)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Error al cargar la lista de usuarios.',
            );
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