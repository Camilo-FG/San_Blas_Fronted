import Rutas from '../routes/Rutas';

const SITE = 'https://sanblasfrontend.netlify.app';

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  breadcrumbs?: { name: string; path: string }[];
}

export const pageMetadata: Record<string, PageMeta> = {
  [Rutas.home]: {
    title: 'Parroquia San Blas de Nicoya | Fe, Tradici\u00f3n y Servicio Pastoral',
    description: 'Parroquia San Blas de Nicoya, Guanacaste. Informaci\u00f3n sobre misas, horarios, bautizos, catequesis y eventos de la comunidad parroquial.',
    canonical: SITE,
    breadcrumbs: [{ name: 'Inicio', path: '/' }],
  },
  [Rutas.sobreNosotros]: {
    title: 'Sobre Nosotros | Parroquia San Blas de Nicoya',
    description: 'Conozca la historia, misi\u00f3n espiritual y servicio comunitario de la Parroquia San Blas de Nicoya, un referente cultural de Guanacaste.',
    canonical: SITE + '/sobre-nosotros',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Sobre Nosotros', path: '/sobre-nosotros' }],
  },
  [Rutas.historia]: {
    title: 'Historia y Legado | Parroquia San Blas de Nicoya',
    description: 'Descubra la historia de la Parroquia San Blas de Nicoya, una de las iglesias m\u00e1s antiguas de Costa Rica, desde 1544.',
    canonical: SITE + '/historia',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Historia', path: '/historia' }],
  },
  [Rutas.FormsolicitudesCatequesis]: {
    title: 'Solicitudes de Catequesis | Parroquia San Blas de Nicoya',
    description: 'Inscriba a sus hijos en la catequesis infantil o juvenil de la Parroquia San Blas de Nicoya. Informaci\u00f3n sobre niveles y requisitos.',
    canonical: SITE + '/solicitudes-catequesis',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Catequesis', path: '/solicitudes-catequesis' }],
  },
  [Rutas.donacionesPublicas]: {
    title: 'Donaciones | Parroquia San Blas de Nicoya',
    description: 'Apoye a la Parroquia San Blas de Nicoya con su donaci\u00f3n. SINPE M\u00f3vil, transferencia bancaria o donaci\u00f3n de insumos.',
    canonical: SITE + '/donaciones',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Donaciones', path: '/donaciones' }],
  },
  [Rutas.SolicitudesSacramentos]: {
    title: 'Solicitudes de Sacramentos | Parroquia San Blas de Nicoya',
    description: 'Solicite constancias de bautismo, confirmaci\u00f3n, matrimonio y otros sacramentos en la Parroquia San Blas de Nicoya.',
    canonical: SITE + '/solicitudes-sacramentos',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Sacramentos', path: '/solicitudes-sacramentos' }],
  },
  [Rutas.bautizos]: {
    title: 'Informaci\u00f3n de Bautizos | Parroquia San Blas de Nicoya',
    description: 'Requisitos, charlas bautismales y c\u00f3mo solicitar el bautismo en la Parroquia San Blas de Nicoya.',
    canonical: SITE + '/bautizos',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Bautizos', path: '/bautizos' }],
  },
  [Rutas.horarios]: {
    title: 'Horarios Parroquiales | Parroquia San Blas de Nicoya',
    description: 'Horarios de misas, confesiones y atenci\u00f3n en la oficina parroquial de San Blas de Nicoya, Guanacaste.',
    canonical: SITE + '/horarios',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Horarios', path: '/horarios' }],
  },
  [Rutas.contacto]: {
    title: 'Contacto | Parroquia San Blas de Nicoya',
    description: 'Tel\u00e9fono, correo electr\u00f3nico, ubicaci\u00f3n y horarios de atenci\u00f3n de la Parroquia San Blas de Nicoya.',
    canonical: SITE + '/contacto',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Contacto', path: '/contacto' }],
  },
  [Rutas.eventosPublicos]: {
    title: 'Pr\u00f3ximos Eventos | Parroquia San Blas de Nicoya',
    description: 'Actividades, celebraciones y encuentros de la comunidad parroquial San Blas de Nicoya.',
    canonical: SITE + '/eventos',
    breadcrumbs: [{ name: 'Inicio', path: '/' }, { name: 'Eventos', path: '/eventos' }],
  },
  [Rutas.login]: {
    title: 'Iniciar Sesi\u00f3n | Parroquia San Blas de Nicoya',
    description: 'Acceso al panel administrativo de la Parroquia San Blas de Nicoya.',
    canonical: SITE + '/login',
    robots: 'noindex, nofollow',
  },
};
