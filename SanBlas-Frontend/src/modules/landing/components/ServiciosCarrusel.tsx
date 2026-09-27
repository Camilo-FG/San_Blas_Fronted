import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  PhoneCall,
  MapPin,
  X,
} from "lucide-react";

import { cn, ScrollReveal } from "../../../shared/ui";
import { useLandingSection } from "../../../hooks/useLandingSection";
import {
  iconoServicio,
  SERVICIOS_DEFAULT,
  type ServicioItem as ServicioGuardado,
} from "../serviciosContent";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  icon: React.ElementType;
  buttonLabel: string;
  linkTo?: string;
  modalDetails?: {
    subtitle: string;
    description: string;
    schedule: string;
    requirements: string[];
    contact: string;
  };
}

// los datos guardados en la BD no traen id ni icono: se completan por posición
function mapearServicios(items: ServicioGuardado[]): ServiceItem[] {
  return items.map((item, index) => ({
    id: `servicio-${index + 1}`,
    title: item.title,
    description: item.description,
    image: item.imageUrl ?? "",
    category: item.category,
    icon: iconoServicio(index),
    buttonLabel: item.buttonLabel,
    linkTo: item.linkTo,
    modalDetails: item.modalDetails,
  }));
}
const carouselButtonClass =
  "relative z-[1] flex w-full cursor-pointer items-center justify-center rounded-[14px] border border-royal-blue bg-royal-blue px-4 py-3.5 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-white no-underline transition-all hover:-translate-y-0.5 hover:border-royal-blue-dark hover:bg-royal-blue-dark focus-visible:outline focus-visible:outline-3 focus-visible:outline-royal-gold/45 focus-visible:outline-offset-[3px] max-[420px]:px-3.5 max-[420px]:py-3 max-[420px]:text-[10px]";

