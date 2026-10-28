import SeoHead from "../../../seo/SeoHead";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  BookOpen,
  Heart,
  Calendar,
  Settings,
  Users,
  Menu,
  Moon,
  Sun,
  X,
  ChevronDown,
} from "lucide-react";

import Rutas from "../../../routes/Rutas";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { cn } from "../../../shared/ui";
import type { PermisoRolId } from "../../../types/Rol";
import DashboardTopBar from "../components/DashboardTopBar";
import NotificacionesPanel from "../components/NotificacionesPanel";

const navLinks: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permiso: PermisoRolId;
  hijos?: { to: string; label: string }[];
}[] = [
  { to: Rutas.dashboard, label: "Resumen", icon: LayoutDashboard, permiso: "panel" },
  {
    to: Rutas.dashboardUrl.registroSacramentos,
    label: "Registro de Sacramentos",
    icon: FileSpreadsheet,
    permiso: "sacramentos",
  },
  {
    to: Rutas.dashboardUrl.constanciasSacramentos,
    label: "Solicitudes de Sacramentos",
    icon: FileText,
    permiso: "constancias",
  },
  {
    to: Rutas.dashboardUrl.solicitudesCatequesis,
    label: "Catequesis",
    icon: BookOpen,
    permiso: "catequesis",
    hijos: [
      {
        to: Rutas.dashboardUrl.solicitudesCatequesis,
        label: "Infantiles y juveniles",
      },
      { to: Rutas.dashboardUrl.cica, label: "CICA" },
      { to: Rutas.dashboardUrl.catequesisBautismo, label: "Bautismo" },
    ],
  },
  {
    to: Rutas.dashboardUrl.donaciones,
    label: "Gestión de Donaciones",
    icon: Heart,
    permiso: "donaciones",
  },
  {
    to: Rutas.dashboardUrl.eventos,
    label: "Gestión de Eventos",
    icon: Calendar,
    permiso: "eventos",
  },
  {
    to: Rutas.dashboardUrl.gestionLanding,
    label: "Gestión del Landing (CMS)",
    icon: Settings,
    permiso: "landing",
  },
  {
    to: Rutas.dashboardUrl.gestionUsuarios,
    label: "Gestión de Usuarios",
    icon: Users,
    permiso: "usuarios",
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  [Rutas.dashboard]: {
    title: "Resumen general",
    subtitle: "Vista rápida de la actividad parroquial registrada en el sistema.",
  },
  [Rutas.dashboardUrl.registroSacramentos]: {
    title: "Registro de sacramentos",
    subtitle: "Administre bautismos, comuniones, confirmaciones y matrimonios.",
  },
  [Rutas.dashboardUrl.constanciasSacramentos]: {
    title: "Solicitudes de constancias sacramentales",
    subtitle: "Revise y actualice el estado de las solicitudes recibidas.",
  },
  [Rutas.dashboardUrl.solicitudesCatequesis]: {
    title: "Solicitudes de catequesis",
    subtitle: "Gestione inscripciones, documentos y aprobaciones de catequesis.",
  },
  [Rutas.dashboardUrl.cica]: {
    title: "Catequesis de adultos (CICA)",
    subtitle: "Revise las inscripciones de adultos y apruebe o rechace cada solicitud.",
  },
  [Rutas.dashboardUrl.catequesisBautismo]: {
    title: "Catequesis para el bautismo",
    subtitle: "Certifique la catequesis que padres y padrinos completan antes de bautizar.",
  },
  [Rutas.dashboardUrl.donaciones]: {
    title: "Gestión de donaciones",
    subtitle: "Consulte y actualice las donaciones registradas.",
  },
  [Rutas.dashboardUrl.eventos]: {
    title: "Gestión de eventos",
    subtitle: "Cree y edite eventos visibles en el sitio público.",
  },
  [Rutas.dashboardUrl.gestionLanding]: {
    title: "Gestión del landing",
    subtitle: "Edite textos y bloques del sitio público de la parroquia.",
  },
  [Rutas.dashboardUrl.gestionUsuarios]: {
    title: "Gestión de usuarios",
    subtitle: "Administre cuentas, roles y accesos del sistema.",
  },
  [Rutas.dashboardUrl.perfil]: {
    title: "Mi perfil",
    subtitle: "Consulte los datos de la cuenta con la que inició sesión.",
  },
};

const menuItemBaseClassName =
  "group relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg border-l-4 py-2 pr-4 pl-1 text-left text-sm font-semibold no-underline transition-[background-color,color,border-color] duration-150 ease-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

const menuItemInactiveClassName =
  "border-transparent text-gray-400 hover:bg-white/5 hover:text-white dark:hover:bg-transparent";

const menuItemActiveClassName =
  "border-brand-gold bg-brand-blue text-brand-gold dark:border-transparent dark:bg-transparent";

// pastilla dorada completa cuando la opción activa se ve expandida:
// el wash dorado hace fade por opacidad (GPU) y las letras heredan el negro
const menuItemActiveExpandedClassName =
  "border-transparent bg-transparent text-[#0a1628]";

function esRutaDeCatequesis(pathname: string) {
  return [
    Rutas.dashboardUrl.solicitudesCatequesis,
    Rutas.dashboardUrl.cica,
    Rutas.dashboardUrl.catequesisBautismo,
  ].some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

function Dashboard() {
  const { tienePermiso } = useAuth();
  const { esOscuro, cambiandoTema, alternarTema } = useTheme();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [barraExpandida, setBarraExpandida] = useState(false);
  const [catequesisAbierta, setCatequesisAbierta] = useState(() =>
    esRutaDeCatequesis(pathname),
  );
  const temporizadorCierre = useRef<number | null>(null);

  const expandirBarra = () => {
    if (temporizadorCierre.current) {
      window.clearTimeout(temporizadorCierre.current);
      temporizadorCierre.current = null;
    }
    setBarraExpandida(true);
    if (esRutaDeCatequesis(pathname)) setCatequesisAbierta(true);
  };

  const colapsarBarra = () => {
    if (temporizadorCierre.current) window.clearTimeout(temporizadorCierre.current);
    temporizadorCierre.current = window.setTimeout(() => {
      setBarraExpandida(false);
      setCatequesisAbierta(false);
    }, 120);
  };

  useEffect(
    () => () => {
      if (temporizadorCierre.current) window.clearTimeout(temporizadorCierre.current);
    },
    [],
  );
  const esAdmin =
    pathname === Rutas.dashboard ||
    pathname.startsWith(`${Rutas.dashboard}/`);
  const pageInfo = pageTitles[pathname] ?? {
    title: "Panel administrativo",
    subtitle: "Parroquia San Blas",
  };

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (esRutaDeCatequesis(pathname)) setCatequesisAbierta(true);
    else setCatequesisAbierta(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  return (
    <>
      <SeoHead page="/login" overrides={{ robots: "noindex, nofollow", title: "Panel Administrativo | Parroquia San Blas", description: "Panel de administración de la Parroquia San Blas de Nicoya." }} />
      <div
        className={cn(
          "relative flex min-h-screen flex-col bg-gray-50 lg:flex-row",
          esAdmin && "dark:bg-[#040b16] dark:text-[#f3f6fa]",
        )}
        style={{ "--sidebar-width": barraExpandida ? "18rem" : "5rem" } as CSSProperties}
      >
      {/* Mobile top header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-blue px-4 py-3 shadow-sm lg:hidden">
        <Link
          to={Rutas.home}
          className="flex items-center gap-2 font-heading text-sm font-bold text-brand-gold no-underline"
        >
          SB San Blas
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-brand-gold/30 bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
            ADMIN
          </span>
          <NotificacionesPanel variante="oscuro" />
          <button
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            className="cursor-pointer border-none bg-transparent text-white hover:text-brand-gold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {menuAbierto && (
        <button
          type="button"
          className="fixed inset-0 z-40 border-none bg-slate-900/50 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between overflow-hidden overflow-x-hidden border-r border-gray-800 bg-[#050a12] text-gray-300 transition-[width,transform] duration-200 ease-in-out will-change-[width,transform] lg:sticky lg:translate-x-0",
          menuAbierto ? "translate-x-0" : "-translate-x-full",
          barraExpandida ? "lg:w-72" : "lg:w-20",
          esAdmin && "dark:bg-[#030710]",
        )}
        onMouseEnter={expandirBarra}
        onMouseLeave={colapsarBarra}
        aria-label="Menú del panel administrativo"
      >
        <div>
          <div className="flex h-[68px] shrink-0 items-center border-b border-gray-800 px-5 lg:h-[76px] lg:px-4">
            <Link
              to={Rutas.home}
              aria-label="Ir al sitio de la parroquia"
              className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-90"
              onClick={() => setMenuAbierto(false)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold bg-brand-blue dark:border-[#e3c05c] dark:bg-[#050a12] dark:shadow-[0_0_14px_rgba(212,175,55,0.45)]">
                <span className="font-heading text-sm font-bold text-brand-gold dark:text-[#e8c85a]">SB</span>
              </div>
              <div className={cn("min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150", !barraExpandida ? "lg:pointer-events-none lg:opacity-0" : "lg:opacity-100")}>
                <span className="block truncate whitespace-nowrap font-heading text-sm font-bold text-white">
                  San Blas Nicoya
                </span>
                <span className="block whitespace-nowrap font-mono text-[9px] tracking-wider text-brand-gold uppercase">
                  Panel de control
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks
              .filter((link) => tienePermiso(link.permiso))
              .map((link) => {
              const Icon = link.icon;
              const esDonaciones = link.to === Rutas.dashboardUrl.donaciones;

              if (link.hijos) {
                const enSeccion = link.hijos.some(
                  (hijo) =>
                    pathname === hijo.to || pathname.startsWith(`${hijo.to}/`),
                );
                const pastillaCompleta = enSeccion && !catequesisAbierta;
                const pastillaIcono = enSeccion && !barraExpandida;

                return (
                  <div key={link.label}>
                    <button
                      type="button"
                      aria-expanded={catequesisAbierta}
                      aria-controls="submenu-catequesis"
                      onClick={() => setCatequesisAbierta((abierta) => !abierta)}
                      className={cn(
                        menuItemBaseClassName,
                        "cursor-pointer border-0 bg-transparent",
                        pastillaCompleta
                          ? menuItemActiveExpandedClassName
                          : menuItemInactiveClassName,
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2.5 self-stretch rounded-lg">
                        {(pastillaCompleta || pastillaIcono) && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none absolute left-1 top-1/2 h-9 -translate-y-1/2 rounded-[10px] bg-gradient-to-br from-[#f6c945] via-[#e6b53a] to-[#c9992b] shadow-[0_0_18px_rgba(230,181,58,0.5),0_4px_10px_rgba(0,0,0,0.3)] transition-[width] duration-200 ease-in-out",
                              pastillaCompleta && !pastillaIcono && "w-[calc(100%-4px)]",
                              !pastillaCompleta && pastillaIcono && "hidden w-9 lg:block",
                              pastillaCompleta && pastillaIcono && "w-[calc(100%-4px)] lg:w-9",
                            )}
                          />
                        )}
                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-transparent">
                          <Icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-[color] duration-150",
                              pastillaCompleta
                                ? "text-[#0a1628]"
                                : pastillaIcono
                                  ? "text-gray-500 lg:text-[#0a1628]"
                                  : enSeccion
                                    ? "text-white"
                                    : "text-gray-500 group-hover:text-white",
                            )}
                            strokeWidth={enSeccion ? 2.25 : 1.75}
                          />
                        </span>
                        <span
                          className={cn(
                            "relative overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150",
                            !barraExpandida ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-[180px] lg:opacity-100",
                          )}
                        >
                          {link.label}
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "relative ml-auto h-4 w-4 shrink-0 transition-[transform,opacity] duration-150",
                            catequesisAbierta && "rotate-180",
                            !barraExpandida && "lg:opacity-0",
                          )}
                        />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {catequesisAbierta && (
                        <motion.div
                          id="submenu-catequesis"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={cn("overflow-hidden", !barraExpandida && "lg:hidden")}
                        >
                          <div className="space-y-0.5 pt-1">
                            {link.hijos.map((hijo) => {
                              const hijoActivo =
                                pathname === hijo.to ||
                                pathname.startsWith(`${hijo.to}/`);

                              return (
                                <Link
                                  key={hijo.to}
                                  to={hijo.to}
                                  className={cn(
                                    "relative flex w-full items-center rounded-lg py-2 pr-3 pl-12 text-left text-sm font-semibold no-underline transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                                    hijoActivo
                                      ? "text-[#0a1628]"
                                      : "text-gray-400 hover:text-white",
                                  )}
                                >
                                  {hijoActivo && (
                                    <span
                                      aria-hidden="true"
                                      className="pointer-events-none absolute inset-y-0 right-1 left-1 rounded-[10px] bg-gradient-to-br from-[#f6c945] via-[#e6b53a] to-[#c9992b] shadow-[0_0_18px_rgba(230,181,58,0.5),0_4px_10px_rgba(0,0,0,0.3)]"
                                    />
                                  )}
                                  <span className="relative whitespace-nowrap">{hijo.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              const activo =
                link.to === Rutas.dashboard
                  ? pathname === link.to
                  : pathname === link.to || pathname.startsWith(`${link.to}/`);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    menuItemBaseClassName,
                  )}
                  inactiveProps={{ className: menuItemInactiveClassName }}
                  activeProps={{
                    className: barraExpandida
                      ? menuItemActiveExpandedClassName
                      : menuItemActiveClassName,
                  }}
                  activeOptions={{ exact: link.to === Rutas.dashboard }}
                >
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2.5 self-stretch rounded-lg",
                    )}
                  >
                  {activo && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute left-1 top-1/2 h-9 -translate-y-1/2 rounded-[10px] bg-gradient-to-br from-[#f6c945] via-[#e6b53a] to-[#c9992b] shadow-[0_0_18px_rgba(230,181,58,0.5),0_4px_10px_rgba(0,0,0,0.3)] transition-[width] duration-200 ease-in-out",
                        barraExpandida ? "w-[calc(100%-4px)]" : "w-9",
                      )}
                    />
                  )}
                  <span
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-transparent"
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-[color] duration-150",
                        activo
                          ? "text-[#0a1628]"
                          : esDonaciones
                            ? "text-gray-500 group-hover:text-pink-400 group-hover:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]"
                            : "text-gray-500 group-hover:text-white",
                      )}
                      strokeWidth={activo ? 2.25 : 1.75}
                    />
                    </span>
                    <span
                      className={cn(
                        "relative overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150",
                        !barraExpandida ? "lg:max-w-0 lg:opacity-0 lg:pr-0" : "lg:max-w-[220px] lg:opacity-100 pr-16",
                      )}
                    >
                      {link.label}
                    </span>
                  </span>
                </Link>
              );
            })}
            <button
              type="button"
              aria-label="Cambiar tema de color"
              aria-disabled={cambiandoTema}
              disabled={cambiandoTema}
              onClick={alternarTema}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border py-1.5 pl-1.5 pr-3.5 text-gray-300 transition-colors hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-70",
                barraExpandida
                  ? "border-white/10 bg-black/40 hover:border-white/20"
                  : "border-transparent bg-transparent",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <Moon size={18} className={cn("shrink-0", !esOscuro && "hidden")} />
                <Sun size={18} className={cn("shrink-0", esOscuro && "hidden")} />
              </span>
              <span
                className={cn(
                  "flex-1 overflow-hidden whitespace-nowrap text-left text-sm font-semibold transition-[max-width,opacity] duration-150",
                  !barraExpandida ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-[180px] lg:opacity-100",
                )}
              >
                {esOscuro ? "Modo oscuro" : "Modo claro"}
              </span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main column: top bar + scrollable content */}
      <div
        className={cn(
          "flex h-[calc(100vh-50px)] min-w-0 flex-1 flex-col lg:h-screen",
          esAdmin && "dark:bg-[#040b16]",
        )}
      >
        <DashboardTopBar tituloSeccion={pageInfo.title} esAdmin={esAdmin} />

        <main
          className={cn(
            "min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8",
            esAdmin && "dark:bg-[#040b16]",
          )}
        >
          {pathname !== Rutas.dashboard && (
            <header
              className={cn(
                "mb-3 rounded-[20px] border border-border bg-surface p-4 shadow-sm sm:p-5 lg:mb-4",
                esAdmin &&
                  "dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]",
              )}
            >
              <p
                className={cn(
                  "mb-1 text-[0.72rem] leading-tight font-extrabold tracking-[0.14em] text-brand-gold uppercase",
                  esAdmin && "dark:text-[#d9a928]",
                )}
              >
                Administración
              </p>
              <h1
                className={cn(
                  "mb-1 font-heading text-lg leading-tight text-brand-blue lg:text-2xl",
                  esAdmin && "dark:text-[#f3f6fa]",
                )}
              >
                {pageInfo.title}
              </h1>
              <p
                className={cn(
                  "max-w-3xl text-sm text-text-secondary",
                  esAdmin && "dark:text-[#b7c3d4]",
                )}
              >
                {pageInfo.subtitle}
              </p>
            </header>
          )}

          <Outlet />
        </main>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
