import { HORARIOS_DEFAULT, type HorarioBloque } from "../modules/landing/horariosContent";
import {
  CONTACTO_SEO,
  DEFAULT_LOGO,
  SITE_NAME,
  SITE_URL,
} from "./site";

const DIA_SCHEMA: Record<string, string[]> = {
  lunes: ["Monday"],
  martes: ["Tuesday"],
  miércoles: ["Wednesday"],
  miercoles: ["Wednesday"],
  jueves: ["Thursday"],
  viernes: ["Friday"],
  sábado: ["Saturday"],
  sabado: ["Saturday"],
  domingo: ["Sunday"],
};

function normalizarDia(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseHora12a24(horaRaw: string): string | null {
  const limpia = horaRaw.replace(/^(Adoración|Santa Misa)\s*:\s*/i, "").trim();
  const m = limpia.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2];
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (!ampm && h <= 12 && Number(min) === 0 && h < 7) {
    // sin AM/PM: asumir tarde parroquial si es 1-6
  }
  return `${String(h).padStart(2, "0")}:${min}`;
}

function sumaUnaHora(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Convierte bloques de horarios de misa a OpeningHoursSpecification. */
export function getOpeningHoursFromBloques(bloques: HorarioBloque[]) {
  const specs: Record<string, unknown>[] = [];

  for (const bloque of bloques) {
    for (const fila of bloque.filas) {
      const diasTexto = fila.dia.split(/[-–,]|\by\b/i).map((d) => d.trim()).filter(Boolean);
      const days: string[] = [];
      for (const d of diasTexto) {
        const key = normalizarDia(d);
        const mapped = DIA_SCHEMA[key];
        if (mapped) days.push(...mapped);
      }
      if (days.length === 0) continue;

      for (const hora of fila.horas) {
        const opens = parseHora12a24(hora);
        if (!opens) continue;
        specs.push({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: days.length === 1 ? days[0] : days,
          opens,
          closes: sumaUnaHora(opens),
        });
      }
    }
  }

  return specs;
}

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
  openingHoursSpecification: getOpeningHoursFromBloques(HORARIOS_DEFAULT.bloques),
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
      item: `${SITE_URL}${s.path === "/" ? "" : s.path.replace(/\/+$/, "")}`,
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
