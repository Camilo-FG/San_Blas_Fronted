import { Link, Outlet, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";

import Rutas from "../../../routes/Rutas";
import { useAuth } from "../../../context/AuthContext";
import "./Dashboard.css";

const navLinks = [
  { to: Rutas.dashboard, label: "Dashboard principal", icon: Home },
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

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: Rutas.login });
  };

  return (
    <section className="dashboard">
      <aside className="dashboard__sidebar">
        <div className="dashboard__brand">
          <h2>Panel Administrativo</h2>
          <p>Parroquia San Blas</p>
        </div>

        <nav className="dashboard__menu">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.to}
                to={link.to}
                className="dashboard__menu-item"
              >
                <Icon className="dashboard__menu-lucide" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="dashboard__content">
        <header className="dashboard__topbar">
          <div>
            <h1>Panel Administrativo</h1>
            <p>Parroquia San Blas</p>
          </div>

          <div className="dashboard__user">
            <span>{user?.email}</span>
            <button
              type="button"
              className="dashboard__logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
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
