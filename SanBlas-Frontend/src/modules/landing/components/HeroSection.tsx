import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, ChevronDown, FileText } from "lucide-react";
import Rutas from "../../../routes/Rutas";
import { useLandingSection } from "../../../hooks/useLandingSection";
import { ScrollReveal } from "../../../shared/ui";

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
  const [dropdownAlLado, setDropdownAlLado] = useState(false);
  const botonTramitesRef = useRef<HTMLButtonElement>(null);
  const dropdownTramitesRef = useRef<HTMLDivElement>(null);
  const reducirMovimiento = useReducedMotion();
  const { data } = useLandingSection("hero", HERO_DEFAULT, { defer: true });
  const heroImage =
    typeof data.imageUrl === "string" && data.imageUrl.trim()
      ? data.imageUrl.trim()
      : HERO_IMAGE;

  // Si no cabe debajo del botón, ponemos el menú al costado para que no quede cortado por el borde inferior.
  useLayoutEffect(() => {
    if (!dropdownAbierto) {
      setDropdownAlLado(false);
      return;
    }

    const ajustarUbicacion = () => {
      const boton = botonTramitesRef.current;
      const dropdown = dropdownTramitesRef.current;
      if (!boton || !dropdown) return;

      const botonRect = boton.getBoundingClientRect();
      const alturaDropdown = dropdown.getBoundingClientRect().height;
      const anchoDropdown = dropdown.getBoundingClientRect().width;
      const espacioDebajo = window.innerHeight - botonRect.bottom;
      const quedaCortadoAbajo = espacioDebajo < alturaDropdown + 12;
      const cabeALaDerecha = window.innerWidth - botonRect.right >= anchoDropdown + 12;

      // En pantallas estrechas se abre hacia el lado con espacio disponible, evitando que se salga del viewport.
      setDropdownAlLado(quedaCortadoAbajo && cabeALaDerecha);
    };

    ajustarUbicacion();
    window.addEventListener("resize", ajustarUbicacion);
    window.addEventListener("scroll", ajustarUbicacion, true);

    return () => {
      window.removeEventListener("resize", ajustarUbicacion);
      window.removeEventListener("scroll", ajustarUbicacion, true);
    };
  }, [dropdownAbierto]);

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

      <ScrollReveal className="relative z-[2] mx-auto w-full max-w-[1200px]" amount={0.25}>
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
              ref={botonTramitesRef}
              className={`${heroButtonClass} flex h-full cursor-pointer items-center gap-2.5 border border-white/28 bg-white/12 text-white backdrop-blur-sm hover:bg-white/22`}
              type="button"
              onClick={() => setDropdownAbierto((abierto) => !abierto)}
              aria-expanded={dropdownAbierto}
              aria-haspopup="true"
            >
              <span>Trámites</span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                aria-hidden="true"
                className={`transition-transform duration-200 ${
                  dropdownAbierto && dropdownAlLado ? "-rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownAbierto && (
                <motion.div
                  key={dropdownAlLado ? "tramites-lateral" : "tramites-abajo"}
                  ref={dropdownTramitesRef}
                  initial={{
                    opacity: 0,
                    y: reducirMovimiento || dropdownAlLado ? 0 : -8,
                    x: reducirMovimiento || !dropdownAlLado ? 0 : -8,
                  }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, y: reducirMovimiento || dropdownAlLado ? 0 : -5 }}
                  transition={{ duration: reducirMovimiento ? 0.12 : 0.2, ease: "easeOut" }}
                  className={`absolute z-10 w-[min(300px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#d9a928]/25 bg-[#fffdf8] text-[#16243c] shadow-[0_20px_50px_rgba(3,20,43,0.28)] ring-1 ring-black/5 ${
                    dropdownAlLado
                      ? "left-[calc(100%+0.75rem)] bottom-0"
                      : "top-[calc(100%+0.75rem)] left-0"
                  }`}
                >
                  <div className="flex flex-col gap-1 p-2">
                    <Link
                      to={Rutas.FormsolicitudesCatequesis}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#16243c] no-underline transition-colors hover:bg-[#003366]/[0.06] focus-visible:bg-[#003366]/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9a7220]"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#003366]/[0.07] text-[#003366] transition-colors group-hover:bg-[#003366] group-hover:text-white">
                        <BookOpen size={17} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">Catequesis</span>
                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className="-rotate-90 shrink-0 text-[#9a7220] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                    <Link
                      to={Rutas.SolicitudesSacramentos}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#16243c] no-underline transition-colors hover:bg-[#003366]/[0.06] focus-visible:bg-[#003366]/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9a7220]"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#9a7220]/[0.10] text-[#8a6417] transition-colors group-hover:bg-[#9a7220] group-hover:text-white">
                        <FileText size={17} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">Solicitudes de Sacramentos</span>
                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className="-rotate-90 shrink-0 text-[#9a7220] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

export default HeroSection;
