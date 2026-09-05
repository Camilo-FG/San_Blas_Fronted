import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Globe,
  MapPin,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import type { Evento } from "../../../../services/eventosService";
import { Badge, Button } from "../../../../shared/ui";
import {
  formatearFechaCalendario,
  formatearHoraEvento,
} from "../../../../shared/utils/fechas";
import {
  ETIQUETA_ESTADO_EVENTO,
  PORTADA_ESTADO_EVENTO,
  VARIANTE_ESTADO_EVENTO,
  obtenerEstadoEvento,
} from "../utils/estadoEvento";

type EventoCardProps = {
  evento: Evento;
  guardando?: boolean;
  onPublicar: (evento: Evento) => void;
  onActivar: (evento: Evento) => void;
  onDesactivar: (evento: Evento) => void;
  onEditar: (evento: Evento) => void;
  onEliminar: (evento: Evento) => void;
  onVer: (evento: Evento) => void;
};

export function EventoCard({
  evento,
  guardando = false,
  onPublicar,
  onActivar,
  onDesactivar,
  onEditar,
  onEliminar,
  onVer,
}: EventoCardProps) {
  const [imagenRota, setImagenRota] = useState(false);
  const estado = obtenerEstadoEvento(evento);

  useEffect(() => {
    setImagenRota(false);
  }, [evento.imagenUrl]);
  const hora = formatearHoraEvento(evento.hora);
  const mostrarImagen = Boolean(evento.imagenUrl) && !imagenRota;

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        estado === "publicado-inactivo"
          ? "border-amber-300"
          : "border-border-strong"
      }`}
    >
      <button
        type="button"
        className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
        onClick={() => onVer(evento)}
        aria-label={`Ver detalle de ${evento.titulo}`}
      >
        <div
          className={`relative h-40 overflow-hidden ${PORTADA_ESTADO_EVENTO[estado]}`}
        >
          {mostrarImagen ? (
            <img
              key={evento.imagenUrl}
              src={evento.imagenUrl ?? undefined}
              alt=""
              className={`h-full w-full object-cover ${
                estado === "publicado-inactivo" ? "grayscale-[.35] opacity-80" : ""
              }`}
              onError={() => setImagenRota(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/90">
              <CalendarDays size={42} aria-hidden="true" />
            </div>
          )}

          <Badge
            variant={VARIANTE_ESTADO_EVENTO[estado]}
            className="absolute top-2.5 right-2.5 uppercase tracking-wide shadow-sm"
          >
            {ETIQUETA_ESTADO_EVENTO[estado]}
          </Badge>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-h-[3.2rem]">
          <h3 className="m-0 line-clamp-2 text-base font-extrabold leading-snug text-slate-900">
            {evento.titulo}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-text-muted">
          <p className="m-0 flex items-center gap-1.5">
            <CalendarDays size={14} className="shrink-0 text-royal-gold" />
            <span>{formatearFechaCalendario(evento.fechaInicio)}</span>
          </p>
          <p className="m-0 flex items-center gap-1.5">
            <Clock3 size={14} className="shrink-0 text-royal-gold" />
            <span>{hora || "Hora no definida"}</span>
          </p>
          <p className="m-0 flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0 text-royal-gold" />
            <span className="line-clamp-1">{evento.lugar}</span>
          </p>
        </div>

        <p className="m-0 line-clamp-3 min-h-[3.9rem] flex-1 text-sm leading-relaxed text-text-muted">
          {evento.descripcion}
        </p>

        <div className="mt-auto flex flex-col gap-2">
          {estado === "publicado-activo" && (
            <Button
              variant="royal"
              onClick={() => onDesactivar(evento)}
              disabled={guardando}
            >
              <PowerOff size={16} />
              Desactivar
            </Button>
          )}
          {estado === "publicado-inactivo" && (
            <Button
              variant="royal"
              onClick={() => onActivar(evento)}
              disabled={guardando}
            >
              <Power size={16} />
              Activar
            </Button>
          )}
          {estado === "borrador" && (
            <Button
              variant="royal"
              onClick={() => onPublicar(evento)}
              disabled={guardando}
            >
              <Globe size={16} />
              Publicar
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => onEditar(evento)}>
              <Pencil size={16} />
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => onEliminar(evento)}
              disabled={guardando}
            >
              <Trash2 size={16} />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
