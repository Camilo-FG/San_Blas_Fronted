import { useEffect, useState } from "react";
import {
  obtenerEstadisticasDashboard,
  type DashboardStats,
} from "../../../services/dashboardService";
import { ApiError } from "../../../services/apiClient";
import "./Dashboard.css";

const cardsConfig: Array<{
  key: keyof DashboardStats;
  icon: string;
  label: string;
}> = [
  { key: "solicitudesCatequesis", icon: "SC", label: "Solicitudes de catequesis" },
  {
    key: "solicitudesConstancias",
    icon: "SS",
    label: "Solicitudes de constancia de sacramento",
  },
  { key: "registrosSacramentos", icon: "RS", label: "Registros de sacramentos" },
  { key: "donaciones", icon: "DO", label: "Donaciones registradas" },
  { key: "eventos", icon: "EV", label: "Eventos registrados" },
  { key: "usuarios", icon: "GU", label: "Usuarios registrados" },
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
    return <p>Cargando estadísticas...</p>;
  }

  if (error) {
    return <p className="dashboard__error">{error}</p>;
  }

  return (
    <div className="dashboard__cards">
      {cardsConfig.map((card) => (
        <article key={card.key} className="dashboard__card">
          <span className="dashboard__card-icon">{card.icon}</span>
          <p>{card.label}</p>
          <h3>{stats?.[card.key] ?? 0}</h3>
        </article>
      ))}
    </div>
  );
}

export default DashboardHome;
