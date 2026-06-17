import { Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImage from "../../../assets/Iglesia.webp";
import Rutas from "../../../routes/Rutas";
import "./HeroSection.css";

function HeroSection() {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  return (
    <section
      className="hero"
      id="inicio"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="hero__overlay"></div>

      <div className="hero__content">
        <div className="hero__subtitle">
          <span className="hero__line"></span>
          <span>Desde 1544</span>
        </div>

        <h1 className="hero__title">
          Firme en la <br />
          <span>Fe y Tradición</span>
        </h1>

        <p className="hero__description">
          Ubicada en el corazón de Nicoya, la Parroquia San Blas es testimonio
          vivo de nuestra historia y esperanza cristiana.
        </p>

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
