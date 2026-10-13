import { useState } from "react";
import { ApiError } from "../../../../services/apiClient";
import { deleteRol } from "../../services/rolesService";

export const useDeleteRol = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminarRol = async (
    id: number,
  ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
    setLoading(true);
    setError(null);
    try {
      await deleteRol(id);
      return { ok: true };
    } catch (err) {
      const mensaje =
        err instanceof ApiError ? err.message : "No se pudo eliminar el rol.";
      setError(mensaje);
      return { ok: false, mensaje };
    } finally {
      setLoading(false);
    }
  };

  return { eliminarRol, loading, error };
};
