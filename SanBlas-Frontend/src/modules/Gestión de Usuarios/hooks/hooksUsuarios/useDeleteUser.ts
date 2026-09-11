import { useState } from "react";
import { ApiError } from "../../../../services/apiClient";
import { deleteUser } from "../../services/userServices";

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminarUsuario = async (
    id: number,
  ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
    setLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      return { ok: true };
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el usuario.";
      setError(mensaje);
      return { ok: false, mensaje };
    } finally {
      setLoading(false);
    }
  };

  return { eliminarUsuario, loading, error };
};
