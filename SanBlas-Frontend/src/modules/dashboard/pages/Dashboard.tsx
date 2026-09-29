import SeoHead from "../../../seo/SeoHead";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
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
  X,
} from "lucide-react";

import Rutas from "../../../routes/Rutas";
import { useAuth } from "../../../context/AuthContext";
import { cn } from "../../../shared/ui";
import type { PermisoRolId } from "../../../types/Rol";

const navLinks: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permiso: PermisoRolId;
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
    label: "Solicitudes de Catequesis",
    icon: BookOpen,
    permiso: "catequesis",
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
  "flex w-full items-center gap-3 rounded-lg border-l-4 py-3 pr-4 pl-3 text-left text-xs font-semibold no-underline transition-all duration-200 ease-out hover:translate-x-1.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

const menuItemInactiveClassName =
  "border-transparent text-gray-400 hover:bg-white/5 hover:text-white [&_svg]:text-gray-500 hover:[&_svg]:text-white";

const menuItemActiveClassName =
  "border-brand-gold bg-brand-blue text-brand-gold dark:border-transparent dark:bg-transparent";

function getUserInitial(email?: string | null): string {
  if (!email) return "A";
  return email.charAt(0).toUpperCase();
}

function getRoleLabel(role?: string | null): string {
  if (!role) return "Usuario";
  const clave = role.toLowerCase();
  if (clave === "secretario" || clave === "admin") return "Secretario";
  if (clave === "catequista") return "Catequista";
  if (clave === "gestor-eventos") return "Gestor de Eventos";
  if (clave === "gestor-donaciones") return "Personal de Donaciones";
  if (clave === "user") return "Usuario";
  return role;
}

