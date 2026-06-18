import { useState } from "react";
import { UserUpdate } from "../../../../types/Usuario";
import { updateUser } from "../../services/userServices";

export const useUpdateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const actualizarUsuario = async (
        id: number,
        datosModificados: UserUpdate
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await updateUser(id, datosModificados);
            return true;
        } catch (err) {
            setError('Error al actualizar el usuario');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { actualizarUsuario, loading, error };
};
