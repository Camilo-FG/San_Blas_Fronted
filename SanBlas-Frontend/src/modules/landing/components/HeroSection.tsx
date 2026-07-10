import { Link } from "@tanstack/react-router";
import { useState } from "react";
import Rutas from "../../../routes/Rutas";
import { useLandingSection } from "../../../hooks/useLandingSection";

const HERO_IMAGE = "/hero.webp";

const HERO_DEFAULT = {
  subtitle: "Desde 1544",
  title: "Firme en la",
  titleHighlight: "Fe y Tradición",
  description:
    "Ubicada en el corazón de Nicoya, la Parroquia San Blas es testimonio vivo de nuestra historia y esperanza cristiana.",
};

const heroButtonClass =
  "inline-flex items-center justify-center rounded-[10px] px-8 py-4 text-sm font-black uppercase tracking-[1.8px] no-underline transition-all hover:-translate-y-0.5 max-md:w-full max-md:px-[22px] max-md:py-[15px] max-md:text-[13px] max-md:tracking-[1.5px]";

function HeroSection() {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const { data } = useLandingSection("hero", HERO_DEFAULT, { defer: true });
  const heroImage =
    typeof data.imageUrl === "string" && data.imageUrl.trim()
      ? data.imageUrl.trim()
      : HERO_IMAGE;

  return (
    <section
      className="relative isolate flex min-h-screen items-center overflow-hidden px-[8%] max-[900px]:min-h-[90vh] max-[900px]:px-8 max-[900px]:pb-[72px] max-[900px]:pt-[120px] max-md:min-h-[86vh] max-md:px-6 max-md:pb-14 max-md:pt-[110px] max-sm:min-h-[82vh] max-sm:px-[18px] max-sm:pb-12 max-sm:pt-24"
      id="inicio"
    >
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-center max-md:object-top"
        fetchPriority="high"
        decoding="async"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-royal-blue/88 via-royal-blue/68 to-royal-blue/22 max-[900px]:from-royal-blue/92 max-[900px]:via-royal-blue/78 max-[900px]:to-royal-blue/45" />

      <div className="relative z-[2] mx-auto w-full max-w-[1200px]">
        <div className="mb-6 flex items-center gap-3.5 text-[13px] font-black uppercase tracking-[4px] text-royal-gold max-md:mb-[18px] max-md:text-[11px] max-md:tracking-[3px] max-sm:gap-2.5 max-sm:text-[10px] max-sm:tracking-[2.4px]">
          <span className="h-0.5 w-[54px] shrink-0 bg-royal-gold max-md:w-[38px]" />
          <span>{data.subtitle}</span>
        </div>

        <h1 className="mb-[30px] max-w-[850px] font-heading text-[clamp(46px,8vw,92px)] font-extrabold leading-[0.95] text-white max-md:mb-6 max-md:text-[clamp(42px,13vw,62px)] max-md:leading-none max-sm:text-[clamp(38px,15vw,52px)]">
          {data.title} <br />
          <span className="italic text-royal-gold">{data.titleHighlight}</span>
        </h1>

        <p className="mb-[42px] max-w-[620px] border-l-4 border-royal-gold/65 pl-[22px] text-xl leading-[1.7] text-white/90 max-[900px]:max-w-[560px] max-[900px]:text-lg max-md:mb-[34px] max-md:pl-4 max-md:text-base max-md:leading-[1.65] max-sm:text-[15px] max-sm:leading-[1.6]">
          {data.description}
        </p>

        <div className="flex flex-wrap gap-[18px] max-md:flex-col max-md:items-stretch max-md:gap-3.5">
          <Link
            to={Rutas.contacto}
            className={`${heroButtonClass} bg-royal-gold text-royal-blue shadow-[0_18px_35px_rgba(0,0,0,0.25)] hover:bg-white`}
          >
            Contactos
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setDropdownAbierto(true)}
            onMouseLeave={() => setDropdownAbierto(false)}
          >
            <button
              className={`${heroButtonClass} flex h-full cursor-pointer items-center gap-2 border border-white/28 bg-white/12 text-white backdrop-blur-sm hover:bg-white/22`}
              type="button"
            >
              Trámites
              <span>{dropdownAbierto ? "▴" : "▾"}</span>
            </button>

            {dropdownAbierto && (
              <div className="absolute left-0 top-full z-10 flex min-w-[220px] flex-col rounded-lg bg-surface py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <Link
                  to={Rutas.FormsolicitudesCatequesis}
                  className="block px-5 py-2.5 font-medium text-text no-underline transition-colors hover:bg-royal-blue/10 hover:text-royal-blue"
                >
                  Catequesis
                </Link>
                <Link
                  to={Rutas.SolicitudesSacramentos}
                  className="block px-5 py-2.5 font-medium text-text no-underline transition-colors hover:bg-royal-blue/10 hover:text-royal-blue"
                >
                  Solicitudes de Sacramentos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
