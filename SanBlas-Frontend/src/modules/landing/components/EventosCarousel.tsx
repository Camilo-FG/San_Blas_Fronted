import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { ApiError } from "../../../services/apiClient";
import {
  obtenerEventosPublicos,
  type Evento,
} from "../../../services/eventosService";
import Rutas from "../../../routes/Rutas";
import "./EventosCarousel.css";

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-CR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatearDia = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-CR", { day: "2-digit" });

const formatearMes = (fecha: string) =>
  new Date(fecha)
    .toLocaleDateString("es-CR", { month: "short" })
    .replace(".", "")
    .toUpperCase();

export default function EventosCarousel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerEventosPublicos();
        const ordenados = [...data].sort(
          (a, b) =>
            new Date(a.fechaInicio).getTime() -
            new Date(b.fechaInicio).getTime(),
        );
        setEventos(ordenados);
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

    void cargar();
  }, []);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 639px)");
    const mqTablet = window.matchMedia("(max-width: 1023px)");

    const handleResize = () => {
      if (mqMobile.matches) {
        setCardsToShow(1);
      } else if (mqTablet.matches) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }

      setCurrentIndex(0);
    };

    handleResize();
    mqMobile.addEventListener("change", handleResize);
    mqTablet.addEventListener("change", handleResize);

    return () => {
      mqMobile.removeEventListener("change", handleResize);
      mqTablet.removeEventListener("change", handleResize);
    };
  }, []);

  const maxIndex = useMemo(
    () => Math.max(0, eventos.length - cardsToShow),
    [cardsToShow, eventos.length],
  );

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="eventos-carousel" id="eventos">
      <div className="eventos-carousel__container">
        <div className="eventos-carousel__header">
          <span>Comunidad parroquial</span>
          <h2>Próximos eventos</h2>
          <p>
            Celebraciones, actividades y encuentros de la Parroquia San Blas.
          </p>
        </div>

        {cargando && (
          <p className="eventos-carousel__message">Cargando eventos...</p>
        )}

        {error && <p className="eventos-carousel__message eventos-carousel__message--error">{error}</p>}

        {!cargando && !error && eventos.length === 0 && (
          <p className="eventos-carousel__message">
            No hay eventos publicados por el momento.
          </p>
        )}

        {!cargando && !error && eventos.length > 0 && (
          <>
            <div className="eventos-carousel__wrapper">
              <div className="eventos-carousel__viewport">
                <motion.div
                  className="eventos-carousel__track"
                  animate={{
                    x: `-${currentIndex * (100 / eventos.length)}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  style={{
                    width: `${(eventos.length / cardsToShow) * 100}%`,
                  }}
                >
                  {eventos.map((evento) => (
                    <article
                      key={evento.id}
                      className="eventos-carousel__card"
                      style={{
                        width: `calc(100% / ${eventos.length})`,
                      }}
                    >
                      <div className="eventos-carousel__date-badge">
                        <CalendarDays size={18} aria-hidden="true" />
                        <div>
                          <strong>{formatearDia(evento.fechaInicio)}</strong>
                          <span>{formatearMes(evento.fechaInicio)}</span>
                        </div>
                      </div>

                      <div className="eventos-carousel__body">
                        <p className="eventos-carousel__fecha">
                          {formatearFecha(evento.fechaInicio)}
                        </p>
                        <h3>{evento.titulo}</h3>
                        <p className="eventos-carousel__lugar">
                          <MapPin size={15} aria-hidden="true" />
                          {evento.lugar}
                        </p>
                        <p className="eventos-carousel__descripcion">
                          {evento.descripcion}
                        </p>
                      </div>
                    </article>
                  ))}
                </motion.div>
              </div>

              {maxIndex > 0 && (
                <>
                  <button
                    type="button"
                    className="eventos-carousel__arrow eventos-carousel__arrow--left"
                    onClick={handlePrev}
                    aria-label="Ver eventos anteriores"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    className="eventos-carousel__arrow eventos-carousel__arrow--right"
                    onClick={handleNext}
                    aria-label="Ver siguientes eventos"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {maxIndex > 0 && (
              <div className="eventos-carousel__dots">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Ir al grupo de eventos ${index + 1}`}
                    className={`eventos-carousel__dot ${
                      currentIndex === index
                        ? "eventos-carousel__dot--active"
                        : ""
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="eventos-carousel__footer-link">
          <Link to={Rutas.eventosPublicos} className="eventos-carousel__link">
            Ver todos los eventos
          </Link>
        </div>
      </div>
    </section>
  );
}
