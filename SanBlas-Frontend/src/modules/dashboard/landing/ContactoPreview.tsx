import { Clock, Mail, MapPin, Phone } from "lucide-react";

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
}: ContactoPreviewProps) {
  const horarios = horariosAtencion
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto bg-surface ${
        ampliadas ? "p-8" : "p-5"
      }`}
    >
      <span className="mb-2 inline-flex text-[10px] font-black tracking-[0.28em] text-royal-gold uppercase">
        {eyebrow || "Etiqueta"}
      </span>
      <h2 className="m-0 mb-3 font-heading text-2xl leading-tight text-royal-blue">
        {title || "Título"}
      </h2>
      <p className="m-0 mb-5 text-sm leading-relaxed text-text-muted">
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
                <span className="text-sm text-royal-blue">
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
                <span className="text-sm text-royal-blue">
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
                <span className="text-sm text-royal-blue">
                  {ubicacion || "Ubicación"}
                </span>
              </div>
            </li>
          </ul>

          <div className="flex items-start gap-2.5 rounded-r-xl border-l-4 border-royal-blue bg-surface-muted px-4 py-3">
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

        <div className="min-h-[180px] overflow-hidden rounded-xl border border-[#e8edf2] bg-slate-100">
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
