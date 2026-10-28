import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  DashboardChartSlice,
  DashboardGraficos,
  DashboardStats,
} from "../../../services/dashboardService";

const COLORES = [
  "#0f766e",
  "#1d4ed8",
  "#be123c",
  "#b45309",
  "#7c3aed",
  "#003366",
  "#d4af37",
  "#047857",
];

const COLORES_ESTADO: Record<string, string> = {
  Pendiente: "#b45309",
  Aprobada: "#047857",
  Aprobado: "#047857",
  Rechazada: "#b91c1c",
  Rechazado: "#b91c1c",
  Archivado: "#64748b",
  borrador: "#64748b",
  publicado: "#047857",
  desactivado: "#b91c1c",
};

const ETIQUETAS_TIPO: Record<string, string> = {
  bautismo: "Bautismo",
  comunion: "Comunión",
  confirmacion: "Confirmación",
  matrimonio: "Matrimonio",
};

const ETIQUETAS_EVENTO: Record<string, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  desactivado: "Desactivado",
};

const MESES_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type ModuloPermiso =
  | "catequesis"
  | "constancias"
  | "sacramentos"
  | "donaciones"
  | "eventos"
  | "usuarios";

interface DashboardChartsProps {
  stats: DashboardStats;
  tienePermiso: (permiso: string) => boolean;
}

function formatearMes(mes: string): string {
  const [, m] = mes.split("-");
  const idx = Number(m) - 1;
  return MESES_ES[idx] ?? mes;
}

function etiquetaSlice(
  etiqueta: string,
  mapa?: Record<string, string>,
): string {
  return mapa?.[etiqueta] ?? etiqueta;
}

function colorSlice(etiqueta: string, index: number): string {
  return COLORES_ESTADO[etiqueta] ?? COLORES[index % COLORES.length];
}

function ChartCard({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-3 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]">
      <h3 className="mb-1.5 m-0 text-xs font-bold text-royal-blue dark:text-[#d9a928]">
        {title}
      </h3>
      {empty ? (
        <p className="m-0 py-6 text-center text-sm text-text-muted dark:text-[#7f8da3]">
          Sin datos para graficar
        </p>
      ) : (
        <div className="h-32 w-full min-w-0 sm:h-36">{children}</div>
      )}
    </article>
  );
}

function PieEstado({
  data,
  mapaEtiquetas,
}: {
  data: DashboardChartSlice[];
  mapaEtiquetas?: Record<string, string>;
}) {
  const chartData = data.map((d) => ({
    name: etiquetaSlice(d.etiqueta, mapaEtiquetas),
    value: d.total,
    etiqueta: d.etiqueta,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={46}
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.etiqueta}
              fill={colorSlice(entry.etiqueta, index)}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [Number(value ?? 0), "Total"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={28}
          wrapperStyle={{ fontSize: 10 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function DashboardCharts({ stats, tienePermiso }: DashboardChartsProps) {
  const g: DashboardGraficos = stats.graficos;
  const puede = (p: ModuloPermiso) => tienePermiso(p);

  const resumenModulos = [
    puede("catequesis") && {
      name: "Catequesis",
      total: stats.solicitudesCatequesis,
      fill: "#0f766e",
    },
    puede("constancias") && {
      name: "Constancias",
      total: stats.solicitudesConstancias,
      fill: "#1d4ed8",
    },
    puede("sacramentos") && {
      name: "Sacramentos",
      total: stats.registrosSacramentos,
      fill: "#be123c",
    },
    puede("donaciones") && {
      name: "Donaciones",
      total: stats.donaciones,
      fill: "#b45309",
    },
    puede("eventos") && {
      name: "Eventos",
      total: stats.eventos,
      fill: "#7c3aed",
    },
    puede("usuarios") && {
      name: "Usuarios",
      total: stats.usuarios,
      fill: "#003366",
    },
  ].filter(Boolean) as { name: string; total: number; fill: string }[];

  const seriesMensual = g.actividadMensual.map((m) => ({
    mes: formatearMes(m.mes),
    ...(puede("catequesis") ? { Catequesis: m.catequesis } : {}),
    ...(puede("constancias") ? { Constancias: m.constancias } : {}),
    ...(puede("sacramentos") ? { Sacramentos: m.sacramentos } : {}),
    ...(puede("donaciones") ? { Donaciones: m.donaciones } : {}),
  }));

  const lineasMensuales = [
    puede("catequesis") && { key: "Catequesis", color: "#0f766e" },
    puede("constancias") && { key: "Constancias", color: "#1d4ed8" },
    puede("sacramentos") && { key: "Sacramentos", color: "#be123c" },
    puede("donaciones") && { key: "Donaciones", color: "#b45309" },
  ].filter(Boolean) as { key: string; color: string }[];

  const pies = [
    puede("catequesis") && {
      key: "catequesis",
      title: "Catequesis por estado",
      data: g.catequesisPorEstado,
    },
    puede("constancias") && {
      key: "constancias",
      title: "Constancias por estado",
      data: g.constanciasPorEstado,
    },
    puede("sacramentos") && {
      key: "sacramentos",
      title: "Registros por tipo de sacramento",
      data: g.sacramentosPorTipo,
      mapa: ETIQUETAS_TIPO,
    },
    puede("donaciones") && {
      key: "donaciones",
      title: "Donaciones por estado",
      data: g.donacionesPorEstado,
    },
    puede("eventos") && {
      key: "eventos",
      title: "Eventos por estado",
      data: g.eventosPorEstado,
      mapa: ETIQUETAS_EVENTO,
    },
  ].filter(Boolean) as {
    key: string;
    title: string;
    data: DashboardChartSlice[];
    mapa?: Record<string, string>;
  }[];

  if (resumenModulos.length === 0 && pies.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="m-0 mb-1 font-heading text-xl text-royal-blue dark:text-[#e8eef7]">
          Indicadores
        </h2>
        <p className="m-0 text-sm text-text-muted dark:text-[#7f8da3]">
          Resumen visual de la actividad en los módulos a los que tiene acceso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:gap-4">
        {resumenModulos.length > 0 && (
          <ChartCard title="Totales por módulo" empty={resumenModulos.every((d) => d.total === 0)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumenModulos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0), "Total"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {resumenModulos.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {lineasMensuales.length > 0 && (
          <ChartCard
            title="Actividad de los últimos 6 meses"
            empty={seriesMensual.every((m) =>
              lineasMensuales.every((l) => Number((m as Record<string, unknown>)[l.key] ?? 0) === 0),
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesMensual} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {lineasMensuales.map((linea) => (
                  <Line
                    key={linea.key}
                    type="monotone"
                    dataKey={linea.key}
                    stroke={linea.color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {pies.map((pie) => (
          <ChartCard
            key={pie.key}
            title={pie.title}
            empty={pie.data.length === 0 || pie.data.every((d) => d.total === 0)}
          >
            <PieEstado data={pie.data} mapaEtiquetas={pie.mapa} />
          </ChartCard>
        ))}
      </div>
    </section>
  );
}

export default DashboardCharts;
