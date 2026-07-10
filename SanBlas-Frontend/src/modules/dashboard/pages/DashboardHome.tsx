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

type CardKey = keyof DashboardStats;

interface CardConfig {
  key: CardKey;
  icon: typeof Heart;
  label: string;
  color: string;
  link?: string;
  hero?: boolean;
}

const cardsConfig: CardConfig[] = [
  {
    key: "solicitudesCatequesis",
    icon: FileText,
    label: "Solicitudes de catequesis",
    color: "#0f766e",
    link: Rutas.dashboardUrl.solicitudesCatequesis,
    hero: true,
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

const MOCK_STATS: DashboardStats = {
  solicitudesCatequesis: 24,
  solicitudesConstancias: 12,
  registrosSacramentos: 47,
  donaciones: 18,
  eventos: 6,
  usuarios: 9,
};

function CardSkeleton({ hero }: { hero?: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-border bg-surface p-6 ${
        hero ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>
      <div className="h-9 w-20 rounded bg-gray-200" />
    </div>
  );
}

function MetricCard({ card, value }: { card: CardConfig; value: number }) {
  const Icon = card.icon;

  return (
    <article
      className={`group relative rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        card.hero ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
      style={{ borderTopWidth: "2px", borderTopColor: card.color }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset"
          style={{
            backgroundColor: `${card.color}14`,
            color: card.color,
            ringColor: `${card.color}33`,
          }}
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p
            className="mb-0 truncate text-[0.72rem] font-extrabold tracking-[0.14em] uppercase"
            style={{ color: card.color }}
          >
            {card.label}
          </p>
          {card.hero && (
            <span className="text-[10px] font-semibold text-text-muted">
              Actividad principal
            </span>
          )}
        </div>
      </div>
      <h3
        className="m-0 text-[32px] font-bold leading-none tracking-tight"
        style={{ fontVariantNumeric: "tabular-nums", color: card.color }}
      >
        {value}
      </h3>
    </article>
  );
}

function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usandoMock, setUsandoMock] = useState(false);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerEstadisticasDashboard();
        setStats(data);
        setUsandoMock(false);
      } catch (err) {
        const mensaje =
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las estadísticas del dashboard.";
        setError(mensaje);
        setStats(MOCK_STATS);
        setUsandoMock(true);
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (cargando) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <CardSkeleton hero />
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-royal-blue px-7 py-8 text-white">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-block h-0.5 w-8 rounded-full bg-royal-gold" />
            <span className="text-[0.65rem] font-extrabold tracking-[0.18em] text-royal-gold uppercase">
              Panel administrativo
            </span>
          </div>
          <h2 className="mb-2 font-heading text-2xl leading-tight lg:text-3xl">
            Bienvenido al panel de administración
          </h2>
          <p className="max-w-[640px] text-sm leading-relaxed text-white/80">
            Revise solicitudes, gestione contenido público y mantenga
            actualizada la información pastoral de la parroquia San Blas.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-royal-gold/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full border border-royal-gold/8" />
      </section>

      {error && usandoMock && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          No se pudo conectar con el backend. Mostrando datos de ejemplo.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {cardsConfig.map((card) => {
          const value = stats?.[card.key] ?? 0;

          const content = <MetricCard card={card} value={value} />;

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