const TRANSICION_CARRUSEL = {
  type: "tween" as const,
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function ServiciosCarousel() {
  const { data } = useLandingSection("servicios", SERVICIOS_DEFAULT, {
    defer: true,
  });
  const SERVICES = useMemo(
    () => mapearServicios(data.items ?? SERVICIOS_DEFAULT.items),
    [data.items],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [anchoVista, setAnchoVista] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );
  const pistaRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

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
    () => Math.max(0, SERVICES.length - cardsToShow),
    [cardsToShow],
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
  }, []);

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
    if (!selectedService) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setSelectedService(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedService]);

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
    <section className="border-y border-[#f0f0f0] bg-surface py-24 max-[900px]:py-[76px] max-sm:py-[60px]">
      <div className="mx-auto max-w-[1320px] px-6 max-sm:px-4">
        <ScrollReveal className="mx-auto mb-12 max-w-[620px] text-center max-sm:mb-8" amount={0.35}>
          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.25em] text-royal-gold max-sm:text-[10px] max-sm:tracking-[0.18em]">
            {data.eyebrow}
          </span>
          <h2 className="m-0 font-heading text-[clamp(30px,4vw,42px)] leading-[1.15] text-royal-blue">
            {data.title}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-text-secondary max-sm:text-[13px] max-sm:leading-[1.6]">
            {data.intro}
          </p>
        </ScrollReveal>

        <ScrollReveal className="relative px-7 max-[900px]:px-[22px] max-sm:px-0" delay={0.08}>
          <div ref={pistaRef} className="overflow-hidden py-6 touch-pan-y">
            <motion.div
              className="flex touch-pan-y will-change-transform"
              drag={maxIndex > 0 && !selectedService ? "x" : false}
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
                width: `${(SERVICES.length / cardsToShow) * 100}%`,
                touchAction: "pan-y",
              }}
            >
              {SERVICES.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.id}
                    className="servicio-card group relative mx-3 box-border flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[28px] border border-black/20 bg-surface transition-all hover:-translate-y-1 max-[900px]:min-h-[500px] max-sm:mx-0 max-sm:min-h-[470px] max-sm:rounded-[22px] max-[420px]:min-h-[450px]"
                    style={{
                      width: `calc(100% / ${SERVICES.length})`,
                    }}
                  >
                    <div>
                      <div className="relative h-56 overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-t after:from-white after:via-white/15 after:to-transparent max-sm:h-44 max-[420px]:h-40">
                        <img
                          src={service.image}
                          alt={service.title}
                          draggable={false}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                          width={400}
                          height={176}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.onerror = null;
                            img.src = "/servicio-placeholder.jpg";
                          }}
                        />

                        <span className="absolute left-4 top-4 z-[2] rounded-full bg-royal-blue px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-royal-gold">
                          {service.category}
                        </span>
                      </div>

                      <div className="p-6 max-sm:p-5">
                        <div className="flex items-center gap-2.5 text-royal-blue">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-royal-gold/15 text-royal-blue">
                            <Icon size={20} />
                          </div>

                          <h3 className="m-0 font-heading text-lg leading-tight text-royal-blue max-sm:text-base">
                            {service.title}
                          </h3>
                        </div>

                        <p className="mt-3.5 text-sm leading-[1.75] text-text-secondary">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 max-sm:px-5 max-sm:pb-5">
                      {service.linkTo ? (
                        <Link
                          to={service.linkTo}
                          className={carouselButtonClass}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          {service.buttonLabel}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={carouselButtonClass}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => setSelectedService(service)}
                        >
                          {service.buttonLabel}
                        </button>
                      )}
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
                className="absolute left-0 top-1/2 z-[5] flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-surface text-royal-blue shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all hover:scale-[1.04] hover:bg-royal-blue hover:text-white max-md:size-[38px] max-sm:hidden"
                onClick={handlePrev}
                aria-label="Ver servicios anteriores"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                className="absolute right-0 top-1/2 z-[5] flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-surface text-royal-blue shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all hover:scale-[1.04] hover:bg-royal-blue hover:text-white max-md:size-[38px] max-sm:hidden"
                onClick={handleNext}
                aria-label="Ver siguientes servicios"
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
                aria-label={`Ir al grupo de servicios ${index + 1}`}
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
      </div>

      <AnimatePresence>
        {selectedService && selectedService.modalDetails && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 max-sm:items-end max-sm:p-4">
            <motion.div
              className="fixed inset-0 bg-[rgba(23,37,84,0.65)] backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
            />

            <motion.div
              className="relative z-[2] max-h-[90vh] w-full max-w-[540px] overflow-hidden rounded-[28px] bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.25)] max-sm:max-h-[90vh] max-sm:rounded-t-3xl max-sm:rounded-b-none"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="servicios-modal-title"
            >
              <div className="relative h-[180px] max-sm:h-[150px]">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="size-full object-cover"
                  width={400}
                  height={240}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = "/servicio-placeholder.jpg";
                  }}
                />

                <button
                  type="button"
                  className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-white/95 text-royal-blue transition-all hover:scale-105 hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-royal-gold/45 focus-visible:outline-offset-[3px]"
                  onClick={() => setSelectedService(null)}
                  aria-label="Cerrar información del servicio"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-6 max-sm:max-h-[58vh] max-sm:p-5">
                <span className="inline-block rounded-full bg-royal-blue px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-royal-gold">
                  {selectedService.category}
                </span>

                <h3
                  id="servicios-modal-title"
                  className="my-3 mb-1 font-heading text-2xl leading-tight text-royal-blue max-sm:text-[22px]"
                >
                  {selectedService.title}
                </h3>

                <p className="mb-4 text-[13px] italic text-royal-gold-muted">
                  {selectedService.modalDetails.subtitle}
                </p>

                <p className="text-[13px] leading-[1.7] text-gray-600">
                  {selectedService.modalDetails.description}
                </p>

                <div className="mt-[18px] flex gap-3 rounded-[18px] bg-royal-gold/10 p-4 text-royal-gold max-sm:p-3.5">
                  <Clock size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="text-royal-blue">Horario y cronogramas:</strong>
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-gray-600">
                      {selectedService.modalDetails.schedule}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mt-5 text-[13px] uppercase tracking-[0.12em] text-royal-blue">
                    Requisitos obligatorios
                  </h4>

                  <ul className="mt-2.5 list-disc pl-5">
                    {selectedService.modalDetails.requirements.map(
                      (requirement, index) => (
                        <li
                          key={index}
                          className="mb-1.5 text-[13px] leading-[1.7] text-gray-600"
                        >
                          {requirement}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="mt-[18px] flex gap-3 rounded-[18px] bg-royal-gold/10 p-4 text-royal-gold max-sm:p-3.5">
                  <PhoneCall size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="text-royal-blue">Contacto:</strong>
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-gray-600">
                      {selectedService.modalDetails.contact}
                    </p>

                    <small className="mt-2 flex items-center gap-1 text-gray-500">
                      <MapPin size={14} />
                      Parroquia San Blas, Nicoya, Guanacaste
                    </small>
                  </div>
                </div>
              </div>

              <div className="flex justify-end bg-gray-50 px-6 py-[18px] max-sm:px-5 max-sm:py-4">
                <button
                  type="button"
                  className="cursor-pointer rounded-[14px] border-none bg-royal-blue px-[22px] py-3 text-xs font-extrabold uppercase text-white transition-all hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue focus-visible:outline focus-visible:outline-3 focus-visible:outline-royal-gold/45 focus-visible:outline-offset-[3px] max-sm:w-full"
                  onClick={() => setSelectedService(null)}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
