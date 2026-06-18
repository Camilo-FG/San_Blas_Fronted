import { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  Search,
  Plus,
  CalendarDays,
} from "lucide-react";
import {
  eventoToFormulario,
  useGestionEventos,
} from "../hooks/useGestionEventos";
import type { Evento } from "../../../../services/eventosService";
import type { EventoPayload } from "../../../../services/eventosService";
import { AdminRecordCard } from "../../../../shared/components/admin/AdminRecordCard";
import { AdminRecordDetailSheet } from "../../../../shared/components/admin/AdminRecordDetailSheet";
import "./GestionEventos.css";

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatearHora = (fecha: string) =>
  new Date(fecha).toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
  });

const GestionEventos = () => {
  const {
    eventos,
    cargando,
    guardando,
    error,
    formularioVacio,
    guardarEvento,
    borrarEvento,
  } = useGestionEventos();

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState<EventoPayload>(formularioVacio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  const eventosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return eventos;

    return eventos.filter((evento) =>
      [evento.titulo, evento.descripcion, evento.lugar]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [busqueda, eventos]);

  const abrirCrear = () => {
    setEditandoId(null);
    setFormulario(formularioVacio());
    setModalAbierto(true);
  };

  const abrirEditar = (evento: Evento) => {
    setEditandoId(evento.id);
    setFormulario(eventoToFormulario(evento));
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormulario(formularioVacio());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const exito = await guardarEvento(formulario, editandoId ?? undefined);
    if (exito) cerrarModal();
  };

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm("¿Desea eliminar este evento?");
    if (!confirmar) return;
    await borrarEvento(id);
    setEventoSeleccionado(null);
  };

  const renderEstadoBadge = (publicado: boolean) => (
    <span
      className={`admin-status-badge ${
        publicado ? "admin-status-badge--success" : "admin-status-badge--neutral"
      }`}
    >
      {publicado ? "Publicado" : "Borrador"}
    </span>
  );

  return (
    <section className="admin-module gestion-eventos">
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <Search size={18} className="admin-toolbar__search-icon" />
          <input
            type="search"
            className="admin-search"
            placeholder="Buscar eventos..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            aria-label="Buscar eventos"
          />
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={abrirCrear}>
          <Plus size={18} />
          Nuevo evento
        </button>
      </div>

      {cargando ? (
        <p className="admin-empty">Cargando eventos...</p>
      ) : eventosFiltrados.length === 0 ? (
        <p className="admin-empty">
          {busqueda
            ? "No se encontraron eventos con ese criterio."
            : "No hay eventos registrados."}
        </p>
      ) : (
        <>
          <div className="admin-event-grid">
            {eventosFiltrados.map((evento) => (
              <article key={evento.id} className="admin-event-card">
                <div
                  className={`admin-event-card__cover ${
                    evento.publicado ? "" : "admin-event-card__cover--draft"
                  }`}
                >
                  <CalendarDays size={42} />
                  <span
                    className={`admin-event-card__type ${
                      evento.publicado
                        ? "admin-event-card__type--published"
                        : "admin-event-card__type--draft"
                    }`}
                  >
                    {evento.publicado ? "Evento" : "Borrador"}
                  </span>
                </div>

                <div className="admin-event-card__body">
                  <h3 className="admin-event-card__title">{evento.titulo}</h3>
                  <div className="admin-event-card__meta">
                    <span>{formatearFecha(evento.fechaInicio)}</span>
                    <span className="admin-event-card__time">
                      {formatearHora(evento.fechaInicio)}
                    </span>
                  </div>
                  <p className="admin-event-card__desc">{evento.descripcion}</p>
                  <p className="admin-event-card__meta">
                    <MapPin size={14} />
                    {evento.lugar}
                  </p>
                </div>

                <div className="admin-event-card__footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => abrirEditar(evento)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => handleEliminar(evento.id)}
                    disabled={guardando}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="admin-responsive-data__cards">
            {eventosFiltrados.map((evento) => (
              <AdminRecordCard
                key={evento.id}
                icon={<Calendar size={20} />}
                accent={evento.publicado ? "#047857" : "#b45309"}
                code={`EVT-${evento.id}`}
                title={evento.titulo}
                subtitle={evento.lugar}
                badges={renderEstadoBadge(evento.publicado)}
                meta={[
                  {
                    icon: <Calendar size={12} />,
                    label: "Fecha",
                    value: formatearFecha(evento.fechaInicio),
                  },
                  {
                    icon: <MapPin size={12} />,
                    label: "Lugar",
                    value: evento.lugar,
                  },
                ]}
                actions={[
                  {
                    label: "Editar",
                    icon: <Pencil size={15} />,
                    variant: "ghost",
                    onClick: () => abrirEditar(evento),
                  },
                  {
                    label: "Ver evento",
                    icon: <Eye size={15} />,
                    variant: "primary",
                    onClick: () => setEventoSeleccionado(evento),
                  },
                  {
                    label: "Eliminar",
                    icon: <Trash2 size={15} />,
                    variant: "danger",
                    disabled: guardando,
                    onClick: () => handleEliminar(evento.id),
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}

      <AdminRecordDetailSheet
        open={eventoSeleccionado !== null}
        title={eventoSeleccionado?.titulo ?? "Evento"}
        subtitle={eventoSeleccionado ? formatearFecha(eventoSeleccionado.fechaInicio) : undefined}
        badges={eventoSeleccionado ? renderEstadoBadge(eventoSeleccionado.publicado) : undefined}
        onClose={() => setEventoSeleccionado(null)}
        primaryAction={
          eventoSeleccionado
            ? {
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: () => {
                  abrirEditar(eventoSeleccionado);
                  setEventoSeleccionado(null);
                },
              }
            : undefined
        }
        actions={
          eventoSeleccionado ? (
            <button
              type="button"
              className="admin-detail-action admin-detail-action--danger"
              onClick={() => handleEliminar(eventoSeleccionado.id)}
              disabled={guardando}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          ) : undefined
        }
      >
        {eventoSeleccionado && (
          <>
            <div className="admin-detail-fields">
              <p className="admin-detail-field"><strong>Lugar:</strong> {eventoSeleccionado.lugar}</p>
              <p className="admin-detail-field">
                <strong>Fecha fin:</strong>{" "}
                {eventoSeleccionado.fechaFin
                  ? formatearFecha(eventoSeleccionado.fechaFin)
                  : "No definida"}
              </p>
            </div>
            <div className="admin-detail-block">
              <strong>Descripción</strong>
              <p className="admin-detail-block__content">{eventoSeleccionado.descripcion}</p>
            </div>
          </>
        )}
      </AdminRecordDetailSheet>

      {modalAbierto && (
        <div className="gestion-eventos__modal-backdrop">
          <div className="gestion-eventos__modal">
            <h3>{editandoId ? "Editar evento" : "Nuevo evento"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="gestion-eventos__field">
                <label htmlFor="titulo">Título</label>
                <input
                  id="titulo"
                  value={formulario.titulo}
                  onChange={(e) =>
                    setFormulario({ ...formulario, titulo: e.target.value })
                  }
                  required
                />
              </div>

              <div className="gestion-eventos__field">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={formulario.descripcion}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      descripcion: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="gestion-eventos__field">
                <label htmlFor="fechaInicio">Fecha de inicio</label>
                <input
                  id="fechaInicio"
                  type="date"
                  value={formulario.fechaInicio}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      fechaInicio: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="gestion-eventos__field">
                <label htmlFor="fechaFin">Fecha de fin (opcional)</label>
                <input
                  id="fechaFin"
                  type="date"
                  value={formulario.fechaFin ?? ""}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      fechaFin: e.target.value || null,
                    })
                  }
                />
              </div>

              <div className="gestion-eventos__field">
                <label htmlFor="lugar">Lugar</label>
                <input
                  id="lugar"
                  value={formulario.lugar}
                  onChange={(e) =>
                    setFormulario({ ...formulario, lugar: e.target.value })
                  }
                  required
                />
              </div>

              <div className="gestion-eventos__field">
                <label>
                  <input
                    type="checkbox"
                    checked={formulario.publicado}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        publicado: e.target.checked,
                      })
                    }
                  />{" "}
                  Publicado en el sitio web
                </label>
              </div>

              <div className="gestion-eventos__modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default GestionEventos;
