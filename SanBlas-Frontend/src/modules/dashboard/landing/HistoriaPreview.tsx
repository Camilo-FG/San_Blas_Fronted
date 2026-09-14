import {
  esYoutubeEmbed,
  HISTORIA_HEADER_IMAGE,
  HISTORIA_QUOTE_IMAGE,
  HISTORIA_TITULO,
} from "../../landing/historiaContent";
import { ScaledStage } from "./ScaledStage";

const HISTORIA_FRAME = { width: 1280, height: 2100 };

type HistoriaPreviewProps = {
  eyebrow: string;
  subtitle: string;
  origenes: string;
  restauraciones: string;
  cita: string;
  fachada: string;
  invitacion: string;
  videoUrl: string;
  headerImageSrc?: string | null;
  quoteImageSrc?: string | null;
  ampliadas?: boolean;
};

export function HistoriaPreview({
  eyebrow,
  subtitle,
  origenes,
  restauraciones,
  cita,
  fachada,
  invitacion,
  videoUrl,
  headerImageSrc,
  quoteImageSrc,
  ampliadas = false,
}: HistoriaPreviewProps) {
  const headerSrc = headerImageSrc?.trim() || HISTORIA_HEADER_IMAGE;
  const quoteSrc = quoteImageSrc?.trim() || HISTORIA_QUOTE_IMAGE;
  const videoSrc = esYoutubeEmbed(videoUrl) ? videoUrl.trim() : "";

  const escena = (
    <section className="w-full bg-surface">
      <div
        className="relative flex min-h-[520px] items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${headerSrc})` }}
      >
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-royal-blue/60 to-royal-blue/30" />
        <h1 className="relative z-[2] m-0 p-5 text-center font-heading text-[64px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          {HISTORIA_TITULO}
        </h1>
      </div>

      <div className="mx-auto max-w-[860px] px-6 py-20">
        <span className="mb-3 block text-center text-sm font-bold uppercase tracking-[0.2em] text-royal-gold">
          {eyebrow || "Etiqueta"}
        </span>
        <h2 className="mb-8 text-center font-heading text-[42px] leading-tight text-royal-blue">
          {subtitle || "Subtítulo"}
        </h2>
        <div className="flex flex-col gap-5">
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary">
            {origenes || "El párrafo de orígenes aparecerá aquí."}
          </p>
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary">
            {restauraciones || "El párrafo de restauraciones aparecerá aquí."}
          </p>
        </div>
      </div>

      <div
        className="relative flex min-h-[360px] items-center justify-center bg-cover bg-center bg-no-repeat px-5"
        style={{ backgroundImage: `url(${quoteSrc})` }}
      >
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-royal-blue/60 to-royal-blue/30" />
        <p className="relative z-[2] m-0 max-w-[800px] text-center font-heading text-[32px] leading-snug text-white shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
          {cita || "La cita espiritual aparecerá aquí."}
        </p>
      </div>

      <div className="mx-auto max-w-[860px] px-6 py-20">
        <div className="flex flex-col gap-5">
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary">
            {fachada || "El párrafo de la fachada aparecerá aquí."}
          </p>
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary">
            {invitacion || "El párrafo de invitación aparecerá aquí."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 pb-16 pt-5">
        <div className="relative h-0 overflow-hidden rounded-xl bg-black pb-[56.25%] shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
          {videoSrc ? (
            <iframe
              className="absolute inset-0 size-full border-0"
              src={videoSrc}
              title="Vista previa del video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-semibold text-white/80">
              El video aparecerá aquí con un enlace embed de YouTube válido.
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <ScaledStage
      width={HISTORIA_FRAME.width}
      height={HISTORIA_FRAME.height}
      className={ampliadas ? "min-h-[68vh] bg-surface" : "h-full bg-surface"}
    >
      {escena}
    </ScaledStage>
  );
}

export default HistoriaPreview;
