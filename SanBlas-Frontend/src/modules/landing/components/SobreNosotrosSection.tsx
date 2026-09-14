import { useLandingSection } from "../../../hooks/useLandingSection";
import { SOBRE_NOSOTROS_DEFAULT, SOBRE_NOSOTROS_IMAGE } from "../sobreNosotrosContent";
import { ScrollReveal } from "../../../shared/ui";

function SobreNosotrosSection() {
  const { data } = useLandingSection("sobre-nosotros", SOBRE_NOSOTROS_DEFAULT, {
    defer: true,
  });
  const cards = data.cards ?? SOBRE_NOSOTROS_DEFAULT.cards;
  const leftCards = cards.slice(0, 2);
  const rightCards = cards.slice(2, 4);
  const imageSrc =
    typeof data.imageUrl === "string" && data.imageUrl.trim()
      ? data.imageUrl.trim()
      : SOBRE_NOSOTROS_IMAGE;

  return (
    <section className="bg-surface py-28 pb-24 max-md:px-5 max-md:py-20" id="sobre-nosotros">
      <div className="mx-auto max-w-[1280px] px-6 max-sm:px-4">
        <ScrollReveal className="mx-auto mb-14 max-w-[920px] text-center max-md:mb-10 max-md:text-left" amount={0.35}>
          <span className="mb-4 inline-flex text-xs font-black uppercase tracking-[0.28em] text-royal-gold md:text-sm">
            {data.eyebrow}
          </span>
          <h2 className="mb-5 font-heading text-[clamp(36px,5vw,58px)] leading-[1.12] text-royal-blue">
            {data.title}
          </h2>
          <p className="mx-auto max-w-[780px] text-base leading-[1.8] text-text-secondary md:text-lg md:leading-[1.85] max-md:mx-0">
            {data.lead}
          </p>
        </ScrollReveal>

        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(240px,1fr)_minmax(380px,460px)_minmax(240px,1fr)] items-center gap-x-10 gap-y-12 max-lg:grid-cols-1 max-lg:gap-8">
          <div className="flex flex-col justify-center gap-10 pt-2 max-lg:items-start max-lg:gap-8 max-lg:pt-0">
            {leftCards.map((destacado, indice) => (
              <ScrollReveal key={destacado.titulo} delay={indice * 0.08}>
              <article className="max-w-[380px] max-lg:max-w-none">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-royal-gold/35 text-sm font-extrabold text-royal-gold">
                  {destacado.icono}
                </div>
                <h3 className="mb-2.5 font-heading text-xl leading-snug text-royal-blue md:text-[22px]">
                  {destacado.titulo}
                </h3>
                <p className="text-[15px] leading-[1.75] text-text-secondary md:text-base md:leading-[1.8]">
                  {destacado.texto}
                </p>
              </article>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="relative flex items-center justify-center before:absolute before:inset-x-3.5 before:inset-y-6 before:-z-0 before:rounded-[34px] before:bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),rgba(255,255,255,0)_68%)] before:blur-lg max-lg:before:inset-x-2.5 max-lg:before:inset-y-[18px] max-md:before:inset-x-2 max-md:before:inset-y-3" delay={0.08}>
            <div className="relative z-[1] h-[520px] w-full max-w-[460px] overflow-hidden rounded-md shadow-[0_32px_64px_rgba(23,37,84,0.18),0_10px_24px_rgba(23,37,84,0.08)] max-lg:max-w-[380px] max-lg:min-h-[420px] max-md:max-w-[320px] max-md:min-h-[360px]">
              <img
                src={imageSrc}
                alt="Vista central de la Parroquia San Blas de Nicoya"
                className="absolute inset-0 block size-full object-cover object-center brightness-[0.7] saturate-[1.05]"
                width={460}
                height={520}
                loading="lazy"
                decoding="async"
              />
            </div>
          </ScrollReveal>

          <div className="flex flex-col justify-center gap-10 pt-2 max-lg:items-start max-lg:gap-8 max-lg:pt-0">
            {rightCards.map((destacado, indice) => (
              <ScrollReveal key={destacado.titulo} delay={indice * 0.08}>
              <article className="ml-auto max-w-[380px] max-lg:ml-0 max-lg:max-w-none">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-royal-gold/35 text-sm font-extrabold text-royal-gold">
                  {destacado.icono}
                </div>
                <h3 className="mb-2.5 font-heading text-xl leading-snug text-royal-blue md:text-[22px]">
                  {destacado.titulo}
                </h3>
                <p className="text-[15px] leading-[1.75] text-text-secondary md:text-base md:leading-[1.8]">
                  {destacado.texto}
                </p>
              </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SobreNosotrosSection;
