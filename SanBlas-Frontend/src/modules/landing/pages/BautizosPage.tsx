import SeoHead from "../../../seo/SeoHead";
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
  const { data, isSettled } = useLandingSection("bautizos", BAUTIZOS_DEFAULT);

  return (
    <>
      <SeoHead page="/bautizos" contentReady={isSettled} />
      <main className="mx-auto max-w-[800px] px-6 py-10 text-center sm:px-10 sm:py-14">
        <h1 className="mb-5 font-heading text-[clamp(1.85rem,4vw,2.5rem)] text-royal-blue">
          {data.title}
        </h1>
        <p className="mb-8 text-base leading-relaxed text-text-muted sm:text-lg">
          {data.intro}
        </p>

        <article className="rounded-2xl border border-border bg-surface-muted p-6 text-left sm:p-8">
          <h2 className="mb-3 text-lg font-bold text-royal-blue">
            Requisitos para el bautismo
          </h2>
          <ul className="mb-6 list-disc space-y-1 pl-5 text-text-secondary leading-relaxed">
            {(data.requisitos ?? BAUTIZOS_DEFAULT.requisitos).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mb-3 text-lg font-bold text-royal-blue">
            Charlas bautismales
          </h2>
          <p className="mb-6 text-text-secondary leading-relaxed">{data.charlas}</p>

          <h2 className="mb-3 text-lg font-bold text-royal-blue">
            Solicitud de bautizo
          </h2>
          <p className="m-0 text-text-secondary leading-relaxed">{data.solicitud}</p>
        </article>
      </main>
    </>
  );
}

export default BautizosPage;
