import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileCheck,
  Waves,
  Flame,
  FolderHeart,
  Clock,
  PhoneCall,
  MapPin,
  X,
} from "lucide-react";

import Rutas from "../../../routes/Rutas";
import { cn } from "../../../shared/ui/cn";

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

const SERVICES: ServiceItem[] = [
  {
    id: "catequesis",
    title: "Inscripción a Catequesis",
    description:
      "Inicie la formación en la fe y preparación sacramental para niños y jóvenes.",
    image:
      "https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&q=75&w=400",
    category: "Formación de Fe",
    icon: BookOpen,
    buttonLabel: "Iniciar Inscripción",
    linkTo: Rutas.FormsolicitudesCatequesis,
  },
  {
    id: "constancia",
    title: "Solicitud de Constancia",
    description:
      "Solicite constancias de Bautismo, Comunión, Confirmación o Matrimonio.",
    image:
      "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=400",
    category: "Archivo Parroquial",
    icon: FileCheck,
    buttonLabel: "Solicitar Constancia",
    linkTo: Rutas.SolicitudesSacramentos,
  },
  {
    id: "bautismo",
    title: "Preparación Bautizos",
    description:
      "Conozca los requisitos, charlas prebautismales y fechas disponibles para bautizos.",
    image:
      "https://images.unsplash.com/photo-1510022011102-315f696ce29f?auto=format&fit=crop&q=80&w=400",
    category: "Sacramentos",
    icon: Waves,
    buttonLabel: "Ver Más Información",
    modalDetails: {
      subtitle: "Sacramento de Iniciación Cristiana",
      description:
        "El bautismo incorpora a la persona a la Iglesia y la hace renacer como hijo de Dios.",
      schedule:
        "Sábados del mes a las 10:00 a. m., con coordinación previa en la oficina parroquial.",
      requirements: [
        "Copia del certificado de nacimiento.",
        "Copia de cédula de ambos padres.",
        "Copia de cédula de los padrinos.",
        "Constancia de charla prebautismal.",
      ],
      contact: "Oficina Parroquial San Blas. Teléfono: 2685-5010.",
    },
  },
  {
    id: "matrimonios",
    title: "Sacramento de Matrimonio",
    description:
      "Información para apertura de expediente matrimonial, charlas y coordinación de fechas.",
    image:
      "https://images.unsplash.com/photo-1460364155650-811c77f06245?auto=format&fit=crop&q=80&w=400",
    category: "Ministerio Familiar",
    icon: FolderHeart,
    buttonLabel: "Ver Más Información",
    modalDetails: {
      subtitle: "Compromiso de Amor ante el Altar",
      description:
        "La parroquia brinda acompañamiento y guía para el proceso matrimonial.",
      schedule:
        "Fechas a coordinar con la oficina parroquial según disponibilidad del templo.",
      requirements: [
        "Iniciar el trámite con anticipación.",
        "Certificados de bautismo recientes.",
        "Copia de cédula de los contrayentes.",
        "Asistencia a charlas matrimoniales.",
      ],
      contact: "Oficina Parroquial San Blas. Teléfono: 2685-5010.",
    },
  },
  {
    id: "retiro",
    title: "Retiros Espirituales",
    description:
      "Jornadas de oración, reflexión y crecimiento espiritual para la comunidad parroquial.",
    image:
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=400",
    category: "Vida Interior",
    icon: Flame,
    buttonLabel: "Ver Más Información",
    modalDetails: {
      subtitle: "Espacios de Silencio y Encuentro",
      description:
        "Los retiros espirituales permiten fortalecer la vida de fe, la oración y la convivencia comunitaria.",
      schedule: "Según calendario parroquial y avisos oficiales.",
      requirements: [
        "Inscripción previa.",
        "Disponibilidad para participar en la jornada completa.",
        "Seguir las indicaciones del equipo organizador.",
      ],
      contact: "Consultar en la oficina parroquial.",
    },
  },
];

const carouselButtonClass =
  "flex w-full cursor-pointer items-center justify-center rounded-[14px] border-none bg-[rgba(23,37,84,0.08)] px-4 py-[13px] text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#172554] no-underline transition-all hover:-translate-y-0.5 hover:bg-[#172554] hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(183,131,47,0.45)] focus-visible:outline-offset-[3px] max-[420px]:px-3.5 max-[420px]:py-3 max-[420px]:text-[10px]";

