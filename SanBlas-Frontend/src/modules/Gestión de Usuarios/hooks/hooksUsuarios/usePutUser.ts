import { useState } from "react";
import { Usuario } from "src/types/Usuario";
import { getUsers, putUser } from "../../services/userServices";

export const usePutUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const crearUsuario = async (nuevoUsuario: Usuario): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            //lee el bin
            const usuariosActuales = await getUsers();
            //agrega el nuevo usuario al array
            const usuariosActualizados = [...usuariosActuales, nuevoUsuario];
            //put
            await putUser(usuariosActualizados);
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