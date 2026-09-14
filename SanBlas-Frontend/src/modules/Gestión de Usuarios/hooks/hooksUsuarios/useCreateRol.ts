import { useState } from "react";
import { ApiError } from "../../../../services/apiClient";
import { crearRol, type CrearRolPayload } from "../../services/rolesService";

export const useCreateRol = () => {
  const [loading, setLoading] = useState(false);

  const crear = async (
    payload: CrearRolPayload,
  ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
    setLoading(true);
    try {
      await crearRol(payload);
      return { ok: true };
    } catch (err) {
      const mensaje =
        err instanceof ApiError ? err.message : "No se pudo crear el rol.";
      return { ok: false, mensaje };
    } finally {
      setLoading(false);
    }
  };

  return { crear, loading };
};
