import { useEffect, useState } from "react";
import { obtenerEventosPublicos, type Evento } from "../../../services/eventosService";
import { ApiError } from "../../../services/apiClient";
import "./EventosPublicPage.css";

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
    <section className="eventos-publicos">
      <header className="eventos-publicos__header">
        <p className="eventos-publicos__eyebrow">Comunidad parroquial</p>
        <h1>Próximos eventos</h1>
        <p>Actividades, celebraciones y encuentros de la Parroquia San Blas.</p>
      </header>

      {cargando && <p className="eventos-publicos__empty">Cargando eventos...</p>}
      {error && <p className="eventos-publicos__error">{error}</p>}

      {!cargando && !error && eventos.length === 0 && (
        <p className="eventos-publicos__empty">
          No hay eventos publicados por el momento.
        </p>
      )}

      {!cargando && !error && eventos.length > 0 && (
        <div className="eventos-publicos__grid">
          {eventos.map((evento) => (
            <article key={evento.id} className="eventos-publicos__card">
              <span className="eventos-publicos__fecha">
                {formatearFecha(evento.fechaInicio)}
              </span>
              <h2>{evento.titulo}</h2>
              <p className="eventos-publicos__lugar">{evento.lugar}</p>
              <p>{evento.descripcion}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default EventosPublicPage;
