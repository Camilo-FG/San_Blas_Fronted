const ZONA_COSTA_RICA = "America/Costa_Rica";

export const extraerFechaCalendario = (fecha?: string | null): string => {
  if (!fecha) return "";
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
};

export const fechaComoLocal = (fecha: string): Date => {
  const calendario = extraerFechaCalendario(fecha);
  if (calendario) {
    const [anio, mes, dia] = calendario.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  }
  return new Date(fecha);
};

export const formatearFechaCalendario = (
  fecha: string,
  opciones: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) => fechaComoLocal(fecha).toLocaleDateString("es-CR", opciones);

export const eventoTieneHora = (fecha: string) => {
  const match = String(fecha).match(/T(\d{2}):(\d{2})/);
  if (!match) return false;
  return match[1] !== "00" || match[2] !== "00";
};

export const formatearHoraLocal = (fecha: string) => {
  if (!eventoTieneHora(fecha)) return "";
  return new Date(fecha).toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: ZONA_COSTA_RICA,
  });
};

export const formatearHoraEvento = (hora?: string | null) => {
  if (!hora) return "";
  const match = String(hora).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return hora;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
  });
};
