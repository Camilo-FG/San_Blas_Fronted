import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useLandingSection } from "../../../hooks/useLandingSection";
import { CONTACTO_DEFAULT } from "../constants/contactoDefaults";
import "./ContactoPage.css";

function ContactoPage() {
  const { data } = useLandingSection("contacto", CONTACTO_DEFAULT);
  const horarios = data.horariosAtencion ?? CONTACTO_DEFAULT.horariosAtencion;

  return (
    <section className="contacto-page">
      <div className="contacto-page__container">
        <span className="contacto-page__eyebrow">
          {data.eyebrow ?? CONTACTO_DEFAULT.eyebrow}
        </span>
        <h1>{data.title}</h1>
        <p className="contacto-page__intro">{data.intro}</p>

        <div className="contacto-page__grid">
          <div className="contacto-page__info">
            <ul className="contacto-page__details">
              <li>
                <Phone size={18} aria-hidden="true" />
                <div>
                  <span>Teléfono</span>
                  <a href={`tel:${data.telefono.replace(/\s/g, "")}`}>
                    {data.telefono}
                  </a>
                </div>
              </li>
              <li>
                <Mail size={18} aria-hidden="true" />
                <div>
                  <span>Correo</span>
                  <a href={`mailto:${data.correo}`}>{data.correo}</a>
                </div>
              </li>
              <li>
                <MapPin size={18} aria-hidden="true" />
                <div>
                  <span>Ubicación</span>
                  <p>{data.ubicacion}</p>
                </div>
              </li>
            </ul>

            <div className="contacto-page__callout">
              <Clock size={18} aria-hidden="true" />
              <div>
                <strong>Horarios de atención</strong>
                <ul>
                  {horarios.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="contacto-page__map-wrap">
            <iframe
              title="Mapa de Parroquia San Blas Nicoya"
              className="contacto-page__map"
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
