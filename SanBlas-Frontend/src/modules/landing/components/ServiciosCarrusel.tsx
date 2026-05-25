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
import "./ServiciosCarousel.css";

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
      "https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&q=80&w=800",
    category: "Formación de Fe",
    icon: BookOpen,
    buttonLabel: "Iniciar Inscripción",
    linkTo: Rutas.dashboardUrl.solicitudesCatequesis,
  },
  {
    id: "constancia",
    title: "Solicitud de Constancia",
    description:
      "Solicite constancias de Bautismo, Comunión, Confirmación o Matrimonio.",
    image:
      "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=800",
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
      "https://images.unsplash.com/photo-1510022011102-315f696ce29f?auto=format&fit=crop&q=80&w=800",
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
      "https://images.unsplash.com/photo-1460364155650-811c77f06245?auto=format&fit=crop&q=80&w=800",
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
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800",
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

export default function ServiciosCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, SERVICES.length - cardsToShow);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="servicios-carousel">
      <div className="servicios-carousel__container">
        <div className="servicios-carousel__header">
          <span>Guías y Sacramentos</span>
          <h2>Servicios Ofrecidos</h2>
          <p>
            Acompañamiento y trámites espirituales administrados por la
            Parroquia San Blas.
          </p>
        </div>

        <div className="servicios-carousel__wrapper">
          <div className="servicios-carousel__viewport">
            <motion.div
              className="servicios-carousel__track"
              animate={{ x: `-${currentIndex * (100 / cardsToShow)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                width: `${(SERVICES.length / cardsToShow) * 100}%`,
              }}
            >
              {SERVICES.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.id}
                    className="servicios-carousel__card"
                    style={{ width: `calc(100% / ${SERVICES.length})` }}
                  >
                    <div>
                      <div className="servicios-carousel__image-box">
                        <img
                          src={service.image}
                          alt={service.title}
                        />
                        <span>{service.category}</span>
                      </div>

                      <div className="servicios-carousel__body">
                        <div className="servicios-carousel__title-row">
                          <div className="servicios-carousel__icon">
                            <Icon size={18} />
                          </div>
                          <h3>{service.title}</h3>
                        </div>

                        <p>{service.description}</p>
                      </div>
                    </div>

                    <div className="servicios-carousel__footer">
                      {service.linkTo ? (
                        <Link
                          to={service.linkTo}
                          className="servicios-carousel__button"
                        >
                          {service.buttonLabel}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="servicios-carousel__button"
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
                className="servicios-carousel__arrow servicios-carousel__arrow--left"
                onClick={handlePrev}
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                className="servicios-carousel__arrow servicios-carousel__arrow--right"
                onClick={handleNext}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {maxIndex > 0 && (
          <div className="servicios-carousel__dots">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`servicios-carousel__dot ${
                  currentIndex === index
                    ? "servicios-carousel__dot--active"
                    : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedService && selectedService.modalDetails && (
          <div className="servicios-modal">
            <motion.div
              className="servicios-modal__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
            />

            <motion.div
              className="servicios-modal__content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="servicios-modal__image">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                />

                <button
                  type="button"
                  className="servicios-modal__close"
                  onClick={() => setSelectedService(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="servicios-modal__body">
                <span className="servicios-modal__category">
                  {selectedService.category}
                </span>

                <h3>{selectedService.title}</h3>
                <p className="servicios-modal__subtitle">
                  {selectedService.modalDetails.subtitle}
                </p>

                <p>{selectedService.modalDetails.description}</p>

                <div className="servicios-modal__info">
                  <Clock size={20} />
                  <div>
                    <strong>Horario y cronogramas:</strong>
                    <p>{selectedService.modalDetails.schedule}</p>
                  </div>
                </div>

                <div>
                  <h4>Requisitos obligatorios</h4>
                  <ul>
                    {selectedService.modalDetails.requirements.map(
                      (req, index) => (
                        <li key={index}>{req}</li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="servicios-modal__info">
                  <PhoneCall size={20} />
                  <div>
                    <strong>Contacto:</strong>
                    <p>{selectedService.modalDetails.contact}</p>
                    <small>
                      <MapPin size={14} /> Parroquia San Blas, Nicoya,
                      Guanacaste
                    </small>
                  </div>
                </div>
              </div>

              <div className="servicios-modal__footer">
                <button
                  type="button"
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
