import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import { ApiError } from "../../../services/apiClient";
import {
  obtenerEventosPublicos,
  type Evento,
} from "../../../services/eventosService";
import { ModalEvento } from "../../eventos/components/ModalEvento";
import Rutas from "../../../routes/Rutas";
import { cn, ScrollReveal } from "../../../shared/ui";
import {
  extraerFechaCalendario,
  fechaComoLocal,
  formatearFechaCalendario,
  formatearHoraEvento,
} from "../../../shared/utils/fechas";

const LIMITE_EVENTOS_LANDING = 10;

const formatearFecha = (fecha: string) =>
  formatearFechaCalendario(fecha, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatearDia = (fecha: string) =>
  formatearFechaCalendario(fecha, { day: "2-digit" });

const formatearMes = (fecha: string) =>
  formatearFechaCalendario(fecha, { month: "short" })
    .replace(".", "")
    .toUpperCase();

const TRANSICION_CARRUSEL = {
  type: "tween" as const,
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function EventosCarousel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [anchoVista, setAnchoVista] = useState(0);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const pistaRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerEventosPublicos();
        const hoy = new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Costa_Rica",
        });
        const proximos = [...data]
          .filter((evento) => extraerFechaCalendario(evento.fechaInicio) >= hoy)
          .sort(
            (a, b) =>
              fechaComoLocal(a.fechaInicio).getTime() -
              fechaComoLocal(b.fechaInicio).getTime(),
          )
          .slice(0, LIMITE_EVENTOS_LANDING);
        setEventos(proximos);
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

  const anchoPaso = cardsToShow > 0 ? anchoVista / cardsToShow : 0;

  useLayoutEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const medir = () => setAnchoVista(pista.clientWidth);
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(pista);
    return () => observador.disconnect();
  }, [eventos.length]);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (anchoPaso <= 0) return;
    const control = animate(x, -currentIndex * anchoPaso, TRANSICION_CARRUSEL);
    return () => control.stop();
  }, [anchoPaso, currentIndex, x]);

  const irAIndice = useCallback(
    (indice: number) => {
      setCurrentIndex(Math.max(0, Math.min(maxIndex, indice)));
    },
    [maxIndex],
  );

  const handleNext = useCallback(() => {
    irAIndice(currentIndex + 1);
  }, [currentIndex, irAIndice]);

  const handlePrev = useCallback(() => {
    irAIndice(currentIndex - 1);
  }, [currentIndex, irAIndice]);

  useEffect(() => {
    if (!eventoSeleccionado) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEventoSeleccionado(null);
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [eventoSeleccionado]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (anchoPaso <= 0) return;

      const proyectado = x.get() + info.velocity.x * 0.32;
      const indice = Math.round(-proyectado / anchoPaso);
      irAIndice(indice);

      if (Math.max(0, Math.min(maxIndex, indice)) === currentIndex) {
        animate(x, -currentIndex * anchoPaso, {
          ...TRANSICION_CARRUSEL,
          duration: 0.48,
        });
      }
    },
    [anchoPaso, currentIndex, irAIndice, maxIndex, x],
  );

  return (
    <section className="border-t border-[#eef2f7] bg-surface-muted py-24 max-md:py-[72px] max-sm:py-16" id="eventos">
      <div className="mx-auto max-w-[1200px] px-6 max-sm:px-[18px]">
        <ScrollReveal className="mx-auto mb-12 max-w-[620px] text-center" amount={0.35}>
          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.25em] text-royal-gold">
            Comunidad parroquial
          </span>
          <h2 className="m-0 font-heading text-[clamp(30px,4vw,42px)] leading-[1.15] text-royal-blue">
            Próximos eventos
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-text-muted">
            Celebraciones, actividades y encuentros de la Parroquia San Blas.
          </p>
        </ScrollReveal>

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
            <ScrollReveal className="relative px-7 max-md:px-2 max-sm:px-0" delay={0.08}>
              <div ref={pistaRef} className="overflow-hidden touch-pan-y">
                <motion.div
                  className="flex touch-pan-y will-change-transform"
                  drag={maxIndex > 0 && !eventoSeleccionado ? "x" : false}
                  dragConstraints={{
                    left: -maxIndex * anchoPaso,
                    right: 0,
                  }}
                  dragElastic={0.12}
                  dragMomentum={false}
                  dragDirectionLock
                  onDragEnd={handleDragEnd}
                  style={{
                    x,
                    width: `${(eventos.length / cardsToShow) * 100}%`,
                    touchAction: "pan-y",
                  }}
                >
                  {eventos.map((evento) => {
                    const hora = formatearHoraEvento(evento.hora);
                    const fechaFin = extraerFechaCalendario(evento.fechaFin);
                    return (
                    <article
                      key={evento.id}
                      className="mx-3 box-border flex h-[560px] flex-col gap-3 overflow-hidden rounded-[22px] border border-[#e8edf2] bg-surface p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-sm:mx-0 max-sm:h-[540px] max-sm:p-4"
                      style={{
                        width: `calc(100% / ${eventos.length})`,
                      }}
                    >
                      <div className="relative">
                        <div className="h-44 w-full overflow-hidden rounded-[16px] bg-gradient-to-br from-royal-blue to-royal-blue-dark max-sm:h-40">
                          {evento.imagenUrl ? (
                            <img
                              src={evento.imagenUrl}
                              alt=""
                              draggable={false}
                              className="pointer-events-none h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white/90">
                              <CalendarDays size={42} aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="absolute left-3.5 top-3.5 inline-flex items-center gap-3 rounded-[14px] bg-royal-blue px-4 py-3 text-white shadow-[0_8px_18px_rgba(15,23,42,0.28)]">
                          <CalendarDays size={20} aria-hidden="true" className="shrink-0 text-royal-gold" />
                          <div>
                            <strong className="block text-[1.45rem] leading-none">
                              {formatearDia(evento.fechaInicio)}
                            </strong>
                            <span className="mt-0.5 block text-[0.74rem] tracking-[0.12em] text-white/82">
                              {formatearMes(evento.fechaInicio)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col gap-2">
                        <h3 className="m-0 line-clamp-2 min-h-[3.75rem] font-heading text-[1.5rem] leading-tight text-royal-blue">
                          {evento.titulo}
                        </h3>
                        <p className="m-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
                          <MapPin size={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{evento.lugar}</span>
                        </p>
                        <p className="m-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
                          <CalendarDays size={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{formatearFecha(evento.fechaInicio)}</span>
                        </p>
                        <p
                          className={`m-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted ${fechaFin ? "" : "invisible"}`}
                        >
                          <CalendarDays size={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">
                            Hasta {fechaFin ? formatearFecha(evento.fechaFin ?? "") : "—"}
                          </span>
                        </p>
                        <p
                          className={`m-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted ${hora ? "" : "invisible"}`}
                        >
                          <Clock3 size={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{hora || "—"}</span>
                        </p>
                        <p className="m-0 line-clamp-3 min-h-[5.6rem] text-[1.1rem] leading-[1.7] text-slate-700">
                          {evento.descripcion}
                        </p>
                        <button
                          type="button"
                          className="mt-auto inline-flex w-full shrink-0 items-center justify-center rounded-[10px] bg-royal-blue px-5 py-3 text-[0.78rem] font-extrabold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => setEventoSeleccionado(evento)}
                        >
                          Ver más
                        </button>
                      </div>
                    </article>
                    );
                  })}
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
            </ScrollReveal>

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
                    onClick={() => irAIndice(index)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {eventoSeleccionado ? (
            <ModalEvento
              evento={eventoSeleccionado}
              onCerrar={() => setEventoSeleccionado(null)}
            />
          ) : null}
        </AnimatePresence>

        <ScrollReveal className="mt-8 text-center" delay={0.12}>
          <Link
            to={Rutas.eventosPublicos}
            className="inline-flex items-center justify-center rounded-[10px] bg-royal-blue px-7 py-3.5 text-[0.88rem] font-extrabold uppercase tracking-wider text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue"
          >
            Ver todos los eventos
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
