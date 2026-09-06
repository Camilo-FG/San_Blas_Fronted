import SeoHead from "../../../seo/SeoHead";
import { getEventSchema } from "../../../seo/structuredData";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { obtenerEventosPublicos, type Evento } from "../../../services/eventosService";
import { ApiError } from "../../../services/apiClient";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Search } from "lucide-react";
import {
  AdminPagination,
  AdminPaginationButton,
  AdminTableFooter,
  Input,
  Label,
  ScrollReveal,
} from "../../../shared/ui";
import {
  extraerFechaCalendario,
  formatearFechaCalendario,
  formatearHoraEvento,
} from "../../../shared/utils/fechas";
import { ModalEvento } from "../components/ModalEvento";

const TAMANOS_PAGINA = [6, 9, 12] as const;
const TAMANO_PAGINA_INICIAL = 6;

const normalizarTexto = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const minutosHora = (hora?: string | null) => {
  const match = String(hora ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
};

const formatearFecha = (fecha: string) =>
  formatearFechaCalendario(fecha, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function PortadaEvento({ imagenUrl }: { imagenUrl?: string | null }) {
  const [imagenRota, setImagenRota] = useState(false);

  useEffect(() => {
    setImagenRota(false);
  }, [imagenUrl]);

  const mostrarImagen = Boolean(imagenUrl) && !imagenRota;

  return (
    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-royal-blue to-royal-blue-dark max-sm:h-44">
      {mostrarImagen ? (
        <img
          src={imagenUrl ?? undefined}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImagenRota(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-white/90">
          <CalendarDays size={48} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

const EventosPublicPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [busquedaNombre, setBusquedaNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(TAMANO_PAGINA_INICIAL);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerEventosPublicos();
        setEventos(data);
      } catch (err) {
        const mensaje =
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los eventos.";
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!eventoSeleccionado) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEventoSeleccionado(null);
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [eventoSeleccionado]);

  const hayFiltros =
    Boolean(busquedaNombre.trim()) || Boolean(fechaDesde) || Boolean(fechaHasta);

  const eventosFiltrados = useMemo(() => {
    const nombre = normalizarTexto(busquedaNombre);

    return eventos
      .filter((evento) => {
        const coincideNombre =
          !nombre || normalizarTexto(evento.titulo).includes(nombre);
        const fechaEvento = extraerFechaCalendario(evento.fechaInicio);
        const coincideDesde = !fechaDesde || fechaEvento >= fechaDesde;
        const coincideHasta = !fechaHasta || fechaEvento <= fechaHasta;

        return coincideNombre && coincideDesde && coincideHasta;
      })
      .sort((a, b) => {
        const fechaA = extraerFechaCalendario(a.fechaInicio);
        const fechaB = extraerFechaCalendario(b.fechaInicio);
        if (fechaA !== fechaB) return fechaB.localeCompare(fechaA);
        const diferenciaHora = minutosHora(b.hora) - minutosHora(a.hora);
        if (diferenciaHora !== 0) return diferenciaHora;
        return b.id - a.id;
      });
  }, [busquedaNombre, eventos, fechaDesde, fechaHasta]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(eventosFiltrados.length / registrosPorPagina),
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaNombre, fechaDesde, fechaHasta, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual((pagina) => Math.min(pagina, totalPaginas));
  }, [totalPaginas]);

  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const eventosPagina = eventosFiltrados.slice(
    indiceInicio,
    indiceInicio + registrosPorPagina,
  );

  const primerRegistro = eventosFiltrados.length === 0 ? 0 : indiceInicio + 1;
  const ultimoRegistro = Math.min(
    indiceInicio + registrosPorPagina,
    eventosFiltrados.length,
  );

  return (
    <>
      <SeoHead page="/eventos" jsonLd={eventos.length > 0 ? eventos.map(getEventSchema) : []} />
      <section className="mx-auto max-w-[1200px] px-6 py-12 pb-16">
      <ScrollReveal className="mb-10 text-center" amount={0.4}>
        <header>
          <h1 className="mb-3 font-heading text-4xl text-royal-blue">
            Eventos
          </h1>
          <p className="text-text-muted">
            Actividades, celebraciones y encuentros de la Parroquia San Blas.
          </p>
        </header>
      </ScrollReveal>

      {!cargando && !error && (
        <div className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <Label htmlFor="filtro-nombre-evento">Buscar por nombre</Label>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <Input
                id="filtro-nombre-evento"
                type="search"
                value={busquedaNombre}
                onChange={(event) => setBusquedaNombre(event.target.value)}
                placeholder="Ej: Misa de San Blas"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="filtro-fecha-desde">Desde</Label>
            <Input
              id="filtro-fecha-desde"
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(event) => setFechaDesde(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filtro-fecha-hasta">Hasta</Label>
            <Input
              id="filtro-fecha-hasta"
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(event) => setFechaHasta(event.target.value)}
            />
          </div>
        </div>
      )}

      {cargando && (
        <p className="p-8 text-center text-text-muted">Cargando eventos...</p>
      )}
      {error && (
        <p className="p-8 text-center text-danger">{error}</p>
      )}

      {!cargando && !error && eventos.length === 0 && (
        <p className="p-8 text-center text-text-muted">
          No hay eventos publicados por el momento.
        </p>
      )}

      {!cargando && !error && eventos.length > 0 && eventosFiltrados.length === 0 && (
        <p className="p-8 text-center text-text-muted">
          {hayFiltros
            ? "No se encontraron eventos con esos filtros."
            : "No hay eventos publicados por el momento."}
        </p>
      )}

      {!cargando && !error && eventosFiltrados.length > 0 && (
        <>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 max-sm:grid-cols-1">
          {eventosPagina.map((evento) => {
            const hora = formatearHoraEvento(evento.hora);
            const fechaFin = extraerFechaCalendario(evento.fechaFin);
            return (
            <article
              key={evento.id}
              className="flex h-[560px] flex-col overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_8px_24px_rgba(15,23,42,0.05)] max-sm:h-[540px]"
            >
              <PortadaEvento imagenUrl={evento.imagenUrl} />
              <div className="flex min-h-0 flex-1 flex-col p-5 max-sm:p-4">
                <h2 className="mt-0 mb-2 line-clamp-2 min-h-[3.75rem] font-heading text-[1.5rem] leading-tight text-royal-blue">
                  {evento.titulo}
                </h2>
                <p className="mb-1.5 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
                  <MapPin size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
                  <span className="truncate">{evento.lugar}</span>
                </p>
                <p className="mb-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted">
                  <CalendarDays size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
                  <span className="truncate">{formatearFecha(evento.fechaInicio)}</span>
                </p>
                <p
                  className={`mt-1 mb-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted ${fechaFin ? "" : "invisible"}`}
                >
                  <CalendarDays size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
                  <span className="truncate">
                    Hasta {fechaFin ? formatearFecha(evento.fechaFin ?? "") : "—"}
                  </span>
                </p>
                <p
                  className={`mt-1 mb-0 flex items-center gap-1.5 text-[0.82rem] text-text-muted ${hora ? "" : "invisible"}`}
                >
                  <Clock3 size={14} className="shrink-0 text-royal-gold" aria-hidden="true" />
                  <span className="truncate">{hora || "—"}</span>
                </p>
                <p className="mt-3 mb-3 line-clamp-3 min-h-[5.6rem] text-[1.1rem] leading-[1.7] text-slate-700">
                  {evento.descripcion}
                </p>
                <button
                  type="button"
                  className="mt-auto inline-flex w-full shrink-0 items-center justify-center rounded-[10px] bg-royal-blue px-5 py-3 text-[0.78rem] font-extrabold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue"
                  onClick={() => setEventoSeleccionado(evento)}
                >
                  Ver más
                </button>
              </div>
            </article>
            );
          })}
        </div>
        <AdminTableFooter className="sticky bottom-0 z-10 mt-6! border-t border-border bg-surface/95 pt-4! pb-3 backdrop-blur-sm">
          <span className="text-sm text-text-muted">
            Mostrando{" "}
            <strong className="text-text tabular-nums">
              {primerRegistro}-{ultimoRegistro}
            </strong>{" "}
            de{" "}
            <strong className="text-text tabular-nums">
              {eventosFiltrados.length}
            </strong>{" "}
            registros
          </span>
          <AdminPagination className="flex-wrap">
            <label className="mr-1 flex items-center gap-2 text-sm text-text-muted">
              Registros por página
              <select
                value={registrosPorPagina}
                onChange={(event) =>
                  setRegistrosPorPagina(Number(event.target.value))
                }
                className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm tabular-nums text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
                aria-label="Cantidad de registros por página"
              >
                {TAMANOS_PAGINA.map((tamano) => (
                  <option key={tamano} value={tamano}>
                    {tamano}
                  </option>
                ))}
              </select>
            </label>
            <AdminPaginationButton
              type="button"
              onClick={() => setPaginaActual((pagina) => Math.max(1, pagina - 1))}
              disabled={paginaActual <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </AdminPaginationButton>
            <span className="text-sm whitespace-nowrap text-text-muted">
              Página{" "}
              <strong className="text-text tabular-nums">{paginaActual}</strong>{" "}
              de{" "}
              <strong className="text-text tabular-nums">{totalPaginas}</strong>
            </span>
            <AdminPaginationButton
              type="button"
              onClick={() =>
                setPaginaActual((pagina) => Math.min(totalPaginas, pagina + 1))
              }
              disabled={paginaActual >= totalPaginas}
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </AdminPaginationButton>
          </AdminPagination>
        </AdminTableFooter>
        </>
      )}
    </section>

      <AnimatePresence>
        {eventoSeleccionado ? (
          <ModalEvento
            evento={eventoSeleccionado}
            onCerrar={() => setEventoSeleccionado(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default EventosPublicPage;
