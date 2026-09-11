import { useState } from "react";
import { UserCreate } from "../../../../types/Usuario";
import { ApiError } from "../../../../services/apiClient";
import { createUser } from "../../services/userServices";

export const useCreateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const crearUsuario = async (
        userData: UserCreate,
    ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
        setLoading(true);
        setError(null);
        try {
            await createUser(userData);
            return { ok: true };
        } catch (err) {
            const mensaje =
                err instanceof ApiError
                    ? err.message
                    : "No se pudo crear el usuario.";
            setError(mensaje);
            return { ok: false, mensaje };
        } finally {
            setLoading(false);
        }
    };

    return { crearUsuario, loading, error };
};
