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
import "../../../shared/components/admin/adminDataView.css";
import "./Dashboard.css";

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
    <section className="dashboard">
      <button
        type="button"
        className={`dashboard__backdrop ${menuAbierto ? "dashboard__backdrop--visible" : ""}`}
        aria-label="Cerrar menú"
        onClick={() => setMenuAbierto(false)}
      />

      <aside
        className={`dashboard__sidebar ${menuAbierto ? "dashboard__sidebar--open" : ""}`}
        aria-label="Menú del panel administrativo"
      >
        <div className="dashboard__brand">
          <div className="dashboard__brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <h2>Panel Admin</h2>
            <p>Parroquia San Blas</p>
          </div>
          <button
            type="button"
            className="dashboard__menu-close"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="dashboard__menu">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.to}
                to={link.to}
                className="dashboard__menu-item"
                activeProps={{ className: "dashboard__menu-item dashboard__menu-item--active" }}
                activeOptions={{ exact: link.to === Rutas.dashboard }}
              >
                <Icon className="dashboard__menu-lucide" size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="dashboard__sidebar-footer">
          <p className="dashboard__sidebar-user">{user?.email}</p>
          <button
            type="button"
            className="dashboard__logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="dashboard__content">
        <header className="dashboard__topbar">
          <button
            type="button"
            className="dashboard__menu-toggle"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <Menu size={20} />
          </button>

          <div className="dashboard__page-heading">
            <p className="dashboard__eyebrow">Administración</p>
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.subtitle}</p>
          </div>
        </header>

        <div className="dashboard__page-content">
          <Outlet />
        </div>
      </main>
    </section>
  );
}

export default Dashboard;
