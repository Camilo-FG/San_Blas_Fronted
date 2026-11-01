import Rutas from "../routes/Rutas";
import { SITE_URL } from "./site";

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  breadcrumbs?: { name: string; path: string }[];
}

/** Titles ~50–60 chars; descriptions ~120–155. */
export const pageMetadata: Record<string, PageMeta> = {
  [Rutas.home]: {
    title: "Parroquia San Blas Nicoya | Fe y tradición",
    description:
      "Sitio oficial de la Parroquia San Blas en Nicoya, Guanacaste. Misas, horarios, bautizos, catequesis, sacramentos y eventos.",
    canonical: SITE_URL,
    ogImage: `${SITE_URL}/hero.webp`,
    breadcrumbs: [{ name: "Inicio", path: "/" }],
  },
  [Rutas.sobreNosotros]: {
    title: "Sobre nosotros | Parroquia San Blas Nicoya",
    description:
      "Misión, servicio pastoral y vida comunitaria de la Parroquia San Blas de Nicoya, referente de fe en Guanacaste.",
    canonical: `${SITE_URL}/sobre-nosotros`,
    ogImage: `${SITE_URL}/sobre-nosotros.jpg`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Sobre Nosotros", path: "/sobre-nosotros" },
    ],
  },
  [Rutas.historia]: {
    title: "Historia | Parroquia San Blas de Nicoya",
    description:
      "Historia de la Parroquia San Blas de Nicoya, una de las iglesias más antiguas de Costa Rica, desde el siglo XVI.",
    canonical: `${SITE_URL}/historia`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Historia", path: "/historia" },
    ],
  },
  [Rutas.FormsolicitudesCatequesis]: {
    title: "Catequesis | Parroquia San Blas Nicoya",
    description:
      "Inscriba a niños y jóvenes en la catequesis de la Parroquia San Blas de Nicoya. Niveles, requisitos y formulario.",
    canonical: `${SITE_URL}/solicitudes-catequesis`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Catequesis", path: "/solicitudes-catequesis" },
    ],
  },
  [Rutas.solicitudesCica]: {
    title: "CICA adultos | Parroquia San Blas Nicoya",
    description:
      "Inscripción a la Catequesis de Iniciación Cristiana de Adultos (CICA) en la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/solicitudes-cica`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "CICA", path: "/solicitudes-cica" },
    ],
  },
  [Rutas.FormsolicitudesCatequesisBautismo]: {
    title: "Catequesis bautismo | San Blas Nicoya",
    description:
      "Inscripción a la catequesis previa al bautismo para padres, madres y padrinos en la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/solicitudes-catequesis-bautismo`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      {
        name: "Catequesis para el bautismo",
        path: "/solicitudes-catequesis-bautismo",
      },
    ],
  },
  [Rutas.donacionesPublicas]: {
    title: "Donaciones | Parroquia San Blas Nicoya",
    description:
      "Apoye a la Parroquia San Blas de Nicoya: SINPE Móvil, transferencia bancaria o insumos pastorales.",
    canonical: `${SITE_URL}/donaciones`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Donaciones", path: "/donaciones" },
    ],
  },
  [Rutas.SolicitudesSacramentos]: {
    title: "Constancias | Parroquia San Blas Nicoya",
    description:
      "Solicite constancias de bautismo, comunión, confirmación o matrimonio en la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/solicitudes-sacramentos`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Sacramentos", path: "/solicitudes-sacramentos" },
    ],
  },
  [Rutas.bautizos]: {
    title: "Bautizos | Parroquia San Blas de Nicoya",
    description:
      "Requisitos, charlas bautismales y pasos para solicitar el bautismo en la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/bautizos`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Bautizos", path: "/bautizos" },
    ],
  },
  [Rutas.horarios]: {
    title: "Horarios de misa | San Blas Nicoya",
    description:
      "Horarios de misas, confesiones y atención en la oficina parroquial de San Blas de Nicoya, Guanacaste.",
    canonical: `${SITE_URL}/horarios`,
    ogImage: `${SITE_URL}/horarios-fondo.jpg`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Horarios", path: "/horarios" },
    ],
  },
  [Rutas.contacto]: {
    title: "Contacto | Parroquia San Blas de Nicoya",
    description:
      "Teléfono, correo, ubicación y horarios de atención de la Parroquia San Blas de Nicoya, Guanacaste.",
    canonical: `${SITE_URL}/contacto`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Contacto", path: "/contacto" },
    ],
  },
  [Rutas.eventosPublicos]: {
    title: "Eventos | Parroquia San Blas de Nicoya",
    description:
      "Actividades, celebraciones y encuentros de la comunidad parroquial San Blas de Nicoya. Consulte fechas.",
    canonical: `${SITE_URL}/eventos`,
    breadcrumbs: [
      { name: "Inicio", path: "/" },
      { name: "Eventos", path: "/eventos" },
    ],
  },
  [Rutas.notFound]: {
    title: "Página no encontrada | San Blas Nicoya",
    description:
      "La página solicitada no existe. Vuelva al inicio o consulte horarios y contacto de la Parroquia San Blas.",
    canonical: `${SITE_URL}/404`,
    robots: "noindex, follow",
  },
  [Rutas.login]: {
    title: "Iniciar sesión | San Blas Nicoya",
    description:
      "Acceso al panel administrativo de la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/login`,
    robots: "noindex, nofollow",
  },
  [Rutas.recuperarContrasena]: {
    title: "Recuperar contraseña | San Blas Nicoya",
    description:
      "Solicite un enlace para restablecer la contraseña de su cuenta en la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/recuperar-contrasena`,
    robots: "noindex, nofollow",
  },
  [Rutas.restablecerContrasena]: {
    title: "Restablecer contraseña | San Blas Nicoya",
    description:
      "Cree una nueva contraseña para su cuenta de la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/reset-password`,
    robots: "noindex, nofollow",
  },
  [Rutas.activarCuenta]: {
    title: "Activar cuenta | San Blas Nicoya",
    description:
      "Active su cuenta para acceder al sistema de la Parroquia San Blas de Nicoya.",
    canonical: `${SITE_URL}/activar-cuenta`,
    robots: "noindex, nofollow",
  },
};
