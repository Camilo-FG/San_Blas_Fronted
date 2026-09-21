/**
 * Reglas alineadas con los DTOs del backend
 * (ing_san_blas_back/src/landing/DTO/update-landing-section.dto.ts).
 * Cualquier cambio de obligatoriedad, formato o longitud debe aplicarse en ambos lados.
 */
import { normalizarYoutubeEmbed } from "../../landing/historiaContent";
import type { LandingSectionKey } from "../../../services/landingService";
import { dividirFilaHorario, LANDING_SECTIONS } from "./landingSectionConfig";

export const TELEFONO_LANDING_REGEX = /^[\d+\s()-]{7,40}$/;
export const YOUTUBE_EMBED_REGEX =
  /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+(?:\?.*)?$/;
export const CORREO_LANDING_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MENSAJES_REQUERIDO: Record<string, string> = {
  subtitle: "El encabezado es obligatorio.",
  title: "El título es obligatorio.",
  titleHighlight: "El título destacado es obligatorio.",
  description: "La descripción es obligatoria.",
  eyebrow: "La etiqueta es obligatoria.",
  lead: "La descripción es obligatoria.",
  origenes: "El párrafo de orígenes es obligatorio.",
  restauraciones: "El párrafo de restauraciones es obligatorio.",
  cita: "La cita espiritual es obligatoria.",
  fachada: "El párrafo de la fachada es obligatorio.",
  invitacion: "El párrafo de invitación es obligatorio.",
  videoUrl: "El enlace del video es obligatorio.",
  intro: "La introducción es obligatoria.",
  telefono: "El teléfono es obligatorio.",
  correo: "El correo es obligatorio.",
  ubicacion: "La ubicación es obligatoria.",
  horariosAtencion: "Incluya al menos un horario de atención.",
  mapaUrl: "La URL del mapa es obligatoria.",
  requisitos: "Incluya al menos un requisito.",
  charlas: "Las charlas prebautismales son obligatorias.",
  solicitud: "El texto de solicitud es obligatorio.",
};

function mensajeRequerido(sectionKey: LandingSectionKey, name: string): string {
  if (/^card\d+Titulo$/.test(name)) {
    return "El título de la tarjeta es obligatorio.";
  }
  if (/^card\d+Texto$/.test(name)) {
    return "El texto de la tarjeta es obligatorio.";
  }
  if (/^bloque\d+Titulo$/.test(name)) {
    return "El título del bloque es obligatorio.";
  }
  if (/^bloque\d+Items$/.test(name)) {
    return "Cada bloque debe incluir al menos un horario.";
  }
  if (/^bloque\d+Filas$/.test(name)) {
    return "Cada fila debe usar el formato Día :: hora1, hora2.";
  }
  if (name === "subtitle") {
    if (sectionKey === "historia") return "El subtítulo es obligatorio.";
    if (sectionKey === "horarios") return "El subtítulo es obligatorio.";
    return "El encabezado es obligatorio.";
  }
  return MENSAJES_REQUERIDO[name] ?? "Este campo es obligatorio.";
}

