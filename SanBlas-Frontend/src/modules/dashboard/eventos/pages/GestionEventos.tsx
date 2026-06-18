import { useState } from "react";
import { Calendar, MapPin, Pencil, Trash2, Eye } from "lucide-react";
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

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState<EventoPayload>(formularioVacio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

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
      className={`gestion-eventos__badge ${
        publicado
          ? "gestion-eventos__badge--published"
          : "gestion-eventos__badge--draft"
      }`}
    >
      {publicado ? "Publicado" : "Borrador"}
    </span>
  );

  return (
    <section className="gestion-eventos">
      {error && <p className="gestion-eventos__error">{error}</p>}

      <div className="gestion-eventos__actions">
        <button
          type="button"
          className="gestion-eventos__btn"
          onClick={abrirCrear}
        >
          Nuevo evento
        </button>
      </div>

      {cargando ? (
        <p>Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p>No hay eventos registrados.</p>
      ) : (
        <div className="admin-responsive-data">
          <div className="admin-responsive-data__table gestion-eventos__table-wrapper">
            <table className="gestion-eventos__table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha</th>
                <th>Lugar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>{evento.titulo}</td>
                  <td>{formatearFecha(evento.fechaInicio)}</td>
                  <td>{evento.lugar}</td>
                  <td>
                    {renderEstadoBadge(evento.publicado)}
                  </td>
                  <td>
                    <div className="gestion-eventos__actions-cell">
                      <button
                        type="button"
                        className="gestion-eventos__btn gestion-eventos__btn--secondary"
                        onClick={() => abrirEditar(evento)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="gestion-eventos__btn gestion-eventos__btn--danger"
                        onClick={() => handleEliminar(evento.id)}
                        disabled={guardando}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="admin-responsive-data__cards">
            {eventos.map((evento) => (
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
        </div>
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
                  className="gestion-eventos__btn gestion-eventos__btn--secondary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gestion-eventos__btn"
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
