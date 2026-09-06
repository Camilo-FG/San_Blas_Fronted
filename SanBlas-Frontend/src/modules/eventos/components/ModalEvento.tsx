import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { motion } from "framer-motion";
import type { Evento } from "../../../services/eventosService";
import { useScrollLock } from "../../../shared/hooks/useScrollLock";
import { Button } from "../../../shared/ui";
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
  badge?: ReactNode;
  acciones?: ReactNode;
  cerrarAlClicFuera?: boolean;
};

export function ModalEvento({
  evento,
  onCerrar,
  badge,
  acciones,
  cerrarAlClicFuera = true,
}: ModalEventoProps) {
  const dialogoRef = useRef<HTMLDivElement>(null);
  const [imagenRota, setImagenRota] = useState(false);
  useScrollLock(true, dialogoRef);

  useEffect(() => {
    setImagenRota(false);
  }, [evento.imagenUrl]);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [onCerrar]);

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
  const mostrarImagen = Boolean(evento.imagenUrl) && !imagenRota;
  const fondoPortada = !evento.publicado
    ? "bg-gradient-to-br from-slate-400 to-slate-300"
    : evento.activo === false
      ? "bg-gradient-to-br from-royal-gold to-royal-gold-light"
      : "bg-gradient-to-br from-royal-blue to-royal-blue-dark";
  const iconoPortada =
    evento.publicado && evento.activo === false
      ? "text-royal-blue"
      : "text-white/90";

  return (
    <FocusTrap
      focusTrapOptions={{
        clickOutsideDeactivates: false,
        escapeDeactivates: false,
        allowOutsideClick: () => true,
        initialFocus: () => dialogoRef.current ?? false,
        fallbackFocus: () => dialogoRef.current ?? document.body,
      }}
    >
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 max-md:px-2.5 max-md:py-6">
      <motion.div
        className="fixed inset-0 bg-royal-blue/65 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        onClick={cerrarAlClicFuera ? onCerrar : undefined}
      />

      <motion.div
        ref={dialogoRef}
        tabIndex={-1}
        className="relative z-[2] flex h-auto max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.25)] outline-none max-md:max-h-[94vh] max-md:max-w-none max-sm:max-h-[94vh] max-sm:rounded-[22px]"
        initial={{ opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 28 }}
        transition={TRANSICION_MODAL}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-modal-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`relative h-[280px] shrink-0 overflow-hidden ${fondoPortada} max-sm:h-[200px]`}>
          {mostrarImagen ? (
            <img
              src={evento.imagenUrl ?? undefined}
              alt={evento.titulo}
              className="size-full object-cover"
              onError={() => setImagenRota(true)}
            />
          ) : (
            <div className={`flex size-full items-center justify-center ${iconoPortada}`}>
              <CalendarDays size={56} aria-hidden="true" />
            </div>
          )}
          {badge ? (
            <div className="absolute top-3 right-3 z-10">{badge}</div>
          ) : null}
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
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {acciones}
            <Button
              variant="secondary"
              className="max-sm:w-full"
              onClick={onCerrar}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
    </FocusTrap>
  );
}