function mensajeLongitud(
  sectionKey: LandingSectionKey,
  name: string,
  maxLength: number,
): string {
  if (/^card\d+Titulo$/.test(name)) {
    return "El título de la tarjeta no puede superar 80 caracteres.";
  }
  if (/^card\d+Texto$/.test(name)) {
    return "El texto de la tarjeta no puede superar 220 caracteres.";
  }
  if (/^bloque\d+Titulo$/.test(name)) {
    return "El título del bloque no puede superar 80 caracteres.";
  }
  if (/^bloque\d+Items$/.test(name) || name === "horariosAtencion") {
    return "Cada horario no puede superar 200 caracteres.";
  }
  if (name === "requisitos") {
    return "Cada requisito no puede superar 200 caracteres.";
  }
  if (/^bloque\d+Filas$/.test(name)) {
    return "Cada hora no puede superar 120 caracteres.";
  }
  if (name === "subtitle") {
    if (sectionKey === "historia")
      return "El subtítulo no puede superar 160 caracteres.";
    if (sectionKey === "horarios")
      return "El subtítulo no puede superar 80 caracteres.";
    return "El encabezado no puede superar 40 caracteres.";
  }

  const mensajes: Record<string, string> = {
    subtitle: "El encabezado no puede superar 40 caracteres.",
    title: `El título no puede superar ${maxLength} caracteres.`,
    titleHighlight: "El título destacado no puede superar 80 caracteres.",
    description: "La descripción no puede superar 300 caracteres.",
    eyebrow: "La etiqueta no puede superar 40 caracteres.",
    lead: "La descripción no puede superar 300 caracteres.",
    origenes: "El párrafo de orígenes no puede superar 800 caracteres.",
    restauraciones:
      "El párrafo de restauraciones no puede superar 800 caracteres.",
    cita: "La cita no puede superar 300 caracteres.",
    fachada: "El párrafo de la fachada no puede superar 800 caracteres.",
    invitacion: "El párrafo de invitación no puede superar 800 caracteres.",
    videoUrl: "El enlace del video no puede superar 200 caracteres.",
    intro: `La introducción no puede superar ${maxLength} caracteres.`,
    telefono: "El teléfono no puede superar 40 caracteres.",
    correo: "El correo no puede superar 80 caracteres.",
    ubicacion: "La ubicación no puede superar 120 caracteres.",
    charlas: "Las charlas prebautismales no pueden superar 300 caracteres.",
    solicitud: "El texto de solicitud no puede superar 300 caracteres.",
  };

  return (
    mensajes[name] ?? `Este campo no puede superar ${maxLength} caracteres.`
  );
}

