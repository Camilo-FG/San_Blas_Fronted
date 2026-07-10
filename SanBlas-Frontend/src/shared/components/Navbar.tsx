import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import Rutas from "../../routes/Rutas";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../ui/cn";

const LOGO_URL = "/logo.png";

const navLinkClass =
  "relative py-2 text-xs font-extrabold uppercase tracking-[2px] text-white/88 no-underline transition-colors hover:text-royal-gold after:absolute after:bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:bg-royal-gold after:transition-all after:duration-250 hover:after:w-full max-[1000px]:text-[11px] max-[1000px]:tracking-[1.4px]";

const submenuLinkClass =
  "block whitespace-nowrap rounded-[10px] px-3.5 py-3 text-sm font-semibold text-text no-underline transition-colors hover:bg-gray-100 hover:text-royal-gold-muted";

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
    <header className="sticky top-0 z-[1000] w-full border-b-2 border-royal-gold bg-royal-blue">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-8 py-3 max-[900px]:gap-3.5 max-[900px]:px-[22px] max-sm:px-4 max-sm:py-[11px]">
        <Link
          to={Rutas.home}
          className="flex min-w-0 items-center gap-2.5 font-heading text-[22px] font-extrabold uppercase tracking-wide text-white no-underline transition-colors hover:text-royal-gold max-sm:text-[17px] max-sm:tracking-[0.5px] max-[480px]:text-sm"
          onClick={cerrarMenu}
        >
          <img
            src={LOGO_URL}
            alt="Logo Parroquia San Blas"
            className="size-[42px] shrink-0 rounded-full object-cover max-sm:size-9 max-[480px]:size-[34px]"
            width={42}
            height={42}
            decoding="async"
          />

          <span className="whitespace-nowrap max-[480px]:max-w-[210px] max-[480px]:overflow-hidden max-[480px]:text-ellipsis max-[360px]:max-w-[170px]">
            Parroquia San Blas
          </span>
        </Link>

        <nav className="flex items-center gap-[26px] max-[1000px]:gap-[18px] max-[900px]:hidden">
          <Link
            to={Rutas.home}
            hash="sobre-nosotros"
            className={navLinkClass}
            onClick={cerrarMenu}
          >
            Sobre Nosotros
          </Link>

          <Link
            to={Rutas.historia}
            className={navLinkClass}
            onClick={cerrarMenu}
          >
            Historia
          </Link>

          <div
            className="relative flex items-center"
            onMouseEnter={abrirServicios}
            onMouseLeave={cerrarServiciosConDelay}
          >
            <button
              type="button"
              className={cn(navLinkClass, "cursor-pointer border-none bg-transparent font-[inherit]")}
              onClick={toggleServicios}
              aria-expanded={serviciosAbierto}
              aria-haspopup="true"
            >
              Servicios
              <span className="ml-1.5 text-xs">
                {serviciosAbierto ? "▴" : "▾"}
              </span>
            </button>

            {serviciosAbierto && (
              <div
                className="absolute left-0 top-[calc(100%+12px)] z-[999] min-w-[250px] rounded-[14px] bg-surface p-2 shadow-[0_16px_35px_rgba(0,0,0,0.18)]"
                onMouseEnter={abrirServicios}
                onMouseLeave={cerrarServiciosConDelay}
              >
                <Link
                  to={Rutas.FormsolicitudesCatequesis}
                  className={submenuLinkClass}
                  onClick={cerrarMenu}
                >
                  Matrícula a Catequesis
                </Link>

                <Link
                  to={Rutas.SolicitudesSacramentos}
                  className={submenuLinkClass}
                  onClick={cerrarMenu}
                >
                  Solicitudes de Sacramentos
                </Link>

                <Link
                  to={Rutas.bautizos}
                  className={submenuLinkClass}
                  onClick={cerrarMenu}
                >
                  Bautizos
                </Link>

                <Link
                  to={Rutas.horarios}
                  className={submenuLinkClass}
                  onClick={cerrarMenu}
                >
                  Horarios
                </Link>

                <Link
                  to={Rutas.eventosPublicos}
                  className={submenuLinkClass}
                  onClick={cerrarMenu}
                >
                  Eventos
                </Link>

                <Link
                  to={Rutas.contacto}
                  className={submenuLinkClass}
                  onClick={cerrarMenu}
                >
                  Contacto
                </Link>
              </div>
            )}
          </div>

          <Link
            to={Rutas.donacionesPublicas}
            className={navLinkClass}
            onClick={cerrarMenu}
          >
            Donaciones
          </Link>

          {!isAuthenticated && (
            <Link
              to={Rutas.login}
              className={navLinkClass}
              onClick={cerrarMenu}
            >
              Iniciar sesión
            </Link>
          )}

          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to={Rutas.SolicitudesSacramentos}
                className={navLinkClass}
                onClick={cerrarMenu}
              >
                Constancia
              </Link>
              <Link
                to={Rutas.FormsolicitudesCatequesis}
                className={navLinkClass}
                onClick={cerrarMenu}
              >
                Catequesis
              </Link>
            </>
          )}

          {isAuthenticated && (
            <div className="relative flex items-center" ref={userMenuRef}>
              <button
                type="button"
                className={cn(
                  "inline-flex size-[38px] cursor-pointer items-center justify-center rounded-full border border-royal-gold/55 bg-white/10 text-royal-gold transition-colors hover:bg-white/18 hover:text-white hover:border-royal-gold",
                  userMenuAbierto && "border-royal-gold bg-white/18 text-white",
                )}
                onClick={() => setUserMenuAbierto((prev) => !prev)}
                aria-expanded={userMenuAbierto}
                aria-haspopup="true"
                aria-label="Menú de usuario"
              >
                <User size={18} />
              </button>

              {userMenuAbierto && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-[1001] min-w-[240px] rounded-[14px] bg-surface p-3 shadow-[0_16px_35px_rgba(0,0,0,0.18)]">
                  <div className="mb-2 flex flex-col gap-1 border-b border-border px-1.5 pb-2.5 pt-1">
                    <span className="break-words text-sm font-bold text-royal-blue">
                      {user?.email}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {userRoleLabel}
                    </span>
                  </div>
                  {isAdmin && (
                    <Link
                      to={Rutas.dashboard}
                      className="mb-2 box-border flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-royal-blue px-3 py-2.5 text-sm font-bold text-white no-underline transition-colors hover:bg-royal-blue-dark"
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
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-surface-muted px-3 py-2.5 text-sm font-bold text-royal-blue transition-colors hover:bg-[#eef2f7]"
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
          className="hidden shrink-0 cursor-pointer rounded-[10px] border-none bg-white/8 px-2.5 py-2 text-[26px] leading-none text-royal-gold transition-colors hover:bg-white/14 hover:text-white max-[900px]:block max-[480px]:px-[9px] max-[480px]:py-[7px] max-[480px]:text-2xl"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </div>

      {menuAbierto && (
        <div className="animate-slide-menu fixed right-0 top-[68px] z-[1001] h-[calc(100vh-68px)] w-full max-w-[330px] border-l border-white/12 bg-royal-blue shadow-[-12px_0_30px_rgba(0,0,0,0.35)] max-sm:top-[61px] max-sm:h-[calc(100vh-61px)] max-[480px]:max-w-full">
          <div className="flex flex-col gap-2.5 px-[22px] py-6">
            <Link
              to={Rutas.home}
              hash="sobre-nosotros"
              className="block w-full cursor-pointer border-b border-white/12 border-l-0 border-r-0 border-t-0 bg-transparent py-[13px] text-left font-serif text-[17px] italic text-white no-underline transition-colors hover:text-royal-gold"
              onClick={cerrarMenu}
            >
              Sobre Nosotros
            </Link>

            <Link
              to={Rutas.historia}
              className="block w-full cursor-pointer border-b border-white/12 border-l-0 border-r-0 border-t-0 bg-transparent py-[13px] text-left font-serif text-[17px] italic text-white no-underline transition-colors hover:text-royal-gold"
              onClick={cerrarMenu}
            >
              Historia
            </Link>

            <div className="border-b border-white/12 pb-2.5">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-2 text-left font-serif text-[17px] italic text-white transition-colors hover:text-royal-gold"
                onClick={toggleServicios}
                aria-expanded={serviciosAbierto}
                aria-haspopup="true"
              >
                Servicios
                <span>{serviciosAbierto ? "▴" : "▾"}</span>
              </button>

              {serviciosAbierto && (
                <div className="mt-2 flex flex-col gap-2 pl-3.5">
                  <Link
                    to={Rutas.FormsolicitudesCatequesis}
                    className="py-[7px] text-[13px] font-bold uppercase text-white/82 no-underline transition-colors hover:text-royal-gold"
                    onClick={cerrarMenu}
                  >
                    Matrícula a Catequesis
                  </Link>

                  <Link
                    to={Rutas.SolicitudesSacramentos}
                    className="py-[7px] text-[13px] font-bold uppercase text-white/82 no-underline transition-colors hover:text-royal-gold"
                    onClick={cerrarMenu}
                  >
                    Solicitudes de Sacramentos
                  </Link>

                  <Link
                    to={Rutas.bautizos}
                    className="py-[7px] text-[13px] font-bold uppercase text-white/82 no-underline transition-colors hover:text-royal-gold"
                    onClick={cerrarMenu}
                  >
                    Bautizos
                  </Link>

                  <Link
                    to={Rutas.horarios}
                    className="py-[7px] text-[13px] font-bold uppercase text-white/82 no-underline transition-colors hover:text-royal-gold"
                    onClick={cerrarMenu}
                  >
                    Horarios
                  </Link>

                  <Link
                    to={Rutas.eventosPublicos}
                    className="py-[7px] text-[13px] font-bold uppercase text-white/82 no-underline transition-colors hover:text-royal-gold"
                    onClick={cerrarMenu}
                  >
                    Eventos
                  </Link>

                  <Link
                    to={Rutas.contacto}
                    className="py-[7px] text-[13px] font-bold uppercase text-white/82 no-underline transition-colors hover:text-royal-gold"
                    onClick={cerrarMenu}
                  >
                    Contacto
                  </Link>
                </div>
              )}
            </div>

            <Link
              to={Rutas.donacionesPublicas}
              className="block w-full cursor-pointer border-b border-white/12 border-l-0 border-r-0 border-t-0 bg-transparent py-[13px] text-left font-serif text-[17px] italic text-white no-underline transition-colors hover:text-royal-gold"
              onClick={cerrarMenu}
            >
              Donaciones
            </Link>

            {!isAuthenticated && (
              <Link
                to={Rutas.login}
                className="block w-full cursor-pointer border-b border-white/12 border-l-0 border-r-0 border-t-0 bg-transparent py-[13px] text-left font-serif text-[17px] italic text-white no-underline transition-colors hover:text-royal-gold"
                onClick={cerrarMenu}
              >
                Iniciar sesión
              </Link>
            )}

            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to={Rutas.SolicitudesSacramentos}
                  className="block w-full cursor-pointer border-b border-white/12 border-l-0 border-r-0 border-t-0 bg-transparent py-[13px] text-left font-serif text-[17px] italic text-white no-underline transition-colors hover:text-royal-gold"
                  onClick={cerrarMenu}
                >
                  Solicitud de constancia
                </Link>
                <Link
                  to={Rutas.FormsolicitudesCatequesis}
                  className="block w-full cursor-pointer border-b border-white/12 border-l-0 border-r-0 border-t-0 bg-transparent py-[13px] text-left font-serif text-[17px] italic text-white no-underline transition-colors hover:text-royal-gold"
                  onClick={cerrarMenu}
                >
                  Inscripción catequesis
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="mt-3 flex flex-col gap-3 border-t border-white/12 pt-3.5">
                <div className="flex items-center gap-2.5 text-white">
                  <User size={18} />
                  <div className="flex flex-col gap-0.5">
                    <span className="break-words text-[0.92rem] font-bold">
                      {user?.email}
                    </span>
                    <small className="text-[0.72rem] uppercase tracking-wider text-white/70">
                      {userRoleLabel}
                    </small>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {isAdmin && (
                    <Link
                      to={Rutas.dashboard}
                      className="inline-flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-[10px] border border-royal-gold/55 bg-royal-gold/12 px-3.5 py-[0.65rem] text-[0.92rem] font-bold text-[#f5d77a] no-underline transition-colors hover:bg-royal-gold/22 hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus-ring focus-visible:outline-offset-2"
                      onClick={cerrarMenu}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard admin</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    className="inline-flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-[10px] border border-white/20 bg-white/6 px-3.5 py-[0.65rem] text-[0.92rem] font-bold text-white transition-colors hover:bg-white/12 hover:text-red-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus-ring focus-visible:outline-offset-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
