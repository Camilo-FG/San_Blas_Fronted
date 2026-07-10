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
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[22px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[140px] animate-dashboard-pulse rounded-[22px] border border-border bg-surface p-[26px] shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="m-0 text-danger">{error}</p>;
  }

  return (
    <div>
      <section className="mb-5 rounded-[20px] bg-gradient-to-br from-royal-blue to-royal-blue-dark px-7 py-6 text-white">
        <h2 className="mb-2 font-heading">Bienvenido al panel administrativo</h2>
        <p className="max-w-[760px] text-white/88">
          Desde aquí puede revisar solicitudes, gestionar contenido público y
          mantener actualizada la información pastoral de la parroquia.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[22px]">
        {cardsConfig.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key] ?? 0;

          const content = (
            <article
              key={card.key}
              className="rounded-[22px] border border-border bg-surface p-[26px] shadow-[0_10px_25px_rgba(15,23,42,0.04)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
              style={{ borderTopWidth: "4px", borderTopColor: card.color }}
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${card.color}1f`, color: card.color }}
                >
                  <Icon size={20} />
                </span>
                <p className="mb-0 text-xs font-black tracking-[0.14em] text-gray-400 uppercase">
                  {card.label}
                </p>
              </div>
              <h3 className="m-0 text-[32px] font-black text-royal-blue">{value}</h3>
            </article>
          );

          return card.link ? (
            <Link
              key={card.key}
              to={card.link}
              className="text-inherit no-underline"
            >
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
