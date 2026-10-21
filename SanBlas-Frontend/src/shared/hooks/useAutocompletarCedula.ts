import { useEffect, useRef, useState } from "react";
import {
  obtenerDatosCedula,
  type DatosCedula,
} from "../../services/cedulaService";
import type { TipoCedula } from "../utils/cedulaIdentificacion";

export type EstadoConsultaCedula =
  "inactiva" | "buscando" | "encontrada" | "no_encontrada" | "error";

// Consulta desde el evento del input y descarta respuestas viejas si cambia la cédula o se cierra la página.
export function useAutocompletarCedula() {
  const [estado, setEstado] = useState<EstadoConsultaCedula>("inactiva");
  const solicitud = useRef(0);

  useEffect(
    () => () => {
      solicitud.current += 1;
    },
    [],
  );

  // Las extranjeras se llenan manualmente: el padrón disponible solo consulta cédulas nacionales.
  async function verificar(
    cedula: string,
    tipo: TipoCedula,
    completar: (datos: DatosCedula) => void,
  ) {
    const actual = ++solicitud.current;
    if (tipo !== "nacional" || !/^\d{9}$/.test(cedula)) {
      setEstado("inactiva");
      return;
    }
    setEstado("buscando");
    try {
      const resultado = await obtenerDatosCedula(cedula);
      if (actual !== solicitud.current) return;
      setEstado(resultado.estado);
      if (resultado.estado === "encontrada") completar(resultado.datos);
    } catch {
      if (actual === solicitud.current) setEstado("error");
    }
  }

  return { estado, verificar };
}
