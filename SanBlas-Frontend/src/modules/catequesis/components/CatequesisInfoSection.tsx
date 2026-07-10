import {
  CATEQUESIS_INTRO,
  CATEQUESIS_NIVELES_INFANTILES,
  CATEQUESIS_NIVELES_JUVENILES,
} from "../constants/catequesisInformacion";

const CatequesisInfoSection = () => (
  <section
    className="mx-auto mt-6 max-w-[1100px] rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:mt-10 sm:rounded-[22px] sm:p-7"
    aria-labelledby="catequesis-info-title"
  >
    <header className="mb-6 border-b border-royal-gold/35 pb-5">
      <p className="mb-2 text-xs font-black tracking-widest text-royal-gold-muted uppercase">
        Información para familias
      </p>
      <h1
        id="catequesis-info-title"
        className="font-heading text-[clamp(24px,3vw,30px)] leading-tight font-extrabold text-royal-blue"
      >
        {CATEQUESIS_INTRO.titulo}
      </h1>
      <p className="mt-3.5 text-[15px] leading-[1.75] text-gray-600 sm:text-[15px]">
        {CATEQUESIS_INTRO.descripcion}
      </p>
      <p className="mt-3 rounded-[14px] border border-royal-gold/40 bg-royal-gold/10 p-3.5 text-sm leading-[1.75] text-gray-600 sm:text-sm">
        {CATEQUESIS_INTRO.notaCenacat}
      </p>
    </header>

    <div className="grid gap-6 min-[900px]:grid-cols-2">
      <article>
        <h2 className="mb-4 font-heading text-lg font-extrabold text-royal-blue sm:text-xl">
          Catequesis infantil
        </h2>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {CATEQUESIS_NIVELES_INFANTILES.map((item) => (
            <li
              key={item.nivel}
              className="rounded-[14px] border border-border border-l-4 border-l-royal-gold bg-surface-muted px-4 py-3.5"
            >
              <strong className="mb-1.5 block text-sm leading-snug text-royal-blue">
                {item.nivel}: “{item.titulo}”
              </strong>
              <span className="block text-sm leading-[1.65] text-gray-600">
                {item.descripcion}
              </span>
            </li>
          ))}
        </ul>
      </article>

      <article>
        <h2 className="mb-4 font-heading text-lg font-extrabold text-royal-blue sm:text-xl">
          Catequesis juvenil y confirmación
        </h2>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {CATEQUESIS_NIVELES_JUVENILES.map((item) => (
            <li
              key={item.nivel}
              className="rounded-[14px] border border-border border-l-4 border-l-royal-gold bg-surface-muted px-4 py-3.5"
            >
              <strong className="mb-1.5 block text-sm leading-snug text-royal-blue">
                {item.nivel}: “{item.titulo}”
              </strong>
              <span className="block text-sm leading-[1.65] text-gray-600">
                {item.descripcion}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  </section>
);

export default CatequesisInfoSection;