function Dashboard() {
  const { user, logout, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [barraExpandida, setBarraExpandida] = useState(false);
  const esConstancias =
    pathname === Rutas.dashboardUrl.constanciasSacramentos;
  const pageInfo = pageTitles[pathname] ?? {
    title: "Panel administrativo",
    subtitle: "Parroquia San Blas",
  };

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  const handleLogout = () => {
    logout();
    navigate({ to: Rutas.login });
  };

  return (
    <>
      <SeoHead page="/login" overrides={{ robots: "noindex, nofollow", title: "Panel Administrativo | Parroquia San Blas", description: "Panel de administración de la Parroquia San Blas de Nicoya." }} />
      <div
        className={cn(
          "relative flex min-h-screen flex-col bg-gray-50 lg:flex-row",
          esConstancias && "dark:bg-[#040b16] dark:text-[#f3f6fa]",
        )}
        style={{ "--sidebar-width": barraExpandida ? "16rem" : "4rem" } as CSSProperties}
      >
      {/* Mobile top header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-blue px-4 py-3 shadow-sm lg:hidden">
        <Link
          to={Rutas.home}
          className="flex items-center gap-2 font-heading text-sm font-bold text-brand-gold no-underline"
        >
          SB San Blas
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-brand-gold/30 bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
            ADMIN
          </span>
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
          "fixed top-0 z-50 flex h-screen w-64 shrink-0 flex-col justify-between overflow-hidden border-r border-gray-800 bg-[#050a12] text-gray-300 transition-[width,transform] duration-[800ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:translate-x-0",
          menuAbierto ? "translate-x-0" : "-translate-x-full",
          barraExpandida ? "lg:w-64" : "lg:w-16",
          esConstancias && "dark:bg-[#030710]",
        )}
        onMouseEnter={() => setBarraExpandida(true)}
        onMouseLeave={() => setBarraExpandida(false)}
        aria-label="Menú del panel administrativo"
      >
        <div>
          <div className={cn("border-b border-gray-800 p-6", !barraExpandida && "lg:flex lg:h-[84px] lg:items-center lg:justify-center lg:p-0")}>
            <Link
              to={Rutas.home}
              aria-label="Ir al sitio de la parroquia"
              className="flex items-center justify-center gap-2.5 text-center no-underline transition-opacity hover:opacity-90"
              onClick={() => setMenuAbierto(false)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold bg-brand-blue">
                <span className="font-heading text-sm font-bold text-brand-gold">SB</span>
              </div>
              <div className={cn("min-w-0", !barraExpandida && "lg:hidden")}>
                <span className="block truncate whitespace-nowrap font-heading text-sm font-bold text-white">
                  San Blas Nicoya
                </span>
                <span className="block whitespace-nowrap font-mono text-[9px] tracking-wider text-brand-gold uppercase">
                  Panel de control
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks
              .filter((link) => tienePermiso(link.permiso))
              .map((link) => {
              const Icon = link.icon;
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
                    !barraExpandida && "lg:justify-center lg:gap-0 lg:px-0",
                  )}
                  inactiveProps={{ className: menuItemInactiveClassName }}
                  activeProps={{ className: menuItemActiveClassName }}
                  activeOptions={{ exact: link.to === Rutas.dashboard }}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200",
                      activo
                        ? "bg-gradient-to-br from-[#f6c945] via-[#e6b53a] to-[#c9992b] shadow-[0_0_16px_rgba(230,181,58,0.55),0_4px_10px_rgba(0,0,0,0.35)]"
                        : "bg-transparent",
                      !barraExpandida && "lg:-translate-x-[2px]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        activo && "text-[#0a1628]",
                      )}
                      strokeWidth={activo ? 2.25 : 1.75}
                    />
                  </span>
                  <span className={cn("whitespace-nowrap", !barraExpandida && "lg:hidden")}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={cn("border-t border-gray-800 bg-[#050a12] px-6 py-4 text-xs", !barraExpandida && "lg:flex lg:h-[99px] lg:items-start lg:justify-center lg:pt-4 lg:px-0")}>
          <Link
            to={Rutas.dashboardUrl.perfil}
            className={cn(
              "mb-3 flex items-center gap-2.5 rounded-lg p-1.5 no-underline transition-colors hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              pathname === Rutas.dashboardUrl.perfil && "bg-white/5",
            )}
            aria-label="Ver mi perfil"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold font-heading text-[10px] font-bold text-brand-blue uppercase">
              {getUserInitial(user?.email)}
            </div>
            <div className={cn("min-w-0 overflow-hidden", !barraExpandida && "lg:hidden")}>
              <p className="truncate whitespace-nowrap text-[11px] font-bold text-white">
                {getRoleLabel(user?.role)}
              </p>
              <p className="truncate whitespace-nowrap text-[9px] text-gray-500">{user?.email}</p>
            </div>
          </Link>
          <div className={cn("grid min-w-56 grid-cols-2 gap-2", !barraExpandida && "lg:hidden")}>
            <Link
              to={Rutas.home}
              className="w-full rounded bg-white/5 py-1.5 text-center text-[10px] font-semibold whitespace-nowrap text-gray-400 no-underline transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full cursor-pointer rounded border-none bg-red-900/20 py-1.5 text-center text-[10px] font-semibold whitespace-nowrap text-red-400 transition-colors hover:bg-red-900/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "h-[calc(100vh-50px)] flex-1 overflow-y-auto p-4 sm:p-6 lg:h-screen lg:p-8",
          esConstancias && "dark:bg-[#040b16]",
        )}
      >
        {pathname !== Rutas.dashboard && (
          <header
            className={cn(
              "mb-3 rounded-[20px] border border-border bg-surface p-4 shadow-sm sm:p-5 lg:mb-4",
              esConstancias &&
                "dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]",
            )}
          >
            <p
              className={cn(
                "mb-1 text-[0.72rem] leading-tight font-extrabold tracking-[0.14em] text-brand-gold uppercase",
                esConstancias && "dark:text-[#d9a928]",
              )}
            >
              Administración
            </p>
            <h1
              className={cn(
                "mb-1 font-heading text-lg leading-tight text-brand-blue lg:text-2xl",
                esConstancias && "dark:text-[#f3f6fa]",
              )}
            >
              {pageInfo.title}
            </h1>
            <p
              className={cn(
                "max-w-3xl text-sm text-text-secondary",
                esConstancias && "dark:text-[#b7c3d4]",
              )}
            >
              {pageInfo.subtitle}
            </p>
          </header>
        )}

        <Outlet />
      </main>
    </div>
    </>
  );
}

export default Dashboard;
