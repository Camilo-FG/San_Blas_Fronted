import { useState } from "react";
import { Usuario } from "../../../../types/Usuario";
import { getUsers, putUser } from "../../services/userServices";

export const useUpdateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const actualizarUsuario = async (
        id: number,
        datosModificados: Partial<Usuario>
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const usuariosActuales = await getUsers();

            const usuariosActualizados = usuariosActuales.map(u =>
                u.ID === id
                    ? { ...u, ...datosModificados } 
                    : u
            );

            await putUser(usuariosActualizados);
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