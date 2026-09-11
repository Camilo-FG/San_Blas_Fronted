const HERO_DEFAULT_IMAGE = "/hero.webp";

type HeroPreviewProps = {
  subtitle: string;
  title: string;
  titleHighlight: string;
  description: string;
  imageSrc?: string | null;
  ampliadas?: boolean;
};

export function HeroPreview({
  subtitle,
  title,
  titleHighlight,
  description,
  imageSrc,
  ampliadas = false,
}: HeroPreviewProps) {
  const image = imageSrc?.trim() || HERO_DEFAULT_IMAGE;

  return (
    <div className="@container relative isolate flex h-full min-h-0 w-full items-center overflow-hidden px-[6%] py-6">
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-royal-blue/88 via-royal-blue/68 to-royal-blue/22" />

      <div className="relative z-[2] w-full max-w-[1200px]">
        <div className="mb-3 flex items-center gap-2.5 font-black uppercase tracking-[0.28em] text-royal-gold @min-[420px]:mb-5 @min-[420px]:gap-3.5 @min-[420px]:text-[13px] @min-[420px]:tracking-[4px]">
          <span className="h-0.5 w-8 shrink-0 bg-royal-gold @min-[420px]:w-[54px]" />
          <span className="text-[10px] @min-[420px]:text-[13px]">
            {subtitle || "Encabezado"}
          </span>
        </div>

        <h2
          className={`m-0 mb-3 max-w-[850px] font-heading font-extrabold leading-[0.95] text-white @min-[420px]:mb-[30px] ${
            ampliadas
              ? "text-[clamp(36px,6vw,72px)]"
              : "text-[clamp(26px,7cqi,64px)]"
          }`}
        >
          {title || "Título"} <br />
          <span className="italic text-royal-gold">
            {titleHighlight || "Título destacado"}
          </span>
        </h2>

        <p
          className={`m-0 mb-4 max-w-[620px] border-l-4 border-royal-gold/65 pl-3 leading-relaxed text-white/90 @min-[420px]:mb-[42px] @min-[420px]:pl-[22px] ${
            ampliadas ? "text-lg" : "text-[clamp(12px,2cqi,18px)]"
          }`}
        >
          {description || "La descripción aparecerá aquí."}
        </p>

        <div className="flex flex-wrap gap-2.5 @min-[420px]:gap-[18px]">
          <span className="inline-flex items-center justify-center rounded-[10px] bg-royal-gold px-4 py-2 text-[10px] font-black uppercase tracking-[1.8px] text-royal-blue shadow-[0_18px_35px_rgba(0,0,0,0.25)] @min-[420px]:px-8 @min-[420px]:py-4 @min-[420px]:text-sm">
            Contactos
          </span>
          <span className="inline-flex items-center justify-center rounded-[10px] border border-white/28 bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[1.8px] text-white @min-[420px]:px-8 @min-[420px]:py-4 @min-[420px]:text-sm">
            Trámites
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeroPreview;
