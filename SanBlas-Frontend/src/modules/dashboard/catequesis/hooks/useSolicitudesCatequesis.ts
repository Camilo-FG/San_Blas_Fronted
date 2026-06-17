import { useEffect, useState } from "react";
import type { CatequesisEnrollmentRecord } from "../Types/catequesis";
import {
  getSolicitudesCatequesis,
  updateSolicitudesCatequesis,
} from "../services/catequesisService";

export const useSolicitudesCatequesis = () => {
  const [solicitudes, setSolicitudesState] = useState<
    CatequesisEnrollmentRecord[]
  >([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await getSolicitudesCatequesis();
        setSolicitudesState(data);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las solicitudes de catequesis.");
      } finally {
        setCargando(false);
      }
    };

    cargarSolicitudes();
  }, []);

  const guardarSolicitudes = async (
    nuevasSolicitudes: CatequesisEnrollmentRecord[],
  ) => {
    try {
      setGuardando(true);
      setError("");

      setSolicitudesState(nuevasSolicitudes);

      const dataActualizada =
        await updateSolicitudesCatequesis(nuevasSolicitudes);

      setSolicitudesState(dataActualizada);
    } catch (error) {
      console.error(error);
      setError("No se pudieron actualizar las solicitudes en JSONBin.");
    } finally {
      setGuardando(false);
    }
  };

  return {
    solicitudes,
    guardarSolicitudes,
    cargando,
    guardando,
    error,
  };
};
