import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CATEQUESIS_ANTES_DE_INSCRIBIR,
  CATEQUESIS_INTRO,
  CATEQUESIS_NIVELES_INFANTILES,
  CATEQUESIS_NIVELES_JUVENILES,
  MONTO_INSCRIPCION_CATEQUESIS,
  TELEFONO_COMPROBANTE_CATEQUESIS,
} from "../constants/catequesisInformacion";
import { useLandingSection } from "../../../hooks/useLandingSection";

function SeccionDesplegable({
  titulo,
  children,
  className,
}: {
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  const [abierta, setAbierta] = useState(false);
  const reducirMovimiento = useReducedMotion();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={abierta}
        onClick={() => setAbierta((valor) => !valor)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 bg-transparent p-0 text-left"
      >
        <h2 className="m-0 font-heading text-lg font-extrabold text-royal-blue sm:text-xl">
          {titulo}
        </h2>
        <ChevronDown
          size={20}
          aria-hidden
          className={`shrink-0 text-royal-blue transition-transform duration-300 ease-out ${
            abierta ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: abierta ? "auto" : 0,
          opacity: abierta ? 1 : 0,
        }}
        transition={
          reducirMovimiento
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        }
        className="overflow-hidden"
      >
        <div className="pt-4">{children}</div>
      </motion.div>
    </div>
  );
}

const CatequesisInfoSection = () => {
  const { data: landingCatequesis } = useLandingSection("catequesis", {
    sinpe: "8878-3025",
  });

  return (
    <section
      className="mx-auto mt-6 max-w-[1100px] rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:mt-10 sm:rounded-[22px] sm:p-7"
      aria-labelledby="catequesis-info-title"
    >
      <header className="mb-6 border-b border-royal-gold/35 pb-5">
        <p className="mb-2 font-heading text-[clamp(24px,3vw,30px)] leading-tight font-extrabold text-royal-gold-muted uppercase">
          Información para familias
        </p>
        <h1
          id="catequesis-info-title"
          className="font-heading text-[clamp(24px,3vw,30px)] leading-tight font-extrabold text-royal-blue"
        >
          {CATEQUESIS_INTRO.titulo}
        </h1>
        <p className="mt-3.5 text-base leading-[1.75] text-gray-600">
          {CATEQUESIS_INTRO.descripcion}
        </p>
        <p className="mt-3 rounded-[14px] border border-royal-gold/40 bg-royal-gold/10 p-3.5 text-[15px] leading-[1.75] text-gray-600">
          {CATEQUESIS_INTRO.notaCenacat}
        </p>
      </header>

      <div className="grid gap-6 min-[900px]:grid-cols-2">
        <SeccionDesplegable titulo="Catequesis infantil">
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {CATEQUESIS_NIVELES_INFANTILES.map((item) => (
              <li
                key={item.nivel}
                className="rounded-[14px] border border-border border-l-4 border-l-royal-gold bg-surface-muted px-4 py-3.5"
              >
                <strong className="mb-1.5 block text-[15px] leading-snug text-royal-blue">
                  {item.nivel}: "{item.titulo}"
                </strong>
                <span className="block text-[15px] leading-[1.65] text-gray-600">
                  {item.descripcion}
                </span>
              </li>
            ))}
          </ul>
        </SeccionDesplegable>

        <SeccionDesplegable titulo="Catequesis juvenil y confirmación">
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {CATEQUESIS_NIVELES_JUVENILES.map((item) => (
              <li
                key={item.nivel}
                className="rounded-[14px] border border-border border-l-4 border-l-royal-gold bg-surface-muted px-4 py-3.5"
              >
                <strong className="mb-1.5 block text-[15px] leading-snug text-royal-blue">
                  {item.nivel}: "{item.titulo}"
                </strong>
                <span className="block text-[15px] leading-[1.65] text-gray-600">
                  {item.descripcion}
                </span>
              </li>
            ))}
          </ul>
        </SeccionDesplegable>
      </div>

      <SeccionDesplegable
        titulo="Requisitos de inscripción"
        className="mt-8 border-t border-royal-gold/35 pt-6"
      >
        <p className="mb-4 text-[15px] leading-[1.7] text-gray-600">
          Esto es lo que conviene tener listo, sobre todo si va a matricular a un
          joven en catequesis juvenil.
        </p>
        <ul className="m-0 grid list-none gap-3.5 p-0 min-[900px]:grid-cols-2">
          {CATEQUESIS_ANTES_DE_INSCRIBIR.map((item) => (
            <li
              key={item.titulo}
              className="rounded-[14px] border border-border border-l-4 border-l-royal-gold bg-surface-muted px-4 py-3.5"
            >
              <strong className="mb-1.5 block text-[15px] leading-snug text-royal-blue">
                {item.titulo}
              </strong>
              <span className="block text-[15px] leading-[1.65] text-gray-600">
                {item.titulo === "Pago"
                  ? `La inscripción cuesta ${MONTO_INSCRIPCION_CATEQUESIS} por SINPE (${landingCatequesis.sinpe}). El comprobante es una fotografía y se envía al ${TELEFONO_COMPROBANTE_CATEQUESIS}.`
                  : item.texto}
              </span>
            </li>
          ))}
        </ul>
      </SeccionDesplegable>
    </section>
  );
};

export default CatequesisInfoSection;
