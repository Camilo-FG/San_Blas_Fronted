import {
  CONTACTO_SEO,
  DEFAULT_LOGO,
  SITE_NAME,
  SITE_URL,
} from "./site";

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "CatholicChurch",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Parroquia San Blas",
  url: SITE_URL,
  logo: DEFAULT_LOGO,
  image: `${SITE_URL}/hero.webp`,
  description:
    "Parroquia católica en Nicoya, Guanacaste. Misas, sacramentos, catequesis y servicio pastoral a la comunidad.",
  telephone: CONTACTO_SEO.telefono,
  email: CONTACTO_SEO.correo,
  sameAs: [CONTACTO_SEO.facebook],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Centro de Nicoya",
    addressLocality: CONTACTO_SEO.localidad,
    addressRegion: CONTACTO_SEO.region,
    addressCountry: CONTACTO_SEO.pais,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.145,
    longitude: -85.452,
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Nicoya, Guanacaste, Costa Rica",
  },
};

export function getOrganizationSchema() {
  return { ...ORGANIZATION };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es-CR",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

interface BreadcrumbSegment {
  name: string;
  path: string;
}

export function getBreadcrumbSchema(segments: BreadcrumbSegment[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      item: `${SITE_URL}${s.path === "/" ? "" : s.path}`,
    })),
  };
}

export function getEventSchema(evento: {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  lugar: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.titulo,
    description: evento.descripcion,
    startDate: evento.fechaInicio,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: { "@id": `${SITE_URL}/#organization` },
    location: {
      "@type": "Place",
      name: evento.lugar,
      address: {
        "@type": "PostalAddress",
        addressLocality: CONTACTO_SEO.localidad,
        addressRegion: CONTACTO_SEO.region,
        addressCountry: CONTACTO_SEO.pais,
      },
    },
  };
}
