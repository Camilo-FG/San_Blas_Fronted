import { Compass, Heart, Users } from "lucide-react";

const VALUES = [
  {
    icon: Compass,
    title: "Tradición Colonial",
    description:
      "Preservamos con honor la segunda iglesia más antigua de toda Costa Rica.",
  },
  {
    icon: Users,
    title: "Comunión de Fe",
    description:
      "Abrazamos a las filiales de Nicoya bajo un lazo fraterno de amor cristiano.",
  },
  {
    icon: Heart,
    title: "Acción Caritativa",
    description:
      "Sostenemos al desvalido y alimentamos al necesitado del cantón.",
  },
] as const;

function HeroValuesSection() {
  return (
    <section
      className="relative z-[3] bg-surface px-[8%] py-[72px] max-[900px]:px-8 max-[900px]:py-14 max-sm:px-[18px] max-sm:py-12"
      aria-label="Valores parroquiales"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-3 gap-7 max-[900px]:grid-cols-1 max-[900px]:gap-5">
        {VALUES.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-[22px] border border-[#e8edf2] bg-surface p-9 shadow-[0_16px_40px_rgba(15,23,42,0.06)] max-[900px]:px-6 max-[900px]:py-7"
          >
            <div className="mb-[22px] grid size-14 place-items-center rounded-[14px] bg-royal-blue text-royal-gold">
              <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h3 className="mb-3 font-heading text-[1.35rem] font-extrabold text-royal-blue max-sm:text-[1.2rem]">
              {title}
            </h3>
            <p className="text-[0.98rem] leading-[1.65] text-text-secondary">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HeroValuesSection;
