import { useLandingSection } from "../../../hooks/useLandingSection";
import { ScrollReveal } from "../../../shared/ui";
import {
  esYoutubeEmbed,
  HISTORIA_DEFAULT,
  HISTORIA_HEADER_IMAGE,
  HISTORIA_QUOTE_IMAGE,
  HISTORIA_TITULO,
} from "../historiaContent";

function HistoriaSection() {
  const { data } = useLandingSection("historia", HISTORIA_DEFAULT);
  const headerSrc =
    typeof data.headerImageUrl === "string" && data.headerImageUrl.trim()
      ? data.headerImageUrl.trim()
      : HISTORIA_HEADER_IMAGE;
  const quoteSrc =
    typeof data.quoteImageUrl === "string" && data.quoteImageUrl.trim()
      ? data.quoteImageUrl.trim()
      : HISTORIA_QUOTE_IMAGE;
  const videoSrc = esYoutubeEmbed(data.videoUrl)
    ? data.videoUrl.trim()
    : HISTORIA_DEFAULT.videoUrl;

  return (
    <section className="w-full bg-surface">
      <div
        className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-fixed bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${headerSrc})` }}
      >
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-royal-blue/60 to-royal-blue/30" />
        <ScrollReveal className="relative z-[2]" amount={0.35}>
          <h1 className="m-0 p-5 text-center font-heading text-[clamp(36px,6vw,64px)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {HISTORIA_TITULO}
          </h1>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mx-auto max-w-[860px] px-6 py-20 max-sm:px-5 max-sm:py-[50px]" amount={0.2}>
        <span className="mb-3 block text-center text-sm font-bold uppercase tracking-[0.2em] text-royal-gold">
          {data.eyebrow}
        </span>
        <h2 className="mb-8 text-center font-heading text-[clamp(28px,4vw,42px)] leading-tight text-royal-blue">
          {data.subtitle}
        </h2>
        <div className="flex flex-col gap-5">
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            {data.origenes}
          </p>
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            {data.restauraciones}
          </p>
        </div>
      </ScrollReveal>

      <div
        className="relative flex min-h-[40vh] items-center justify-center bg-cover bg-fixed bg-center bg-no-repeat px-5"
        style={{ backgroundImage: `url(${quoteSrc})` }}
      >
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-royal-blue/60 to-royal-blue/30" />
        <ScrollReveal className="relative z-[2] max-w-[800px]" amount={0.4}>
          <p className="m-0 text-center font-heading text-[clamp(20px,3.5vw,32px)] leading-snug text-white shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
            {data.cita}
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mx-auto max-w-[860px] px-6 py-20 max-sm:px-5 max-sm:py-[50px]">
        <div className="flex flex-col gap-5">
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            {data.fachada}
          </p>
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            {data.invitacion}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-[900px] px-6 pb-[100px] pt-5">
        <div className="relative h-0 overflow-hidden rounded-xl bg-black pb-[56.25%] shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
          <iframe
            className="absolute inset-0 size-full border-0"
            src={videoSrc}
            title="Historia de la Parroquia San Blas"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </ScrollReveal>
    </section>
  );
}

export default HistoriaSection;
