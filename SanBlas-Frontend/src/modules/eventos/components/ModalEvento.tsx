import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Evento } from "../../../services/eventosService";
import {
  extraerFechaCalendario,
  formatearFechaCalendario,
  formatearHoraEvento,
} from "../../../shared/utils/fechas";

const TRANSICION_MODAL = {
  duration: 0.32,
  ease: "easeOut" as const,
};

type ModalEventoProps = {
  evento: Evento;
  onCerrar: () => void;
};

export function ModalEvento({ evento, onCerrar }: ModalEventoProps) {
  const hora = formatearHoraEvento(evento.hora);
  const opcionesFecha = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  } as const;
  const fecha = formatearFechaCalendario(evento.fechaInicio, opcionesFecha);
  const fechaFin = extraerFechaCalendario(evento.fechaFin)
    ? formatearFechaCalendario(evento.fechaFin ?? "", opcionesFecha)
    : "";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 max-md:px-2.5 max-md:py-6">
      <motion.div
        className="fixed inset-0 bg-royal-blue/65 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        onClick={onCerrar}
      />

      <motion.div
        className="relative z-[2] flex h-auto max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.25)] max-md:max-h-[94vh] max-md:max-w-none max-sm:max-h-[94vh] max-sm:rounded-[22px]"
        initial={{ opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 28 }}
        transition={TRANSICION_MODAL}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-modal-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[280px] shrink-0 overflow-hidden bg-gradient-to-br from-teal to-teal-hover max-sm:h-[200px]">
          {evento.imagenUrl ? (
            <img
              src={evento.imagenUrl}
              alt={evento.titulo}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-white/90">
              <CalendarDays size={56} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-8 max-sm:p-5">
          <h3
            id="evento-modal-titulo"
            className="mt-0 mb-3 font-heading text-[1.75rem] leading-tight text-royal-blue max-sm:text-[1.5rem]"
          >
            {evento.titulo}
          </h3>
          <p className="mb-2 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
            <MapPin size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
            {evento.lugar}
          </p>
          <p className="mb-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
            <CalendarDays size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
            {fecha}
          </p>
          {fechaFin ? (
            <p className="mt-1.5 mb-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
              <CalendarDays size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
              Hasta {fechaFin}
            </p>
          ) : null}
          {hora && (
            <p className="mt-1.5 mb-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
              <Clock3 size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
              {hora}
            </p>
          )}
          <p className="mt-4 mb-0 whitespace-pre-wrap text-[1.1rem] leading-[1.7] text-slate-700">
            {evento.descripcion}
          </p>
        </div>

        <div className="shrink-0 bg-surface-muted px-6 py-[18px] max-sm:px-5 max-sm:py-4">
          <button
            type="button"
            className="cursor-pointer rounded-[10px] border-none bg-royal-blue px-[22px] py-3 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue max-sm:w-full"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
