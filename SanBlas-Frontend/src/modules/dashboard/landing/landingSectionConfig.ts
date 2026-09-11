import type { LandingSectionKey } from "../../../services/landingService";
import { SOBRE_NOSOTROS_DEFAULT } from "../../landing/sobreNosotrosContent";
import {
  HISTORIA_DEFAULT,
  normalizarYoutubeEmbed,
} from "../../landing/historiaContent";

/**
 * Longitudes y formatos alineados con los DTOs del backend
 * (update-landing-section.dto.ts). Cambiar una regla implica actualizar ambos lados.
 */
export type FieldType = "text" | "textarea" | "url" | "image" | "lines";
export type LandingFieldFormat = "email" | "phone" | "youtube" | "url";

export interface LandingFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  rows?: number;
  format?: LandingFieldFormat;
}

export interface LandingSectionConfig {
  key: LandingSectionKey;
  label: string;
  description: string;
  fields: LandingFieldConfig[];
}

export const LANDING_SECTIONS: LandingSectionConfig[] = [
  {
    key: "hero",
    label: "Inicio — Hero",
    description: "Banner principal de la página de inicio.",
    fields: [
      { name: "subtitle", label: "Encabezado", type: "text", maxLength: 40, placeholder: "Desde 1544" },
      {
        name: "title",
        label: "Título (primera línea)",
        type: "text",
        maxLength: 80,
        placeholder: "Firme en la",
      },
      {
        name: "titleHighlight",
        label: "Título destacado (segunda línea)",
        type: "text",
        maxLength: 80,
        placeholder: "Fe y Tradición",
      },
      {
        name: "description",
        label: "Descripción",
        type: "textarea",
        maxLength: 300,
        rows: 4,
        placeholder:
          "Ubicada en el corazón de Nicoya, la Parroquia San Blas es testimonio vivo de nuestra historia y esperanza cristiana.",
      },
      {
        name: "imageUrl",
        label: "Imagen del banner",
        type: "image",
        hint: "Adjunte JPG, PNG o WEBP (máx. 5 MB). Se sube a Cloudinary. Si no adjunta una, se usa la imagen por defecto.",
      },
    ],
  },
  {
    key: "sobre-nosotros",
    label: "Inicio — Sobre nosotros",
    description: "Texto introductorio y tarjetas de la sección Sobre nosotros.",
    fields: [
      {
        name: "eyebrow",
        label: "Etiqueta superior",
        type: "text",
        maxLength: 40,
        placeholder: SOBRE_NOSOTROS_DEFAULT.eyebrow,
      },
      {
        name: "title",
        label: "Título",
        type: "text",
        maxLength: 160,
        placeholder: SOBRE_NOSOTROS_DEFAULT.title,
      },
      {
        name: "lead",
        label: "Descripción",
        type: "textarea",
        maxLength: 400,
        rows: 4,
        placeholder: SOBRE_NOSOTROS_DEFAULT.lead,
      },
      {
        name: "imageUrl",
        label: "Imagen central",
        type: "image",
        hint: "Adjunte JPG, PNG o WEBP (máx. 5 MB). Se sube a Cloudinary. Si no adjunta una, se usa la imagen por defecto.",
      },
      { name: "card1Titulo", label: "Tarjeta 1 — Título", type: "text", maxLength: 80, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[0].titulo },
      { name: "card1Texto", label: "Tarjeta 1 — Texto", type: "textarea", maxLength: 280, rows: 3, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[0].texto },
      { name: "card2Titulo", label: "Tarjeta 2 — Título", type: "text", maxLength: 80, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[1].titulo },
      { name: "card2Texto", label: "Tarjeta 2 — Texto", type: "textarea", maxLength: 280, rows: 3, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[1].texto },
      { name: "card3Titulo", label: "Tarjeta 3 — Título", type: "text", maxLength: 80, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[2].titulo },
      { name: "card3Texto", label: "Tarjeta 3 — Texto", type: "textarea", maxLength: 280, rows: 3, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[2].texto },
      { name: "card4Titulo", label: "Tarjeta 4 — Título", type: "text", maxLength: 80, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[3].titulo },
      { name: "card4Texto", label: "Tarjeta 4 — Texto", type: "textarea", maxLength: 280, rows: 3, placeholder: SOBRE_NOSOTROS_DEFAULT.cards[3].texto },
    ],
  },
  {
    key: "historia",
    label: "Historia y legado",
    description:
      "Textos, imágenes de fondo y video de la página Historia. El título Historia y Legado permanece fijo.",
    fields: [
      {
        name: "eyebrow",
        label: "Etiqueta (Raíces de Fe)",
        type: "text",
        maxLength: 40,
        placeholder: HISTORIA_DEFAULT.eyebrow,
      },
      {
        name: "subtitle",
        label: "Subtítulo del tesoro colonial",
        type: "text",
        maxLength: 160,
        placeholder: HISTORIA_DEFAULT.subtitle,
      },
      {
        name: "origenes",
        label: "Párrafo de orígenes",
        type: "textarea",
        maxLength: 800,
        rows: 5,
        placeholder: HISTORIA_DEFAULT.origenes,
      },
      {
        name: "restauraciones",
        label: "Párrafo de restauraciones",
        type: "textarea",
        maxLength: 800,
        rows: 5,
        placeholder: HISTORIA_DEFAULT.restauraciones,
      },
      {
        name: "cita",
        label: "Cita espiritual",
        type: "textarea",
        maxLength: 300,
        rows: 3,
        placeholder: HISTORIA_DEFAULT.cita,
      },
      {
        name: "fachada",
        label: "Párrafo de la fachada",
        type: "textarea",
        maxLength: 800,
        rows: 5,
        placeholder: HISTORIA_DEFAULT.fachada,
      },
      {
        name: "invitacion",
        label: "Párrafo de invitación",
        type: "textarea",
        maxLength: 800,
        rows: 5,
        placeholder: HISTORIA_DEFAULT.invitacion,
      },
      {
        name: "videoUrl",
        label: "Video de YouTube (embed)",
        type: "url",
        maxLength: 200,
        format: "youtube",
        placeholder: HISTORIA_DEFAULT.videoUrl,
        hint: "Use el formato https://www.youtube.com/embed/....",
      },
      {
        name: "headerImageUrl",
        label: "Imagen de fondo del encabezado",
        type: "image",
        hint: "Adjunte JPG, PNG o WEBP (máx. 5 MB). Si no adjunta una, se usa la imagen actual.",
      },
      {
        name: "quoteImageUrl",
        label: "Imagen de fondo de la cita",
        type: "image",
        hint: "Adjunte JPG, PNG o WEBP (máx. 5 MB). Si no adjunta una, se usa la imagen actual.",
      },
    ],
  },
  {
    key: "contacto",
    label: "Contacto",
    description: "Datos de contacto, horarios y mapa (inicio y página de contacto).",
    fields: [
      { name: "eyebrow", label: "Etiqueta superior", type: "text", maxLength: 40 },
      { name: "title", label: "Título", type: "text", maxLength: 80 },
      { name: "intro", label: "Introducción", type: "textarea", maxLength: 220, rows: 3 },
      { name: "telefono", label: "Teléfono", type: "text", maxLength: 40, format: "phone" },
      { name: "correo", label: "Correo", type: "text", maxLength: 80, format: "email" },
      { name: "ubicacion", label: "Ubicación", type: "text", maxLength: 120 },
      {
        name: "horariosAtencion",
        label: "Horarios de atención",
        type: "lines",
        maxLength: 200,
        hint: "Un horario por línea (máx. 200 caracteres).",
        rows: 4,
      },
      {
        name: "mapaUrl",
        label: "URL del mapa (embed)",
        type: "url",
        format: "url",
        hint: "Enlace embebido de Google Maps.",
      },
    ],
  },
  {
    key: "horarios",
    label: "Página de horarios",
    description: "Bloques de horarios parroquiales.",
    fields: [
      { name: "title", label: "Título", type: "text", maxLength: 80 },
      { name: "intro", label: "Introducción", type: "textarea", maxLength: 220, rows: 3 },
      { name: "bloque1Titulo", label: "Bloque 1 — Título", type: "text", maxLength: 80 },
      { name: "bloque1Items", label: "Bloque 1 — Horarios", type: "lines", maxLength: 200, rows: 4 },
      { name: "bloque2Titulo", label: "Bloque 2 — Título", type: "text", maxLength: 80 },
      { name: "bloque2Items", label: "Bloque 2 — Horarios", type: "lines", maxLength: 200, rows: 4 },
      { name: "bloque3Titulo", label: "Bloque 3 — Título", type: "text", maxLength: 80 },
      { name: "bloque3Items", label: "Bloque 3 — Horarios", type: "lines", maxLength: 200, rows: 4 },
      { name: "bloque4Titulo", label: "Bloque 4 — Título", type: "text", maxLength: 80 },
      { name: "bloque4Items", label: "Bloque 4 — Horarios", type: "lines", maxLength: 200, rows: 4 },
    ],
  },
  {
    key: "bautizos",
    label: "Página de bautizos",
    description: "Información y requisitos para bautizos.",
    fields: [
      { name: "title", label: "Título", type: "text", maxLength: 80 },
      { name: "intro", label: "Introducción", type: "textarea", maxLength: 260, rows: 4 },
      {
        name: "requisitos",
        label: "Requisitos",
        type: "lines",
        maxLength: 200,
        hint: "Un requisito por línea (máx. 200 caracteres).",
        rows: 6,
      },
      { name: "charlas", label: "Charlas prebautismales", type: "textarea", maxLength: 300, rows: 4 },
      { name: "solicitud", label: "Texto de solicitud", type: "textarea", maxLength: 300, rows: 4 },
    ],
  },
];

