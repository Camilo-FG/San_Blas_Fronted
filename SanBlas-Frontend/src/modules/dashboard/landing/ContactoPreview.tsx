import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { claseResaltePreview } from "./previewResalte";

interface ContactoPreviewProps {
  eyebrow: string;
  title: string;
  intro: string;
  telefono: string;
  correo: string;
  ubicacion: string;
  horariosAtencion: string;
  mapaUrl: string;
  ampliadas?: boolean;
  campoResaltado?: string | null;
}

// miniatura de la página de contacto pa la vista previa del editor
export function ContactoPreview({
  eyebrow,
  title,
  intro,
  telefono,
  correo,
  ubicacion,
  horariosAtencion,
  mapaUrl,
  ampliadas = false,
  campoResaltado = null,
}: ContactoPreviewProps) {
  const horarios = horariosAtencion
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  return (
    <div
      data-preview-scroll
      className={`flex h-full flex-col overflow-y-auto bg-surface ${
        ampliadas ? "p-8" : "p-5"
      }`}
    >
      <span
        data-campo-preview="eyebrow"
        className={`mb-2 inline-flex text-[10px] font-black tracking-[0.28em] text-royal-gold uppercase ${claseResaltePreview(campoResaltado === "eyebrow")}`}
      >
        {eyebrow || "Etiqueta"}
      </span>
      <h2
        data-campo-preview="title"
        className={`m-0 mb-3 font-heading text-2xl leading-tight text-royal-blue ${claseResaltePreview(campoResaltado === "title")}`}
      >
        {title || "Título"}
      </h2>
      <p
        data-campo-preview="intro"
        className={`m-0 mb-5 text-sm leading-relaxed text-text-muted ${claseResaltePreview(campoResaltado === "intro")}`}
      >
        {intro || "La introducción aparecerá aquí."}
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_minmax(180px,260px)]">
        <div>
          <ul className="m-0 mb-4 flex list-none flex-col gap-3 p-0">
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-royal-gold" />
              <div>
                <span className="block text-[0.65rem] font-bold tracking-wider text-text-muted uppercase">
                  Teléfono
                </span>
                <span
                  data-campo-preview="telefono"
                  className={`text-sm text-royal-blue ${claseResaltePreview(campoResaltado === "telefono")}`}
                >
                  {telefono || "Teléfono"}
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-royal-gold" />
              <div>
                <span className="block text-[0.65rem] font-bold tracking-wider text-text-muted uppercase">
                  Correo
                </span>
                <span
                  data-campo-preview="correo"
                  className={`text-sm text-royal-blue ${claseResaltePreview(campoResaltado === "correo")}`}
                >
                  {correo || "Correo"}
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-royal-gold" />
              <div>
                <span className="block text-[0.65rem] font-bold tracking-wider text-text-muted uppercase">
                  Ubicación
                </span>
                <span
                  data-campo-preview="ubicacion"
                  className={`text-sm text-royal-blue ${claseResaltePreview(campoResaltado === "ubicacion")}`}
                >
                  {ubicacion || "Ubicación"}
                </span>
              </div>
            </li>
          </ul>

          <div
            data-campo-preview="horariosAtencion"
            className={`flex items-start gap-2.5 rounded-r-xl border-l-4 border-royal-blue bg-surface-muted px-4 py-3 ${claseResaltePreview(campoResaltado === "horariosAtencion")}`}
          >
            <Clock size={16} className="mt-0.5 shrink-0 text-royal-blue" />
            <div>
              <strong className="mb-1.5 block text-xs text-royal-blue">
                Horarios de atención
              </strong>
              <ul className="m-0 list-disc pl-4 text-xs leading-relaxed text-text-muted">
                {(horarios.length ? horarios : ["Horario de atención"]).map(
                  (item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        <div
          data-campo-preview="mapaUrl"
          className={`min-h-[180px] overflow-hidden rounded-xl border border-[#e8edf2] bg-slate-100 ${claseResaltePreview(campoResaltado === "mapaUrl")}`}
        >
          {mapaUrl.trim() ? (
            <iframe
              title="Vista previa del mapa"
              className="block size-full min-h-[180px] border-0"
              src={mapaUrl}
              loading="lazy"
            />
          ) : (
            <div className="flex size-full min-h-[180px] items-center justify-center text-xs text-text-muted">
              Mapa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactoPreview;
