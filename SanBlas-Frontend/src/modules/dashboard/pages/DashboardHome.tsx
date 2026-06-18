import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  HandHeart,
  Heart,
  ScrollText,
  Users,
  Calendar,
} from "lucide-react";
import {
  obtenerEstadisticasDashboard,
  type DashboardStats,
} from "../../../services/dashboardService";
import { ApiError } from "../../../services/apiClient";
import Rutas from "../../../routes/Rutas";
import "./Dashboard.css";

const cardsConfig: Array<{
  key: keyof DashboardStats;
  icon: typeof Heart;
  label: string;
  color: string;
  link?: string;
}> = [
  {
    key: "solicitudesCatequesis",
    icon: FileText,
    label: "Solicitudes de catequesis",
    color: "#0f766e",
    link: Rutas.dashboardUrl.solicitudesCatequesis,
  },
  {
    key: "solicitudesConstancias",
    icon: ScrollText,
    label: "Solicitudes de constancia",
    color: "#1d4ed8",
    link: Rutas.dashboardUrl.constanciasSacramentos,
  },
  {
    key: "registrosSacramentos",
    icon: Heart,
    label: "Registros de sacramentos",
    color: "#be123c",
    link: Rutas.dashboardUrl.registroSacramentos,
  },
  {
    key: "donaciones",
    icon: HandHeart,
    label: "Donaciones registradas",
    color: "#b45309",
    link: Rutas.dashboardUrl.donaciones,
  },
  {
    key: "eventos",
    icon: Calendar,
    label: "Eventos registrados",
    color: "#7c3aed",
    link: Rutas.dashboardUrl.eventos,
  },
  {
    key: "usuarios",
    icon: Users,
    label: "Usuarios registrados",
    color: "#003366",
    link: Rutas.dashboardUrl.gestionUsuarios,
  },
];

function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerEstadisticasDashboard();
        setStats(data);
      } catch (err) {
        const mensaje =
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las estadísticas del dashboard.";
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (cargando) {
    return (
      <div className="dashboard__loading-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="dashboard__card dashboard__card--skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="dashboard__error">{error}</p>;
  }

  return (
    <div className="dashboard-home">
      <section className="dashboard-home__welcome">
        <h2>Bienvenido al panel administrativo</h2>
        <p>
          Desde aquí puede revisar solicitudes, gestionar contenido público y
          mantener actualizada la información pastoral de la parroquia.
        </p>
      </section>

      <div className="dashboard__cards">
        {cardsConfig.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key] ?? 0;

          const content = (
            <article
              key={card.key}
              className="dashboard__card dashboard__card--interactive"
              style={{ "--card-accent": card.color } as React.CSSProperties}
            >
              <div className="dashboard__card-top">
                <span className="dashboard__card-icon-wrap">
                  <Icon size={20} />
                </span>
                <p>{card.label}</p>
              </div>
              <h3>{value}</h3>
            </article>
          );

          return card.link ? (
            <Link key={card.key} to={card.link} className="dashboard__card-link">
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
}

export default DashboardHome;
