import { useLandingSection } from "../../../hooks/useLandingSection";

const BAUTIZOS_DEFAULT = {
  title: "Información de Bautizos",
  intro:
    "El bautismo es el primer sacramento de la iniciación cristiana. Para bautizar en la Parroquia San Blas, por favor tome en cuenta la siguiente información.",
  requisitos: [
    "Copia de la cédula de los padres o pasaporte si son extranjeros.",
    "Copia de la cédula de los padrinos.",
    "Comprobante de las charlas de preparación al bautismo.",
    "Certificado de nacimiento del niño/a.",
  ],
  charlas:
    "Las charlas se imparten los segundos martes de cada mes de forma presencial en el salón parroquial. Es indispensable presentar el comprobante para la programación del sacramento.",
  solicitud:
    "Para solicitar o programar un bautizo, puede acercarse a la oficina parroquial con los documentos requeridos o enviarlos a través de nuestro apartado de Solicitudes de Sacramentos.",
};

function BautizosPage() {
  const { data } = useLandingSection("bautizos", BAUTIZOS_DEFAULT);

  return (
    <div className="bautizos-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "20px" }}>{data.title}</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "30px" }}>
        {data.intro}
      </p>

      <div style={{ textAlign: "left", marginTop: "20px", backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
        <h2 style={{ color: "#2980b9" }}>Requisitos para el Bautismo</h2>
        <ul style={{ lineHeight: "1.8" }}>
          {(data.requisitos ?? BAUTIZOS_DEFAULT.requisitos).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 style={{ color: "#2980b9", marginTop: "20px" }}>Charlas Bautismales</h2>
        <p>{data.charlas}</p>

        <h2 style={{ color: "#2980b9", marginTop: "20px" }}>Solicitud de Bautizo</h2>
        <p>{data.solicitud}</p>
      </div>
    </div>
  );
}

export default BautizosPage;
