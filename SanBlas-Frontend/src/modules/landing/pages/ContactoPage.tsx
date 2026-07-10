import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useLandingSection } from "../../../hooks/useLandingSection";
import { CONTACTO_DEFAULT } from "../constants/contactoDefaults";

function ContactoPage() {
  const { data } = useLandingSection("contacto", CONTACTO_DEFAULT);
  const horarios = data.horariosAtencion ?? CONTACTO_DEFAULT.horariosAtencion;

  return (
    <section className="bg-surface px-[8%] pb-20 pt-12 max-[960px]:px-8 max-[960px]:pb-16 max-[960px]:pt-10 max-sm:px-[18px] max-sm:pb-14 max-sm:pt-8">
      <div className="mx-auto max-w-[1200px]">
        <span className="mb-3.5 inline-flex text-[11px] font-black uppercase tracking-[0.32em] text-royal-gold">
          {data.eyebrow ?? CONTACTO_DEFAULT.eyebrow}
        </span>
        <h1 className="mb-[18px] font-heading text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] text-royal-blue">
          {data.title}
        </h1>
        <p className="mb-8 max-w-[720px] text-base leading-[1.75] text-text-muted">
          {data.intro}
        </p>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,480px)] items-start gap-12 max-[960px]:grid-cols-1 max-[960px]:gap-8">
          <div>
            <ul className="m-0 mb-6 flex list-none flex-col gap-[18px] p-0">
              <li className="flex items-start gap-3.5">
                <Phone size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-royal-gold" />
                <div>
                  <span className="mb-0.5 block text-[0.78rem] font-bold uppercase tracking-wider text-text-muted">
                    Teléfono
                  </span>
                  <a
                    href={`tel:${data.telefono.replace(/\s/g, "")}`}
                    className="text-[0.98rem] leading-normal text-royal-blue no-underline hover:text-royal-gold"
                  >
                    {data.telefono}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <Mail size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-royal-gold" />
                <div>
                  <span className="mb-0.5 block text-[0.78rem] font-bold uppercase tracking-wider text-text-muted">
                    Correo
                  </span>
                  <a
                    href={`mailto:${data.correo}`}
                    className="text-[0.98rem] leading-normal text-royal-blue no-underline hover:text-royal-gold"
                  >
                    {data.correo}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-royal-gold" />
                <div>
                  <span className="mb-0.5 block text-[0.78rem] font-bold uppercase tracking-wider text-text-muted">
                    Ubicación
                  </span>
                  <p className="m-0 text-[0.98rem] leading-normal text-royal-blue">
                    {data.ubicacion}
                  </p>
                </div>
              </li>
            </ul>

            <div className="flex max-w-[620px] items-start gap-3.5 rounded-r-xl border-l-4 border-royal-blue bg-surface-muted px-5 py-[18px]">
              <Clock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-royal-blue" />
              <div>
                <strong className="mb-2 block text-[0.92rem] text-royal-blue">
                  Horarios de atención
                </strong>
                <ul className="m-0 list-disc pl-[18px] text-[0.92rem] leading-[1.65] text-text-muted">
                  {horarios.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="min-h-[420px] w-full overflow-hidden rounded-[18px] border border-[#e8edf2] bg-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)] max-[960px]:min-h-[320px] max-sm:min-h-[280px]">
            <iframe
              title="Mapa de Parroquia San Blas Nicoya"
              className="block size-full min-h-[420px] border-0 max-[960px]:min-h-[320px] max-sm:min-h-[280px]"
              src={data.mapaUrl}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactoPage;
