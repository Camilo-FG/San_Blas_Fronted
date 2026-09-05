import SeoHead from "../../../seo/SeoHead";
import { getEventSchema } from "../../../seo/structuredData";
import { useEffect, useState } from "react";
import { obtenerEventosPublicos, type Evento } from "../../../services/eventosService";
import { ApiError } from "../../../services/apiClient";
import { Clock3, MapPin } from "lucide-react";
import { formatearFechaCalendario, formatearHoraEvento } from "../../../shared/utils/fechas";

const formatearFecha = (fecha: string) =>
  formatearFechaCalendario(fecha, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const EventosPublicPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerEventosPublicos();
        setEventos(data);
      } catch (err) {
        const mensaje =
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los eventos.";
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  return (
    <>
      <SeoHead page="/eventos" jsonLd={eventos.length > 0 ? eventos.map(getEventSchema) : []} />
      <section className="mx-auto max-w-[1100px] px-6 py-12 pb-16">
      <header className="mb-10 text-center">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-royal-gold">
          Comunidad parroquial
        </p>
        <h1 className="mb-3 font-heading text-4xl text-royal-blue">
          Próximos eventos
        </h1>
        <p className="text-text-muted">
          Actividades, celebraciones y encuentros de la Parroquia San Blas.
        </p>
      </header>

      {cargando && (
        <p className="p-8 text-center text-text-muted">Cargando eventos...</p>
      )}
      {error && (
        <p className="p-8 text-center text-danger">{error}</p>
      )}

      {!cargando && !error && eventos.length === 0 && (
        <p className="p-8 text-center text-text-muted">
          No hay eventos publicados por el momento.
        </p>
      )}

      {!cargando && !error && eventos.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {eventos.map((evento) => {
            const hora = formatearHoraEvento(evento.hora);
            return (
            <article
              key={evento.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
            >
              {evento.imagenUrl ? (
                <img
                  src={evento.imagenUrl}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <span className="text-sm font-bold uppercase tracking-wider text-royal-gold">
                  {formatearFecha(evento.fechaInicio)}
                </span>
                {hora && (
                  <p className="mt-1 mb-0 flex items-center gap-1.5 text-sm text-text-muted">
                    <Clock3 size={14} />
                    {hora}
                  </p>
                )}
                <h2 className="my-2 text-xl text-royal-blue">{evento.titulo}</h2>
                <p className="mb-3 flex items-center gap-1.5 text-sm text-text-muted">
                  <MapPin size={14} />
                  {evento.lugar}
                </p>
                <p className="leading-relaxed text-slate-700">{evento.descripcion}</p>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
    </>
  );
};

export default EventosPublicPage;
