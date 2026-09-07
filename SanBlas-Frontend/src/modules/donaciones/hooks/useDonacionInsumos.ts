import { useCallback, useRef, useState } from "react";
import { ApiError } from "../../../services/apiClient";
import {
  crearDonacion,
  type CrearDonacionPayload,
} from "../../../services/donacionesService";

export function useDonacionInsumos() {
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});
  const enviandoRef = useRef(false);

  const limpiarErroresCampo = useCallback(() => setErroresCampo({}), []);

  const enviar = useCallback(
    async (payload: CrearDonacionPayload): Promise<boolean> => {
      if (enviandoRef.current) return false;
      enviandoRef.current = true;
      setCargando(true);
      setExito(false);
      setError(null);
      setErroresCampo({});
      try {
        await crearDonacion(payload);
        setExito(true);
        return true;
      } catch (caught) {
        if (caught instanceof ApiError) {
          setError(caught.message);
          if (caught.errores) {
            const mapa: Record<string, string> = {};
            Object.entries(caught.errores).forEach(([campo, mensajes]) => {
              mapa[campo] = mensajes[0];
            });
            setErroresCampo(mapa);
          }
        } else {
          setError(
            "Hubo un problema al enviar la donación al servidor. Inténtalo de nuevo.",
          );
        }
        return false;
      } finally {
        enviandoRef.current = false;
        setCargando(false);
      }
    },
    [],
  );

  return { cargando, exito, error, erroresCampo, limpiarErroresCampo, enviar };
}