export default function ServiciosCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );

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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedService(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const maxIndex = Math.max(0, SERVICES.length - cardsToShow);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="border-y border-[#f0f0f0] bg-surface py-24 max-[900px]:py-[76px] max-sm:py-[60px]">
      <div className="mx-auto max-w-[1200px] px-6 max-sm:px-4">
        <div className="mx-auto mb-12 max-w-[620px] text-center max-sm:mb-8">
          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#b7832f] max-sm:text-[10px] max-sm:tracking-[0.18em]">
            Guías y Sacramentos
          </span>
          <h2 className="m-0 font-serif text-[clamp(30px,4vw,42px)] leading-[1.15] text-[#172554] max-sm:text-[30px] max-[420px]:text-[27px]">
            Servicios Ofrecidos
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-text-secondary max-sm:text-[13px] max-sm:leading-[1.6]">
            Acompañamiento y trámites espirituales administrados por la
            Parroquia San Blas.
          </p>
        </div>

        <div className="relative px-7 max-[900px]:px-[22px] max-sm:px-0">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{
                x: `-${currentIndex * (100 / SERVICES.length)}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              style={{
                width: `${(SERVICES.length / cardsToShow) * 100}%`,
              }}
            >
              {SERVICES.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.id}
                    className="group mx-3 box-border flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[28px] border border-[rgba(120,82,30,0.08)] bg-[#fcfbf7] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(100,70,20,0.12)] max-[900px]:min-h-[450px] max-sm:mx-0 max-sm:min-h-[430px] max-sm:rounded-[22px] max-[420px]:min-h-[415px]"
                    style={{
                      width: `calc(100% / ${SERVICES.length})`,
                    }}
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-t after:from-[#fcfbf7] after:to-transparent max-sm:h-[165px] max-[420px]:h-[155px]">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                          width={400}
                          height={176}
                          loading="lazy"
                          decoding="async"
                        />

                        <span className="absolute left-4 top-4 z-[2] rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#73522f]">
                          {service.category}
                        </span>
                      </div>

                      <div className="p-6 max-sm:p-5">
                        <div className="flex items-center gap-2.5 text-[#172554]">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(23,37,84,0.06)] text-[#b7832f]">
                            <Icon size={18} />
                          </div>

                          <h3 className="m-0 font-serif text-base leading-tight text-gray-900">
                            {service.title}
                          </h3>
                        </div>

                        <p className="mt-3.5 text-[13px] leading-[1.75] text-text-secondary">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 max-sm:px-5 max-sm:pb-5">
                      {service.linkTo ? (
                        <Link
                          to={service.linkTo}
                          className={carouselButtonClass}
                        >
                          {service.buttonLabel}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={carouselButtonClass}
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
                className="absolute left-0 top-1/2 z-[5] flex size-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-[#172554] transition-all hover:text-[#b7832f] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(183,131,47,0.45)] focus-visible:outline-offset-[3px] max-sm:hidden"
                onClick={handlePrev}
                aria-label="Ver servicios anteriores"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                className="absolute right-0 top-1/2 z-[5] flex size-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-[#172554] transition-all hover:text-[#b7832f] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(183,131,47,0.45)] focus-visible:outline-offset-[3px] max-sm:hidden"
                onClick={handleNext}
                aria-label="Ver siguientes servicios"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {maxIndex > 0 && (
          <div className="mt-8 flex justify-center gap-2 max-sm:mt-[26px]">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir al grupo de servicios ${index + 1}`}
                className={cn(
                  "h-2 cursor-pointer rounded-full border-none transition-all focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(183,131,47,0.45)] focus-visible:outline-offset-[3px]",
                  currentIndex === index
                    ? "w-7 bg-[#b7832f]"
                    : "w-2 bg-gray-300",
                )}
                onClick={() => setCurrentIndex(index)}
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
                />

                <button
                  type="button"
                  className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-white/95 text-[#172554] transition-all hover:scale-105 hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(183,131,47,0.45)] focus-visible:outline-offset-[3px]"
                  onClick={() => setSelectedService(null)}
                  aria-label="Cerrar información del servicio"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-6 max-sm:max-h-[58vh] max-sm:p-5">
                <span className="inline-block rounded-full bg-[rgba(183,131,47,0.15)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#73522f]">
                  {selectedService.category}
                </span>

                <h3
                  id="servicios-modal-title"
                  className="my-3 mb-1 font-serif text-2xl leading-tight text-[#172554] max-sm:text-[22px]"
                >
                  {selectedService.title}
                </h3>

                <p className="mb-4 text-[13px] italic text-[#73522f]">
                  {selectedService.modalDetails.subtitle}
                </p>

                <p className="text-[13px] leading-[1.7] text-gray-600">
                  {selectedService.modalDetails.description}
                </p>

                <div className="mt-[18px] flex gap-3 rounded-[18px] bg-[rgba(183,131,47,0.08)] p-4 text-[#b7832f] max-sm:p-3.5">
                  <Clock size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="text-[#172554]">Horario y cronogramas:</strong>
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-gray-600">
                      {selectedService.modalDetails.schedule}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mt-5 text-[13px] uppercase tracking-[0.12em] text-[#172554]">
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

                <div className="mt-[18px] flex gap-3 rounded-[18px] bg-[rgba(183,131,47,0.08)] p-4 text-[#b7832f] max-sm:p-3.5">
                  <PhoneCall size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="text-[#172554]">Contacto:</strong>
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
                  className="cursor-pointer rounded-[14px] border-none bg-[#172554] px-[22px] py-3 text-xs font-extrabold uppercase text-white transition-all hover:-translate-y-0.5 hover:bg-[#b7832f] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(183,131,47,0.45)] focus-visible:outline-offset-[3px] max-sm:w-full"
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
