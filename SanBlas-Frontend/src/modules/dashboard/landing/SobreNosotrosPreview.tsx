import {
  SOBRE_NOSOTROS_IMAGE,
  type SobreNosotrosCard,
} from "../../landing/sobreNosotrosContent";
import { ScaledStage } from "./ScaledStage";

const SOBRE_FRAME = { width: 1280, height: 980 };

type SobreNosotrosPreviewProps = {
  eyebrow: string;
  title: string;
  lead: string;
  cards: SobreNosotrosCard[];
  imageSrc?: string | null;
  ampliadas?: boolean;
};

function PreviewCard({
  card,
  alignEnd = false,
}: {
  card: SobreNosotrosCard;
  alignEnd?: boolean;
}) {
  return (
    <article className={alignEnd ? "ml-auto max-w-[380px]" : "max-w-[380px]"}>
      <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-royal-gold/35 text-sm font-extrabold text-royal-gold">
        {card.icono || "00"}
      </div>
      <h3 className="mb-2.5 font-heading text-xl leading-snug text-royal-blue md:text-[22px]">
        {card.titulo || "Título de la tarjeta"}
      </h3>
      <p className="text-[15px] leading-[1.75] text-text-secondary md:text-base md:leading-[1.8]">
        {card.texto || "El texto de la tarjeta aparecerá aquí."}
      </p>
    </article>
  );
}

export function SobreNosotrosPreview({
  eyebrow,
  title,
  lead,
  cards,
  imageSrc,
  ampliadas = false,
}: SobreNosotrosPreviewProps) {
  const visibles = [0, 1, 2, 3].map(
    (index) => cards[index] ?? { icono: "", titulo: "", texto: "" },
  );
  const leftCards = visibles.slice(0, 2);
  const rightCards = visibles.slice(2, 4);
  const image = imageSrc?.trim() || SOBRE_NOSOTROS_IMAGE;

  const escena = (
    <section className="flex h-full w-full flex-col justify-center bg-surface px-6 py-16">
      <div className="mx-auto mb-14 max-w-[920px] text-center">
        <span className="mb-4 inline-flex text-xs font-black uppercase tracking-[0.28em] text-royal-gold md:text-sm">
          {eyebrow || "Etiqueta"}
        </span>
        <h2 className="mb-5 font-heading text-[58px] leading-[1.12] text-royal-blue">
          {title || "Título de la sección"}
        </h2>
        <p className="mx-auto max-w-[780px] text-base leading-[1.8] text-text-secondary md:text-lg md:leading-[1.85]">
          {lead || "La descripción aparecerá aquí."}
        </p>
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(240px,1fr)_minmax(380px,460px)_minmax(240px,1fr)] items-center gap-x-10 gap-y-12">
        <div className="flex flex-col justify-center gap-10 pt-2">
          {leftCards.map((card, index) => (
            <PreviewCard key={`left-${index}`} card={card} />
          ))}
        </div>

        <div className="relative z-[1] mx-auto h-[560px] w-full max-w-[500px] overflow-hidden rounded-md shadow-[0_32px_64px_rgba(23,37,84,0.18),0_10px_24px_rgba(23,37,84,0.08)]">
          <img
            src={image}
            alt=""
            className="absolute inset-0 block size-full object-cover object-center brightness-[0.7] saturate-[1.05]"
          />
        </div>

        <div className="flex flex-col justify-center gap-10 pt-2">
          {rightCards.map((card, index) => (
            <PreviewCard key={`right-${index}`} card={card} alignEnd />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <ScaledStage
      width={SOBRE_FRAME.width}
      height={SOBRE_FRAME.height}
      className={ampliadas ? "min-h-[68vh] bg-surface" : "h-full bg-surface"}
    >
      {escena}
    </ScaledStage>
  );
}

export default SobreNosotrosPreview;
