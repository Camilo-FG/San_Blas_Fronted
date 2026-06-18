import { Link } from "@tanstack/react-router";
import { useState } from "react";
import Rutas from "../../../routes/Rutas";
import { useLandingSection } from "../../../hooks/useLandingSection";
import "./HeroSection.css";

const HERO_IMAGE = "/hero.webp";

const HERO_DEFAULT = {
  subtitle: "Desde 1544",
  title: "Firme en la",
  titleHighlight: "Fe y Tradición",
  description:
    "Ubicada en el corazón de Nicoya, la Parroquia San Blas es testimonio vivo de nuestra historia y esperanza cristiana.",
};

function HeroSection() {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const { data } = useLandingSection("hero", HERO_DEFAULT, { defer: true });
  const heroImage =
    typeof data.imageUrl === "string" && data.imageUrl.trim()
      ? data.imageUrl.trim()
      : HERO_IMAGE;

  return (
    <section className="hero" id="inicio">
      <img
        src={heroImage}
        alt=""
        className="hero__bg-image"
        fetchPriority="high"
        decoding="async"
        width={1920}
        height={1080}
      />
      <div className="hero__overlay"></div>

      <div className="hero__content">
        <div className="hero__subtitle">
          <span className="hero__line"></span>
          <span>{data.subtitle}</span>
        </div>

        <h1 className="hero__title">
          {data.title} <br />
          <span>{data.titleHighlight}</span>
        </h1>

        <p className="hero__description">{data.description}</p>

        <div className="hero__buttons">
          <Link
            to={Rutas.contacto}
            className="hero__button hero__button--primary"
          >
            Contactos
          </Link>

          <div
            className="hero__dropdown-container"
            onMouseEnter={() => setDropdownAbierto(true)}
            onMouseLeave={() => setDropdownAbierto(false)}
          >
            <button
              className="hero__button hero__button--secondary hero__dropdown-btn"
              type="button"
            >
              Trámites
              <span>{dropdownAbierto ? "▴" : "▾"}</span>
            </button>

            {dropdownAbierto && (
              <div className="hero__dropdown-menu">
                <Link to={Rutas.FormsolicitudesCatequesis} className="hero__dropdown-link">Catequesis</Link>
                <Link to={Rutas.SolicitudesSacramentos} className="hero__dropdown-link">Solicitudes de Sacramentos</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
