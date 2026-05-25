import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  Home,
  Heart,
  FileText,
  HandHeart,
  Calendar,
  Users,
  Edit,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import "./Dashboard.css";

const navLinks = [
  { to: "/admin", label: "Dashboard principal", icon: Home },

  {
    label: "Sacramentos",
    icon: Heart,
    hasSubmenu: true,
    submenu: [
      {
        to: "/admin/sacramentos",
        label: "Gestión de sacramentos",
        icon: Heart,
      },
      {
        to: "/admin/sacramentos/solicitudes",
        label: "Solicitudes de sacramentos",
        icon: FileText,
      },
    ],
  },

  {
    label: "Catequesis",
    icon: FileText,
    hasSubmenu: true,
    submenu: [
      {
        to: "/admin/catequesis/solicitudes",
        label: "Solicitudes de catequesis",
        icon: FileText,
      },
    ],
  },

  {
    label: "Donaciones",
    icon: HandHeart,
    hasSubmenu: true,
    submenu: [
      {
        to: "/admin/donaciones",
        label: "Gestión de donaciones",
        icon: HandHeart,
      },
    ],
  },

  {
    label: "Eventos",
    icon: Calendar,
    hasSubmenu: true,
    submenu: [
      {
        to: "/admin/eventos",
        label: "Gestión de eventos",
        icon: Calendar,
      },
    ],
  },

  {
    to: "/admin/landing",
    label: "Gestión del landing",
    icon: Edit,
  },

  {
    to: "/admin/usuarios",
    label: "Gestión de usuarios",
    icon: Users,
  },

  {
    to: "/admin/perfil",
    label: "Mi perfil",
    icon: Settings,
  },
];

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }

      return newSet;
    });
  };

  return (
    <section className="dashboard">
      <aside
        className={`dashboard__sidebar ${
          sidebarOpen ? "dashboard__sidebar--open" : ""
        }`}
      >
        <div className="dashboard__brand">
          <h2>Panel Administrativo</h2>
          <p>Parroquia San Blas</p>
        </div>

        <nav className="dashboard__menu">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isExpanded = expandedMenus.has(link.label);

            if (link.hasSubmenu && link.submenu) {
              return (
                <div
                  key={link.label}
                  className="dashboard__submenu-group"
                >
                  <button
                    type="button"
                    className="dashboard__menu-item"
                    onClick={() => toggleSubmenu(link.label)}
                  >
                    <Icon className="dashboard__menu-lucide" />

                    <span>{link.label}</span>

                    <span className="dashboard__chevron">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="dashboard__submenu">
                      {link.submenu.map((subLink) => {
                        const SubIcon = subLink.icon;

                        return (
                          <Link
                            key={subLink.to}
                            to={subLink.to}
                            className="dashboard__submenu-item"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <SubIcon className="dashboard__menu-lucide" />
                            <span>{subLink.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                className="dashboard__menu-item"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="dashboard__menu-lucide" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="dashboard__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="dashboard__content">
        <header className="dashboard__topbar">
          <button
            className="dashboard__mobile-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div>
            <h1>Panel Administrativo</h1>
            <p>Parroquia San Blas</p>
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
