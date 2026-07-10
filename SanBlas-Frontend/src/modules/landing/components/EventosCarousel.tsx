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
import { cn } from "../../../shared/ui/cn";

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
    <section className="border-t border-[#eef2f7] bg-surface-muted py-24 max-md:py-[72px] max-sm:py-16" id="eventos">
      <div className="mx-auto max-w-[1200px] px-6 max-sm:px-[18px]">
        <div className="mx-auto mb-12 max-w-[620px] text-center">
          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.25em] text-royal-gold">
            Comunidad parroquial
          </span>
          <h2 className="m-0 font-heading text-[clamp(30px,4vw,42px)] leading-[1.15] text-royal-blue">
            Próximos eventos
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-text-muted">
            Celebraciones, actividades y encuentros de la Parroquia San Blas.
          </p>
        </div>

        {cargando && (
          <p className="pt-6 text-center text-text-muted">Cargando eventos...</p>
        )}

        {error && (
          <p className="pt-6 text-center text-danger">{error}</p>
        )}

        {!cargando && !error && eventos.length === 0 && (
          <p className="pt-6 text-center text-text-muted">
            No hay eventos publicados por el momento.
          </p>
        )}

        {!cargando && !error && eventos.length > 0 && (
          <>
            <div className="relative px-7 max-md:px-2 max-sm:px-0">
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
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
                      className="mx-3 box-border flex min-h-[320px] flex-col gap-[18px] rounded-[22px] border border-[#e8edf2] bg-surface p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-md:min-h-[300px] max-md:p-5 max-sm:mx-0"
                      style={{
                        width: `calc(100% / ${eventos.length})`,
                      }}
                    >
                      <div className="inline-flex items-center gap-3 self-start rounded-[14px] bg-royal-blue px-3.5 py-2.5 text-white">
                        <CalendarDays size={18} aria-hidden="true" className="shrink-0 text-royal-gold" />
                        <div>
                          <strong className="block text-[1.35rem] leading-none">
                            {formatearDia(evento.fechaInicio)}
                          </strong>
                          <span className="mt-0.5 block text-[0.72rem] tracking-[0.12em] text-white/82">
                            {formatearMes(evento.fechaInicio)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-2.5">
                        <p className="m-0 text-[0.78rem] font-extrabold uppercase tracking-wider text-royal-gold">
                          {formatearFecha(evento.fechaInicio)}
                        </p>
                        <h3 className="m-0 font-heading text-xl leading-tight text-royal-blue">
                          {evento.titulo}
                        </h3>
                        <p className="m-0 flex items-center gap-1.5 text-[0.92rem] text-text-muted">
                          <MapPin size={15} aria-hidden="true" className="shrink-0 text-royal-gold" />
                          {evento.lugar}
                        </p>
                        <p className="m-0 line-clamp-4 text-[0.95rem] leading-[1.65] text-slate-600">
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
                    className="absolute left-0 top-1/2 z-[2] flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-surface text-royal-blue shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all hover:scale-[1.04] hover:bg-royal-blue hover:text-white max-md:size-[38px] max-sm:hidden"
                    onClick={handlePrev}
                    aria-label="Ver eventos anteriores"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    className="absolute right-0 top-1/2 z-[2] flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-surface text-royal-blue shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all hover:scale-[1.04] hover:bg-royal-blue hover:text-white max-md:size-[38px] max-sm:hidden"
                    onClick={handleNext}
                    aria-label="Ver siguientes eventos"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {maxIndex > 0 && (
              <div className="mt-7 flex justify-center gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Ir al grupo de eventos ${index + 1}`}
                    className={cn(
                      "size-2 cursor-pointer rounded-full border-none p-0 transition-all",
                      currentIndex === index
                        ? "scale-125 bg-royal-blue"
                        : "bg-slate-300",
                    )}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link
            to={Rutas.eventosPublicos}
            className="inline-flex items-center justify-center rounded-[10px] bg-royal-blue px-7 py-3.5 text-[0.88rem] font-extrabold uppercase tracking-wider text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue"
          >
            Ver todos los eventos
          </Link>
        </div>
      </div>
    </section>
  );
}
