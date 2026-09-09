import { useCallback, useRef, useState } from "react";
import { obtenerNuevasSolicitudesDonaciones } from "../../../services/donacionesService";

const CLAVE_ULTIMA_VISITA = "ultimaVisitaDonaciones";

export interface NotificacionDonaciones {
  cantidad: number | null;
  revisando: boolean;
  verificarNuevas: () => Promise<void>;
}

export function useNotificacionDonaciones(): NotificacionDonaciones {
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [revisando, setRevisando] = useState(false);
  const revisadoRef = useRef(false);

  const verificarNuevas = useCallback(async () => {
    if (revisadoRef.current) return;
    revisadoRef.current = true;

    const ahora = new Date();
    const ultimaVisita = localStorage.getItem(CLAVE_ULTIMA_VISITA);
    localStorage.setItem(CLAVE_ULTIMA_VISITA, ahora.toISOString());

    if (!ultimaVisita) {
      setCantidad(0);
      return;
    }

    setRevisando(true);
    try {
      const nuevas = await obtenerNuevasSolicitudesDonaciones(ultimaVisita);
      setCantidad(nuevas);
    } catch {
      setCantidad(0);
    } finally {
      setRevisando(false);
    }
  }, []);

  return { cantidad, revisando, verificarNuevas };
}