export const sectionDataToForm = (
  key: LandingSectionKey,
  data: Record<string, unknown>,
): Record<string, string> => {
  const form: Record<string, string> = {};

  if (key === "sobre-nosotros") {
    form.eyebrow = String(data.eyebrow ?? SOBRE_NOSOTROS_DEFAULT.eyebrow);
    form.title = String(data.title ?? SOBRE_NOSOTROS_DEFAULT.title);
    form.lead = String(data.lead ?? SOBRE_NOSOTROS_DEFAULT.lead);
    form.imageUrl = String(data.imageUrl ?? "");
    const cards = (data.cards as Array<{ titulo?: string; texto?: string }>) ?? [];
    for (let i = 0; i < 4; i += 1) {
      form[`card${i + 1}Titulo`] = String(
        cards[i]?.titulo ?? SOBRE_NOSOTROS_DEFAULT.cards[i].titulo,
      );
      form[`card${i + 1}Texto`] = String(
        cards[i]?.texto ?? SOBRE_NOSOTROS_DEFAULT.cards[i].texto,
      );
    }
    return form;
  }

  if (key === "historia") {
    form.eyebrow = String(data.eyebrow ?? HISTORIA_DEFAULT.eyebrow);
    form.subtitle = String(data.subtitle ?? HISTORIA_DEFAULT.subtitle);
    form.origenes = String(data.origenes ?? HISTORIA_DEFAULT.origenes);
    form.restauraciones = String(
      data.restauraciones ?? HISTORIA_DEFAULT.restauraciones,
    );
    form.cita = String(data.cita ?? HISTORIA_DEFAULT.cita);
    form.fachada = String(data.fachada ?? HISTORIA_DEFAULT.fachada);
    form.invitacion = String(data.invitacion ?? HISTORIA_DEFAULT.invitacion);
    form.videoUrl = String(data.videoUrl ?? HISTORIA_DEFAULT.videoUrl);
    form.headerImageUrl = String(data.headerImageUrl ?? "");
    form.quoteImageUrl = String(data.quoteImageUrl ?? "");
    return form;
  }

  if (key === "horarios") {
    form.title = String(data.title ?? "");
    form.intro = String(data.intro ?? "");
    const bloques = (data.bloques as Array<{ titulo?: string; items?: string[] }>) ?? [];
    for (let i = 0; i < 4; i += 1) {
      form[`bloque${i + 1}Titulo`] = String(bloques[i]?.titulo ?? "");
      form[`bloque${i + 1}Items`] = (bloques[i]?.items ?? []).join("\n");
    }
    return form;
  }

  if (key === "contacto") {
    form.title = String(data.title ?? "");
    form.eyebrow = String(data.eyebrow ?? "");
    form.intro = String(data.intro ?? "");
    form.telefono = String(data.telefono ?? "");
    form.correo = String(data.correo ?? "");
    form.ubicacion = String(data.ubicacion ?? "");
    form.mapaUrl = String(data.mapaUrl ?? "");
    form.horariosAtencion = ((data.horariosAtencion as string[]) ?? []).join("\n");
    return form;
  }

  if (key === "bautizos") {
    form.title = String(data.title ?? "");
    form.intro = String(data.intro ?? "");
    form.charlas = String(data.charlas ?? "");
    form.solicitud = String(data.solicitud ?? "");
    form.requisitos = ((data.requisitos as string[]) ?? []).join("\n");
    return form;
  }

  form.subtitle = String(data.subtitle ?? "Desde 1544");
  form.title = String(data.title ?? "Firme en la");
  form.titleHighlight = String(data.titleHighlight ?? "Fe y Tradición");
  form.description = String(
    data.description ??
      "Ubicada en el corazón de Nicoya, la Parroquia San Blas es testimonio vivo de nuestra historia y esperanza cristiana.",
  );
  form.imageUrl = String(data.imageUrl ?? "");
  return form;
};

