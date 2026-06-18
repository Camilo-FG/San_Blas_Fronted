import { useLandingSection } from "../../../hooks/useLandingSection";

const CONTACTO_DEFAULT = {
  title: "Contacto",
  intro:
    "Póngase en contacto con la Parroquia San Blas para consultas, dudas o información adicional.",
  telefono: "+506 0000-0000",
  correo: "parroquiasanblas@gmail.com",
  ubicacion: "Nicoya, Guanacaste, Costa Rica",
  horariosAtencion: [
    "Lunes a Viernes: 8:00 a.m. a 12:00 m.d. y 1:30 p.m. a 5:00 p.m.",
    "Sábados: 8:00 a.m. a 12:00 m.d.",
  ],
  mapaUrl:
    "https://maps.google.com/maps?q=Parroquia%20San%20Blas,%20Nicoya,%20Guanacaste&t=&z=16&ie=UTF8&iwloc=&output=embed",
};

function ContactoPage() {
  const { data } = useLandingSection("contacto", CONTACTO_DEFAULT);

  return (
    <div className="contacto-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "20px" }}>{data.title}</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "30px" }}>
        {data.intro}
      </p>

      <div style={{ textAlign: "left", marginTop: "20px", backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
        <h2 style={{ color: "#2980b9" }}>Información de Contacto</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li><strong>Teléfono:</strong> {data.telefono}</li>
          <li><strong>Correo Electrónico:</strong> {data.correo}</li>
          <li><strong>Ubicación:</strong> {data.ubicacion}</li>
        </ul>

        <h2 style={{ color: "#2980b9", marginTop: "20px" }}>Horarios de Atención</h2>
        <ul style={{ lineHeight: "1.8" }}>
          {(data.horariosAtencion ?? CONTACTO_DEFAULT.horariosAtencion).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 style={{ color: "#2980b9", marginTop: "20px" }}>Ubicación en el Mapa</h2>
        <div style={{ marginTop: "15px" }}>
          <iframe
            title="Mapa de Parroquia San Blas Nicoya"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: "8px" }}
            src={data.mapaUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

export default ContactoPage;
