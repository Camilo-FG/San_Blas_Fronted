import { useEffect, useState } from "react";
import { obtenerEventosPublicos, type Evento } from "../../../services/eventosService";
import { ApiError } from "../../../services/apiClient";

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-CR", {
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
          {eventos.map((evento) => (
            <article
              key={evento.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-royal-gold">
                {formatearFecha(evento.fechaInicio)}
              </span>
              <h2 className="my-2 text-xl text-royal-blue">{evento.titulo}</h2>
              <p className="mb-3 text-sm text-text-muted">{evento.lugar}</p>
              <p className="leading-relaxed text-slate-700">{evento.descripcion}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default EventosPublicPage;
