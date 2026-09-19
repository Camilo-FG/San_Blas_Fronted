import {
  BookOpen,
  FileCheck,
  Waves,
  Flame,
  FolderHeart,
} from "lucide-react";

export interface ServicioDetalle {
  subtitle: string;
  description: string;
  schedule: string;
  requirements: string[];
  contact: string;
}

export interface ServicioItem {
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  buttonLabel: string;
  linkTo?: string;
  modalDetails?: ServicioDetalle;
}

export const SERVICIOS_DEFAULT = {
  eyebrow: "Guías y Sacramentos",
  title: "Servicios Ofrecidos",
  intro:
    "Acompañamiento y trámites espirituales administrados por la Parroquia San Blas.",
  items: [
    {
      title: "Inscripción a Catequesis",
      description:
        "Inicie la formación en la fe y preparación sacramental para niños y jóvenes.",
      imageUrl:        "https://res.cloudinary.com/rbrda5nv/image/upload/v1789838128/landing/servicios/default/catequesis.jpg",
      category: "Formación de Fe",
      buttonLabel: "Iniciar Inscripción",
      linkTo: "/solicitudes-catequesis",
    },
    {
      title: "Solicitud de Constancia",
      description:
        "Solicite constancias de Bautismo, Comunión, Confirmación o Matrimonio.",
      imageUrl:        "https://res.cloudinary.com/rbrda5nv/image/upload/v1789838129/landing/servicios/default/constancia.jpg",
      category: "Archivo Parroquial",
      buttonLabel: "Solicitar Constancia",
      linkTo: "/solicitudes-sacramentos",
    },
    {
      title: "Preparación Bautizos",
      description:
        "Conozca los requisitos, charlas prebautismales y fechas disponibles para bautizos.",
      imageUrl:        "https://res.cloudinary.com/rbrda5nv/image/upload/v1789838146/landing/servicios/default/bautismo.jpg",
      category: "Sacramentos",
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
      title: "Sacramento de Matrimonio",
      description:
        "Información para apertura de expediente matrimonial, charlas y coordinación de fechas.",
      imageUrl:        "https://res.cloudinary.com/rbrda5nv/image/upload/v1789838147/landing/servicios/default/matrimonios.jpg",
      category: "Ministerio Familiar",
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
      title: "Retiros Espirituales",
      description:
        "Jornadas de oración, reflexión y crecimiento espiritual para la comunidad parroquial.",
      imageUrl:        "https://res.cloudinary.com/rbrda5nv/image/upload/v1789838131/landing/servicios/default/retiro.jpg",
      category: "Vida Interior",
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
  ] as ServicioItem[],
};

// los iconos no se editan en el CMS: se asignan por posición del servicio
export const SERVICIO_ICONS = [BookOpen, FileCheck, Waves, FolderHeart, Flame];

export function iconoServicio(index: number) {
  return SERVICIO_ICONS[index % SERVICIO_ICONS.length];
}

