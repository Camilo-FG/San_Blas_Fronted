import type { LandingSectionKey } from "../../../services/landingService";

export type FieldType = "text" | "textarea" | "url" | "image" | "lines";

export interface LandingFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  rows?: number;
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
      { name: "subtitle", label: "Subtítulo", type: "text", maxLength: 40 },
      { name: "title", label: "Título", type: "text", maxLength: 60 },
      {
        name: "titleHighlight",
        label: "Título destacado",
        type: "text",
        maxLength: 60,
      },
      {
        name: "description",
        label: "Descripción",
        type: "textarea",
        maxLength: 200,
        rows: 4,
      },
      {
        name: "imageUrl",
        label: "URL de la imagen",
        type: "image",
        hint: "Pega la URL de la imagen (opcional). Si está vacía se usa /hero.webp.",
      },
    ],
  },
  {
    key: "sobre-nosotros",
    label: "Inicio — Sobre nosotros",
    description: "Texto introductorio y tarjetas de la sección Sobre nosotros.",
    fields: [
      { name: "eyebrow", label: "Etiqueta superior", type: "text", maxLength: 40 },
      { name: "title", label: "Título", type: "text", maxLength: 120 },
      { name: "lead", label: "Descripción", type: "textarea", maxLength: 300, rows: 4 },
      { name: "card1Titulo", label: "Tarjeta 1 — Título", type: "text", maxLength: 80 },
      { name: "card1Texto", label: "Tarjeta 1 — Texto", type: "textarea", maxLength: 220, rows: 3 },
      { name: "card2Titulo", label: "Tarjeta 2 — Título", type: "text", maxLength: 80 },
      { name: "card2Texto", label: "Tarjeta 2 — Texto", type: "textarea", maxLength: 220, rows: 3 },
      { name: "card3Titulo", label: "Tarjeta 3 — Título", type: "text", maxLength: 80 },
      { name: "card3Texto", label: "Tarjeta 3 — Texto", type: "textarea", maxLength: 220, rows: 3 },
      { name: "card4Titulo", label: "Tarjeta 4 — Título", type: "text", maxLength: 80 },
      { name: "card4Texto", label: "Tarjeta 4 — Texto", type: "textarea", maxLength: 220, rows: 3 },
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
      { name: "telefono", label: "Teléfono", type: "text", maxLength: 40 },
      { name: "correo", label: "Correo", type: "text", maxLength: 80 },
      { name: "ubicacion", label: "Ubicación", type: "text", maxLength: 120 },
      {
        name: "horariosAtencion",
        label: "Horarios de atención",
        type: "lines",
        hint: "Un horario por línea.",
        rows: 4,
      },
      {
        name: "mapaUrl",
        label: "URL del mapa (embed)",
        type: "url",
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
      { name: "bloque1Items", label: "Bloque 1 — Horarios", type: "lines", rows: 4 },
      { name: "bloque2Titulo", label: "Bloque 2 — Título", type: "text", maxLength: 80 },
      { name: "bloque2Items", label: "Bloque 2 — Horarios", type: "lines", rows: 4 },
      { name: "bloque3Titulo", label: "Bloque 3 — Título", type: "text", maxLength: 80 },
      { name: "bloque3Items", label: "Bloque 3 — Horarios", type: "lines", rows: 4 },
      { name: "bloque4Titulo", label: "Bloque 4 — Título", type: "text", maxLength: 80 },
      { name: "bloque4Items", label: "Bloque 4 — Horarios", type: "lines", rows: 4 },
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
        hint: "Un requisito por línea.",
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
    form.eyebrow = String(data.eyebrow ?? "");
    form.title = String(data.title ?? "");
    form.lead = String(data.lead ?? "");
    const cards = (data.cards as Array<{ titulo?: string; texto?: string }>) ?? [];
    for (let i = 0; i < 4; i += 1) {
      form[`card${i + 1}Titulo`] = String(cards[i]?.titulo ?? "");
      form[`card${i + 1}Texto`] = String(cards[i]?.texto ?? "");
    }
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

  form.subtitle = String(data.subtitle ?? "");
  form.title = String(data.title ?? "");
  form.titleHighlight = String(data.titleHighlight ?? "");
  form.description = String(data.description ?? "");
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
    return {
      eyebrow: form.eyebrow,
      title: form.title,
      lead: form.lead,
      cards: [1, 2, 3, 4].map((index) => ({
        icono: String(index).padStart(2, "0"),
        titulo: form[`card${index}Titulo`],
        texto: form[`card${index}Texto`],
      })),
    };
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
  }

  return payload;
};