export const formToSectionData = (
  key: LandingSectionKey,
  form: Record<string, string>,
): Record<string, unknown> => {
  const lines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  if (key === "sobre-nosotros") {
    const payload: Record<string, unknown> = {
      eyebrow: form.eyebrow,
      title: form.title,
      lead: form.lead,
      cards: [1, 2, 3, 4].map((index) => ({
        icono: String(index).padStart(2, "0"),
        titulo: form[`card${index}Titulo`],
        texto: form[`card${index}Texto`],
      })),
    };

    if (form.imageUrl.trim()) {
      payload.imageUrl = form.imageUrl.trim();
    } else {
      payload.eliminarImagen = true;
    }

    return payload;
  }

  if (key === "historia") {
    const payload: Record<string, unknown> = {
      eyebrow: form.eyebrow,
      subtitle: form.subtitle,
      origenes: form.origenes,
      restauraciones: form.restauraciones,
      cita: form.cita,
      fachada: form.fachada,
      invitacion: form.invitacion,
      videoUrl: normalizarYoutubeEmbed(form.videoUrl),
    };

    if (form.headerImageUrl.trim()) {
      payload.headerImageUrl = form.headerImageUrl.trim();
    } else {
      payload.eliminarHeaderImagen = true;
    }

    if (form.quoteImageUrl.trim()) {
      payload.quoteImageUrl = form.quoteImageUrl.trim();
    } else {
      payload.eliminarQuoteImagen = true;
    }

    return payload;
  }

  if (key === "horarios") {
    return {
      title: form.title,
      intro: form.intro,
      bloques: [1, 2, 3, 4].map((index) => ({
        titulo: form[`bloque${index}Titulo`],
        items: lines(form[`bloque${index}Items`]),
      })),
    };
  }

  if (key === "contacto") {
    return {
      eyebrow: form.eyebrow,
      title: form.title,
      intro: form.intro,
      telefono: form.telefono,
      correo: form.correo,
      ubicacion: form.ubicacion,
      mapaUrl: form.mapaUrl,
      horariosAtencion: lines(form.horariosAtencion),
    };
  }

  if (key === "bautizos") {
    return {
      title: form.title,
      intro: form.intro,
      charlas: form.charlas,
      solicitud: form.solicitud,
      requisitos: lines(form.requisitos),
    };
  }

  const payload: Record<string, unknown> = {
    subtitle: form.subtitle,
    title: form.title,
    titleHighlight: form.titleHighlight,
    description: form.description,
  };

  if (form.imageUrl.trim()) {
    payload.imageUrl = form.imageUrl.trim();
  } else {
    payload.eliminarImagen = true;
  }

  return payload;
};
