import { useState } from "react";
import { UserCreate } from "../../../../types/Usuario";
import { createUser } from "../../services/userServices";

export const useCreateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const crearUsuario = async (userData: UserCreate): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await createUser(userData);
            return true;
        } catch (err) {
            setError('Error al crear el usuario');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { crearUsuario, loading, error };
};
