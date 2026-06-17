import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Rutas from "../../routes/Rutas";
import logoParroquia from "../../assets/Logo.png";
import "./Navbar.css";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [serviciosAbierto, setServiciosAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const dropdownTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) {
        clearTimeout(dropdownTimeout.current);
      }
    };
  }, []);

  const abrirServicios = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }

    setServiciosAbierto(true);
  };

  const cerrarServiciosConDelay = () => {
    dropdownTimeout.current = window.setTimeout(() => {
      setServiciosAbierto(false);
    }, 220);
  };

  const toggleServicios = () => {
    setServiciosAbierto((prev) => !prev);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
    setServiciosAbierto(false);

    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">
        <Link
          to={Rutas.home}
          className="navbar__logo"
          onClick={cerrarMenu}
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
            hash="sobre-nosotros"
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Sobre Nosotros
          </Link>

          <Link
            to={Rutas.historia}
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Historia
          </Link>

          <div
            className="navbar__dropdown"
            onMouseEnter={abrirServicios}
            onMouseLeave={cerrarServiciosConDelay}
          >
            <button
              type="button"
              className="navbar__link navbar__dropdown-button"
              onClick={toggleServicios}
              aria-expanded={serviciosAbierto}
              aria-haspopup="true"
            >
              Servicios
              <span className="navbar__dropdown-icon">
                {serviciosAbierto ? "▴" : "▾"}
              </span>
            </button>

            {serviciosAbierto && (
              <div
                className="navbar__submenu"
                onMouseEnter={abrirServicios}
                onMouseLeave={cerrarServiciosConDelay}
              >
                <Link
                  to={Rutas.FormsolicitudesCatequesis}
                  className="navbar__submenu-link"
                  onClick={cerrarMenu}
                >
                  Matrícula a Catequesis
                </Link>

                <Link
                  to={Rutas.SolicitudesSacramentos}
                  className="navbar__submenu-link"
                  onClick={cerrarMenu}
                >
                  Solicitudes de Sacramentos
                </Link>

                <Link
                  to={Rutas.bautizos}
                  className="navbar__submenu-link"
                  onClick={cerrarMenu}
                >
                  Bautizos
                </Link>

                <Link
                  to={Rutas.horarios}
                  className="navbar__submenu-link"
                  onClick={cerrarMenu}
                >
                  Horarios
                </Link>

                <Link
                  to={Rutas.contacto}
                  className="navbar__submenu-link"
                  onClick={cerrarMenu}
                >
                  Contacto
                </Link>
              </div>
            )}
          </div>

          <Link
            to={Rutas.donacionesPublicas}
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Donaciones
          </Link>

          <Link
            to={Rutas.dashboard}
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Dashboard
          </Link>
        </nav>

        <button
          type="button"
          className="navbar__mobile-button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </div>

      {menuAbierto && (
        <div className="navbar__mobile-panel">
          <div className="navbar__mobile-content">
            <Link
              to={Rutas.home}
              hash="sobre-nosotros"
              className="navbar__mobile-link"
              onClick={cerrarMenu}
            >
              Sobre Nosotros
            </Link>

            <Link
              to={Rutas.historia}
              className="navbar__mobile-link"
              onClick={cerrarMenu}
            >
              Historia
            </Link>

            <div className="navbar__mobile-section">
              <button
                type="button"
                className="navbar__mobile-link navbar__mobile-dropdown-button"
                onClick={toggleServicios}
                aria-expanded={serviciosAbierto}
                aria-haspopup="true"
              >
                Servicios
                <span>{serviciosAbierto ? "▴" : "▾"}</span>
              </button>

              {serviciosAbierto && (
                <div className="navbar__mobile-submenu">
                  <Link
                    to={Rutas.FormsolicitudesCatequesis}
                    className="navbar__mobile-sublink"
                    onClick={cerrarMenu}
                  >
                    Matrícula a Catequesis
                  </Link>

                  <Link
                    to={Rutas.SolicitudesSacramentos}
                    className="navbar__mobile-sublink"
                    onClick={cerrarMenu}
                  >
                    Solicitudes de Sacramentos
                  </Link>

                  <Link
                    to={Rutas.bautizos}
                    className="navbar__mobile-sublink"
                    onClick={cerrarMenu}
                  >
                    Bautizos
                  </Link>

                  <Link
                    to={Rutas.horarios}
                    className="navbar__mobile-sublink"
                    onClick={cerrarMenu}
                  >
                    Horarios
                  </Link>

                  <Link
                    to={Rutas.contacto}
                    className="navbar__mobile-sublink"
                    onClick={cerrarMenu}
                  >
                    Contacto
                  </Link>
                </div>
              )}
            </div>

            <Link
              to={Rutas.donacionesPublicas}
              className="navbar__mobile-link"
              onClick={cerrarMenu}
            >
              Donaciones
            </Link>

            <Link
              to={Rutas.dashboard}
              className="navbar__mobile-link"
              onClick={cerrarMenu}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
