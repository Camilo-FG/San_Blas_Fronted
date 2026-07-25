const SITE_URL = 'https://sanblasfrontend.netlify.app';

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'CatholicChurch',
  name: 'Parroquia San Blas de Nicoya',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/hero.webp`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nicoya',
    addressRegion: 'Guanacaste',
    addressCountry: 'CR',
  },
};

export function getOrganizationSchema() {
  return { ...ORGANIZATION };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Parroquia San Blas de Nicoya',
    url: SITE_URL,
  };
}

interface BreadcrumbSegment {
  name: string;
  path: string;
}

export function getBreadcrumbSchema(segments: BreadcrumbSegment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      item: `${SITE_URL}${s.path}`,
    })),
  };
}

export function getEventSchema(evento: { titulo: string; descripcion: string; fechaInicio: string; lugar: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.titulo,
    description: evento.descripcion,
    startDate: evento.fechaInicio,
    location: {
      '@type': 'Place',
      name: evento.lugar,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nicoya',
        addressRegion: 'Guanacaste',
        addressCountry: 'CR',
      },
    },
  };
}