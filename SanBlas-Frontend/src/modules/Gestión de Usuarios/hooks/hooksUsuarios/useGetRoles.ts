import { useEffect, useState } from "react";
import { ApiError } from "../../../../services/apiClient";
import type { Rol } from "../../../../types/Rol";
import { obtenerRoles } from "../../services/rolesService";

export const useGetRoles = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerRoles();
      setRoles(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar los roles.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarRoles();
  }, []);

  return { roles, loading, error, refetch: cargarRoles };
};
