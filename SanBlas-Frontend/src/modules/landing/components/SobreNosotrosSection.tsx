import { useLandingSection } from "../../../hooks/useLandingSection";

const SOBRE_NOSOTROS_IMAGE = "/sobre-nosotros.jpg";

type LandingCard = {
  icono: string;
  titulo: string;
  texto: string;
};

const SOBRE_DEFAULT = {
  eyebrow: "Sobre Nosotros",
  title: "Una parroquia que guarda la fe, la historia y la cercanía de Nicoya",
  lead:
    "La Parroquia San Blas de Nicoya es un referente espiritual y cultural de Costa Rica. Su historia, su misión pastoral y su vocación de servicio siguen acompañando a una comunidad viva, hospitalaria y profundamente creyente.",
  cards: [
    {
      icono: "01",
      titulo: "Raíz histórica",
      texto:
        "La Parroquia San Blas ha acompañado la vida espiritual de Nicoya desde sus orígenes, siendo parte esencial de la memoria religiosa y cultural de Costa Rica.",
    },
    {
      icono: "02",
      titulo: "Identidad cultural",
      texto:
        "Su presencia ha contribuido a preservar tradiciones, celebraciones y expresiones de fe que fortalecen el sentido de pertenencia de la comunidad nicoyana.",
    },
    {
      icono: "03",
      titulo: "Misión espiritual",
      texto:
        "Nuestra misión es anunciar el Evangelio, celebrar los sacramentos y sostener la fe del pueblo con una pastoral cercana, serena y comprometida.",
    },
    {
      icono: "04",
      titulo: "Servicio a la comunidad",
      texto:
        "Acompañamos a niños, jóvenes, adultos mayores y familias con catequesis, formación y espacios de servicio que buscan unir fe y vida diaria.",
    },
  ] as LandingCard[],
};

function SobreNosotrosSection() {
  const { data } = useLandingSection("sobre-nosotros", SOBRE_DEFAULT, {
    defer: true,
  });
  const cards = data.cards ?? SOBRE_DEFAULT.cards;
  const leftCards = cards.slice(0, 2);
  const rightCards = cards.slice(2, 4);

  return (
    <section className="bg-surface py-24 pb-[84px] max-md:px-5 max-md:py-[72px] max-md:pb-16" id="sobre-nosotros">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-10 min-h-[210px] max-w-[820px] text-center max-md:mb-7 max-md:text-left">
          <span className="mb-3 inline-flex text-[11px] font-black uppercase tracking-[0.32em] text-royal-gold">
            {data.eyebrow}
          </span>
          <h2 className="mb-3.5 font-heading text-[clamp(32px,4vw,52px)] leading-[1.08] text-royal-blue">
            {data.title}
          </h2>
          <p className="mx-auto max-w-[720px] text-[15px] leading-[1.75] text-text-secondary max-md:mx-0">
            {data.lead}
          </p>
        </div>

        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(160px,1fr)_minmax(420px,480px)_minmax(160px,1fr)] items-center gap-12 max-lg:grid-cols-1 max-lg:gap-7">
          <div className="flex flex-col justify-center gap-6 pt-3 max-lg:items-start max-lg:pt-0">
            {leftCards.map((destacado) => (
              <article className="max-w-[260px] max-md:max-w-none" key={destacado.titulo}>
                <div className="mb-2.5 flex size-7 items-center justify-center rounded-full border border-royal-gold/28 text-[11px] font-extrabold text-royal-gold">
                  {destacado.icono}
                </div>
                <h3 className="mb-2 text-sm leading-snug text-royal-blue">
                  {destacado.titulo}
                </h3>
                <p className="text-xs leading-[1.7] text-text-secondary">
                  {destacado.texto}
                </p>
              </article>
            ))}
          </div>

          <div className="relative flex items-center justify-center before:absolute before:inset-x-3.5 before:inset-y-6 before:-z-0 before:rounded-[34px] before:bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),rgba(255,255,255,0)_68%)] before:blur-lg max-lg:before:inset-x-2.5 max-lg:before:inset-y-[18px] max-md:before:inset-x-2 max-md:before:inset-y-3">
            <div className="relative z-[1] h-[480px] w-full max-w-[420px] overflow-hidden rounded-md shadow-[0_32px_64px_rgba(23,37,84,0.18),0_10px_24px_rgba(23,37,84,0.08)] max-lg:max-w-[320px] max-lg:min-h-[380px] max-md:max-w-[280px] max-md:min-h-[320px]">
              <img
                src={SOBRE_NOSOTROS_IMAGE}
                alt="Vista central de la Parroquia San Blas de Nicoya"
                className="absolute inset-0 block size-full object-cover object-center brightness-[0.7] saturate-[1.05]"
                width={420}
                height={480}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6 pt-3 max-lg:items-start max-lg:pt-0">
            {rightCards.map((destacado) => (
              <article className="ml-auto max-w-[260px] max-lg:ml-0 max-md:max-w-none" key={destacado.titulo}>
                <div className="mb-2.5 flex size-7 items-center justify-center rounded-full border border-royal-gold/28 text-[11px] font-extrabold text-royal-gold">
                  {destacado.icono}
                </div>
                <h3 className="mb-2 text-sm leading-snug text-royal-blue">
                  {destacado.titulo}
                </h3>
                <p className="text-xs leading-[1.7] text-text-secondary">
                  {destacado.texto}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SobreNosotrosSection;
