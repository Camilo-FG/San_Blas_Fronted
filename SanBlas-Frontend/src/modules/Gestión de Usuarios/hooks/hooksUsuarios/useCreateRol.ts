import { useState } from "react";
import { ApiError } from "../../../../services/apiClient";
import type { Rol } from "../../../../types/Rol";
import { crearRol, type CrearRolPayload } from "../../services/rolesService";

export const useCreateRol = () => {
  const [loading, setLoading] = useState(false);

  const crear = async (
    payload: CrearRolPayload,
  ): Promise<
    { ok: true; rol: Rol } | { ok: false; mensaje: string }
  > => {
    setLoading(true);
    try {
      const rol = await crearRol(payload);
      return { ok: true, rol };
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
