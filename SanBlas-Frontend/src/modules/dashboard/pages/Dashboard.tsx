import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

const navLinks = [
  { to: Rutas.dashboard, label: "Resumen", icon: LayoutDashboard },
  {
    to: Rutas.dashboardUrl.registroSacramentos,
    label: "Registro de Sacramentos",
    icon: FileSpreadsheet,
  },
  {
    to: Rutas.dashboardUrl.constanciasSacramentos,
    label: "Constancias de Sacramentos",
    icon: FileText,
  },
  {
    to: Rutas.dashboardUrl.solicitudesCatequesis,
    label: "Solicitudes de Catequesis",
    icon: BookOpen,
  },
  {
    to: Rutas.dashboardUrl.donaciones,
    label: "Gestión de Donaciones",
    icon: Heart,
  },
  {
    to: Rutas.dashboardUrl.eventos,
    label: "Gestión de Eventos",
    icon: Calendar,
  },
  {
    to: Rutas.dashboardUrl.gestionLanding,
    label: "Gestión del Landing (CMS)",
    icon: Settings,
  },
  {
    to: Rutas.dashboardUrl.gestionUsuarios,
    label: "Gestión de Usuarios",
    icon: Users,
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
    title: "Solicitudes de constancia",
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
};

const menuItemBaseClassName =
  "flex w-full items-center gap-3 rounded-lg border-l-4 py-3 pr-4 pl-3 text-left text-xs font-semibold no-underline transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

const menuItemInactiveClassName =
  "border-transparent text-gray-400 hover:bg-white/5 hover:text-white [&_svg]:text-gray-500 hover:[&_svg]:text-white";

const menuItemActiveClassName =
  "border-brand-gold bg-brand-blue text-brand-gold [&_svg]:text-brand-gold";

function getUserInitial(email?: string | null): string {
  if (!email) return "A";
  return email.charAt(0).toUpperCase();
}

function getRoleLabel(role?: string): string {
  if (role === "Admin") return "Administrador";
  return "Usuario";
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuAbierto, setMenuAbierto] = useState(false);
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
    <div className="relative flex min-h-screen flex-col bg-gray-50 lg:flex-row">
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
          "fixed top-0 z-50 flex h-screen w-64 flex-col justify-between bg-[#0b172a] text-gray-300 transition-transform duration-300 lg:sticky lg:translate-x-0",
          menuAbierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Menú del panel administrativo"
      >
        <div>
          <div className="border-b border-gray-800 p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold bg-brand-blue">
                <span className="font-heading text-sm font-bold text-brand-gold">SB</span>
              </div>
              <div className="min-w-0">
                <span className="block truncate font-heading text-sm font-bold text-white">
                  San Blas Nicoya
                </span>
                <span className="block font-mono text-[9px] tracking-wider text-brand-gold uppercase">
                  Panel de control
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={menuItemBaseClassName}
                  inactiveProps={{ className: menuItemInactiveClassName }}
                  activeProps={{ className: menuItemActiveClassName }}
                  activeOptions={{ exact: link.to === Rutas.dashboard }}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-800 bg-[#070f1d] p-4 text-xs">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold font-heading text-[10px] font-bold text-brand-blue uppercase">
              {getUserInitial(user?.email)}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-[11px] font-bold text-white">
                {getRoleLabel(user?.role)}
              </p>
              <p className="truncate text-[9px] text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={Rutas.home}
              className="w-full rounded bg-white/5 py-1.5 text-center text-[10px] font-semibold text-gray-400 no-underline transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full cursor-pointer rounded border-none bg-red-900/20 py-1.5 text-center text-[10px] font-semibold text-red-400 transition-colors hover:bg-red-900/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="h-[calc(100vh-50px)] flex-1 overflow-y-auto p-4 sm:p-6 lg:h-screen lg:p-8">
        {pathname !== Rutas.dashboard && (
          <header className="mb-4 rounded-[20px] border border-border bg-surface p-4 shadow-sm sm:p-6 lg:mb-6">
            <p className="mb-1.5 text-[0.72rem] font-extrabold tracking-[0.14em] text-brand-gold uppercase">
              Administración
            </p>
            <h1 className="mb-1.5 font-heading text-xl leading-tight text-brand-blue lg:text-3xl">
              {pageInfo.title}
            </h1>
            <p className="max-w-3xl text-sm text-text-secondary">{pageInfo.subtitle}</p>
          </header>
        )}

        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;
