import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home,
  Heart,
  FileText,
  HandHeart,
  Calendar,
  Users,
  Edit,
  ScrollText,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";

import Rutas from "../../../routes/Rutas";
import { useAuth } from "../../../context/AuthContext";
import { cn } from "../../../shared/ui";

const navLinks = [
  { to: Rutas.dashboard, label: "Resumen", icon: Home },
  {
    to: Rutas.dashboardUrl.registroSacramentos,
    label: "Registro de sacramentos",
    icon: Heart,
  },
  {
    to: Rutas.dashboardUrl.constanciasSacramentos,
    label: "Solicitudes de constancia",
    icon: ScrollText,
  },
  {
    to: Rutas.dashboardUrl.solicitudesCatequesis,
    label: "Solicitudes de catequesis",
    icon: FileText,
  },
  {
    to: Rutas.dashboardUrl.donaciones,
    label: "Gestión de donaciones",
    icon: HandHeart,
  },
  {
    to: Rutas.dashboardUrl.eventos,
    label: "Gestión de eventos",
    icon: Calendar,
  },
  {
    to: Rutas.dashboardUrl.gestionLanding,
    label: "Gestión del landing",
    icon: Edit,
  },
  {
    to: Rutas.dashboardUrl.gestionUsuarios,
    label: "Gestión de usuarios",
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

const menuItemClassName =
  "flex w-full min-h-11 cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent px-3.5 py-3.5 text-left text-[15px] font-bold text-text-secondary no-underline transition-colors hover:bg-gray-100 hover:text-royal-blue focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

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
    <section className="relative flex min-h-[calc(100vh-80px)] bg-surface-muted">
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-[1050] border-none bg-slate-900/45 opacity-0 pointer-events-none transition-opacity duration-200 lg:hidden",
          menuAbierto && "opacity-100 pointer-events-auto",
        )}
        aria-label="Cerrar menú"
        onClick={() => setMenuAbierto(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-[1060] flex h-dvh w-[min(86vw,300px)] -translate-x-[105%] flex-col border-r border-border bg-surface px-4 py-5 shadow-[8px_0_24px_rgba(15,23,42,0.08)] transition-transform duration-[250ms] ease-in-out",
          "lg:sticky lg:top-0 lg:z-auto lg:h-auto lg:min-h-[calc(100vh-80px)] lg:w-[270px] lg:translate-x-0 lg:shadow-none",
          menuAbierto && "translate-x-0",
        )}
        aria-label="Menú del panel administrativo"
      >
        <div className="mb-6 flex items-center gap-3 px-1.5">
          <div className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-royal-blue text-royal-gold">
            <Shield size={22} />
          </div>
          <div>
            <h2 className="mb-1.5 font-heading text-[22px] font-extrabold text-royal-blue">
              Panel Admin
            </h2>
            <p className="text-xs font-black tracking-[0.2em] text-royal-gold uppercase">
              Parroquia San Blas
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-none bg-slate-100 text-slate-700 lg:hidden focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={menuItemClassName}
                activeProps={{
                  className: cn(
                    menuItemClassName,
                    "bg-royal-blue text-white hover:bg-royal-blue hover:text-white [&_svg]:text-royal-gold",
                  ),
                }}
                activeOptions={{ exact: link.to === Rutas.dashboard }}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-2 pt-4">
          <p className="mb-3 break-words text-[0.82rem] text-slate-600">{user?.email}</p>
          <button
            type="button"
            className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-slate-300 bg-surface px-3 py-2 text-[0.85rem] font-semibold text-royal-blue hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="w-full flex-1 p-4 sm:px-6 sm:py-5 lg:p-8 lg:px-9">
        <header className="mb-4 flex items-start gap-3.5 rounded-[20px] border border-border bg-surface p-4 px-[1.1rem] shadow-[0_10px_25px_rgba(15,23,42,0.04)] lg:mb-6 lg:p-6 lg:px-7">
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-surface text-royal-blue lg:hidden focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="mb-1.5 text-[0.72rem] font-extrabold tracking-[0.14em] text-royal-gold uppercase">
              Administración
            </p>
            <h1 className="mb-1.5 font-heading text-[1.45rem] leading-tight text-royal-blue lg:text-[1.85rem]">
              {pageInfo.title}
            </h1>
            <p className="max-w-[720px] text-[0.95rem] text-text-secondary">
              {pageInfo.subtitle}
            </p>
          </div>
        </header>

        <div>
          <Outlet />
        </div>
      </main>
    </section>
  );
}

export default Dashboard;
