import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import Rutas from "../../routes/Rutas";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const LOGO_URL = "/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [serviciosAbierto, setServiciosAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);

  const dropdownTimeout = useRef<number | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) {
        clearTimeout(dropdownTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuAbierto(false);
      }
    };

    if (userMenuAbierto) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuAbierto]);

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
    setUserMenuAbierto(false);

    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
  };

  const handleLogout = () => {
    logout();
    cerrarMenu();
    navigate({ to: Rutas.login });
  };

  const userRoleLabel = isAdmin ? "Administrador" : "Usuario";

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link
          to={Rutas.home}
          className="navbar__logo"
          onClick={cerrarMenu}
        >
          <img
            src={LOGO_URL}
            alt="Logo Parroquia San Blas"
            className="navbar__logo-img"
            width={42}
            height={42}
            decoding="async"
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
                  to={Rutas.eventosPublicos}
                  className="navbar__submenu-link"
                  onClick={cerrarMenu}
                >
                  Eventos
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

          {!isAuthenticated && (
            <Link
              to={Rutas.login}
              className="navbar__link"
              onClick={cerrarMenu}
            >
              Iniciar sesión
            </Link>
          )}

          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to={Rutas.SolicitudesSacramentos}
                className="navbar__link"
                onClick={cerrarMenu}
              >
                Constancia
              </Link>
              <Link
                to={Rutas.FormsolicitudesCatequesis}
                className="navbar__link"
                onClick={cerrarMenu}
              >
                Catequesis
              </Link>
            </>
          )}

          {isAuthenticated && (
            <div className="navbar__user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="navbar__user-button"
                onClick={() => setUserMenuAbierto((prev) => !prev)}
                aria-expanded={userMenuAbierto}
                aria-haspopup="true"
                aria-label="Menú de usuario"
              >
                <User size={18} />
              </button>

              {userMenuAbierto && (
                <div className="navbar__user-dropdown">
                  <div className="navbar__user-info">
                    <span className="navbar__user-name">{user?.email}</span>
                    <span className="navbar__user-role">{userRoleLabel}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to={Rutas.dashboard}
                      className="navbar__user-action"
                      onClick={() => {
                        setUserMenuAbierto(false);
                        cerrarMenu();
                      }}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className="navbar__user-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
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
                    to={Rutas.eventosPublicos}
                    className="navbar__mobile-sublink"
                    onClick={cerrarMenu}
                  >
                    Eventos
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

            {!isAuthenticated && (
              <Link
                to={Rutas.login}
                className="navbar__mobile-link"
                onClick={cerrarMenu}
              >
                Iniciar sesión
              </Link>
            )}

            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to={Rutas.SolicitudesSacramentos}
                  className="navbar__mobile-link"
                  onClick={cerrarMenu}
                >
                  Solicitud de constancia
                </Link>
                <Link
                  to={Rutas.FormsolicitudesCatequesis}
                  className="navbar__mobile-link"
                  onClick={cerrarMenu}
                >
                  Inscripción catequesis
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="navbar__mobile-user">
                <div className="navbar__mobile-user-info">
                  <User size={18} />
                  <div>
                    <span>{user?.email}</span>
                    <small>{userRoleLabel}</small>
                  </div>
                </div>
                {isAdmin && (
                  <Link
                    to={Rutas.dashboard}
                    className="navbar__mobile-link navbar__mobile-dashboard-link"
                    onClick={cerrarMenu}
                  >
                    Dashboard admin
                  </Link>
                )}
                <button
                  type="button"
                  className="navbar__mobile-link navbar__link--button"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
