import { Compass, Heart, Users } from "lucide-react";
import "./HeroValuesSection.css";

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
    <section className="hero-values" aria-label="Valores parroquiales">
      <div className="hero-values__grid">
        {VALUES.map(({ icon: Icon, title, description }) => (
          <article key={title} className="hero-values__card">
            <div className="hero-values__icon">
              <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HeroValuesSection;
