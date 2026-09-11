import { useState } from "react";
import { UserUpdate } from "../../../../types/Usuario";
import { ApiError } from "../../../../services/apiClient";
import { updateUser } from "../../services/userServices";

export const useUpdateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const actualizarUsuario = async (
        id: number,
        datosModificados: UserUpdate,
    ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
        setLoading(true);
        setError(null);
        try {
            await updateUser(id, datosModificados);
            return { ok: true };
        } catch (err) {
            const mensaje =
                err instanceof ApiError
                    ? err.message
                    : "No se pudo actualizar el usuario.";
            setError(mensaje);
            return { ok: false, mensaje };
        } finally {
            setLoading(false);
        }
    };

    return { actualizarUsuario, loading, error };
};
