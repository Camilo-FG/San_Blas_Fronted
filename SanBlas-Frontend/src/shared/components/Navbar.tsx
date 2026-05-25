import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import Rutas from "../../routes/Rutas";
import logoParroquia from "../../assets/Logo.png";
import "./Navbar.css";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [serviciosAbierto, setServiciosAbierto] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">
        <Link
          to={Rutas.home}
          className="navbar__logo"
        >
          <img
            src={logoParroquia}
            alt="Logo Parroquia San Blas"
            className="navbar__logo-img"
          />

          <span>Parroquia San Blas</span>
        </Link>

        <nav className="navbar__menu">
          <Link
            to={Rutas.home}
            className="navbar__link"
          >
            Inicio
          </Link>

          <Link
            to={Rutas.sobreNosotros}
            className="navbar__link"
          >
            Sobre Nosotros
          </Link>

          <Link
            to={Rutas.historia}
            className="navbar__link"
          >
            Historia
          </Link>

          <div
            className="navbar__dropdown"
            onMouseEnter={() => setServiciosAbierto(true)}
            onMouseLeave={() => setServiciosAbierto(false)}
          >
            <button
              type="button"
              className="navbar__link navbar__dropdown-button"
              onClick={() => setServiciosAbierto(!serviciosAbierto)}
            >
              Servicios
              <span className="navbar__dropdown-icon">▾</span>
            </button>

            {serviciosAbierto && (
              <div className="navbar__submenu">
                <Link
                  to={Rutas.matriculaCatequesis}
                  //!aun no lo he implementado
                  className="navbar__submenu-link"
                  onClick={() => setServiciosAbierto(false)}
                >
                  Matrícula a Catequesis
                </Link>

                <Link
                  to={Rutas.SolicitudesSacramentos}
                  className="navbar__submenu-link"
                  onClick={() => setServiciosAbierto(false)}
                >
                  Solicitudes de Sacramentos
                </Link>
              </div>
            )}
          </div>

          <Link
            to={Rutas.donacionesPublicas}
            className="navbar__link"
          >
            Donaciones
          </Link>

          <Link
            to={Rutas.dashboard}
            className="navbar__link"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