function esUrlHttp(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function lineas(valor: string): string[] {
  return valor
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

export function validarFormularioLanding(
  sectionKey: LandingSectionKey,
  values: Record<string, string>,
): Record<string, string> {
  const config = LANDING_SECTIONS.find((item) => item.key === sectionKey);
  if (!config) return {};

  const errores: Record<string, string> = {};

  for (const field of config.fields) {
    if (field.type === "image") continue;
    // los bloques de horarios se validan aparte (bloque 1 obligatorio, 2-4 opcionales)
    if (sectionKey === "horarios" && /^bloque\d+(Titulo|Filas)$/.test(field.name)) {
      continue;
    }
    // los opcionales vacíos no se validan
    if (field.required === false && !(values[field.name] ?? "").trim()) {
      continue;
    }

    const valor = (values[field.name] ?? "").trim();

    if (field.type === "lines") {
      const items = lineas(values[field.name] ?? "");
      if (items.length === 0) {
        errores[field.name] = mensajeRequerido(sectionKey, field.name);
        continue;
      }
      const maxLinea = field.maxLength ?? 200;
      if (items.some((item) => item.length > maxLinea)) {
        errores[field.name] = mensajeLongitud(sectionKey, field.name, maxLinea);
      }
      continue;
    }

    if (!valor) {
      errores[field.name] = mensajeRequerido(sectionKey, field.name);
      continue;
    }

    if (field.maxLength && valor.length > field.maxLength) {
      errores[field.name] = mensajeLongitud(
        sectionKey,
        field.name,
        field.maxLength,
      );
      continue;
    }

    if (field.format === "email" && !CORREO_LANDING_REGEX.test(valor)) {
      errores[field.name] = "Ingrese un correo electrónico válido.";
      continue;
    }

    if (field.format === "phone" && !TELEFONO_LANDING_REGEX.test(valor)) {
      errores[field.name] = "El teléfono no tiene un formato válido.";
      continue;
    }

    if (field.format === "youtube") {
      const embed = normalizarYoutubeEmbed(valor);
      if (!YOUTUBE_EMBED_REGEX.test(embed) || embed.length > (field.maxLength ?? 200)) {
        errores[field.name] =
          "El video debe usar el formato https://www.youtube.com/embed/...";
      }
      continue;
    }

    if (field.format === "url" && !esUrlHttp(valor)) {
      errores[field.name] =
        field.name === "mapaUrl"
          ? "La URL del mapa no es válida."
          : "La URL no es válida.";
    }
  }

  // valida los bloques de horarios (filas "Día :: hora1, hora2", bloque 1 obligatorio)
  if (sectionKey === "horarios") {
    for (let index = 1; index <= 4; index += 1) {
      const campoTitulo = `bloque${index}Titulo`;
      const campoFilas = `bloque${index}Filas`;
      const titulo = (values[campoTitulo] ?? "").trim();
      const lineas = (values[campoFilas] ?? "")
        .split("\n")
        .map((linea) => linea.trim())
        .filter(Boolean);
      const obligatorio = index === 1;
      if (!titulo && lineas.length === 0) {
        if (obligatorio) {
          errores[campoTitulo] = "El título del bloque es obligatorio.";
          errores[campoFilas] = "Cada bloque debe incluir al menos una fila.";
        }
        continue;
      }
      if (!titulo) {
        errores[campoTitulo] = "El título del bloque es obligatorio.";
      } else if (titulo.length > 80) {
        errores[campoTitulo] =
          "El título del bloque no puede superar 80 caracteres.";
      }
      if (lineas.length === 0) {
        errores[campoFilas] = "Cada bloque debe incluir al menos una fila.";
        continue;
      }
      if (lineas.length > 10) {
        errores[campoFilas] =
          "Cada bloque puede incluir máximo 10 filas.";
        continue;
      }
      for (const linea of lineas) {
        const fila = dividirFilaHorario(linea);
        if (!fila) {
          errores[campoFilas] =
            "Cada fila debe usar el formato Día :: hora1, hora2.";
          break;
        }
        if (fila.dia.length > 80) {
          errores[campoFilas] =
            "El día no puede superar 80 caracteres.";
          break;
        }
        if (fila.horas.length > 10) {
          errores[campoFilas] =
            "Cada fila puede incluir máximo 10 horas.";
          break;
        }
        if (fila.horas.some((hora) => hora.length > 120)) {
          errores[campoFilas] =
            "Cada hora no puede superar 120 caracteres.";
          break;
        }
      }
    }
  }

  // valida que haya al menos un servicio completo (el backend exige mínimo 1)
  if (sectionKey === "servicios") {
    const alguno = [1, 2, 3, 4, 5].some((i) =>
      (values[`servicio${i}Titulo`] ?? "").trim(),
    );
    if (!alguno) {
      errores.servicio1Titulo = "Incluya al menos un servicio.";
    }
    // si un servicio tiene título, debe traer descripción, categoría y botón
    for (let i = 1; i <= 5; i += 1) {
      if (!(values[`servicio${i}Titulo`] ?? "").trim()) continue;
      if (!(values[`servicio${i}Descripcion`] ?? "").trim()) {
        errores[`servicio${i}Descripcion`] =
          "La descripción del servicio es obligatoria.";
      }
      if (!(values[`servicio${i}Categoria`] ?? "").trim()) {
        errores[`servicio${i}Categoria`] =
          "La categoría del servicio es obligatoria.";
      }
      if (!(values[`servicio${i}Boton`] ?? "").trim()) {
        errores[`servicio${i}Boton`] =
          "El texto del botón es obligatorio.";
      }
    }
  }

  return errores;
}

export function mapearErroresLanding(
  errores: Record<string, string[]>,
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [clave, mensajes] of Object.entries(errores)) {
    const msg = mensajes[0];
    if (!msg) continue;

    const card = clave.match(/^cards\.(\d+)\.(titulo|texto)$/);
    if (card) {
      const indice = Number(card[1]) + 1;
      out[card[2] === "titulo" ? `card${indice}Titulo` : `card${indice}Texto`] =
        msg;
      continue;
    }

    const fila = clave.match(/^bloques\.(\d+)\.filas\.(\d+)\.(dia|horas)$/);
    if (fila) {
      out[`bloque${Number(fila[1]) + 1}Filas`] = msg;
      continue;
    }

    const bloque = clave.match(/^bloques\.(\d+)\.(titulo|items|filas)$/);
    if (bloque) {
      const indice = Number(bloque[1]) + 1;
      out[
        bloque[2] === "titulo" ? `bloque${indice}Titulo` : `bloque${indice}Filas`
      ] = msg;
      continue;
    }

    out[clave] = msg;
  }

  return out;
}
