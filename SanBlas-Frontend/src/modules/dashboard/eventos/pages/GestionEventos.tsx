import { useState } from "react";
import {
  eventoToFormulario,
  useGestionEventos,
} from "../hooks/useGestionEventos";
import type { Evento } from "../../../../services/eventosService";
import type { EventoPayload } from "../../../../services/eventosService";
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
  };

  return (
    <section className="gestion-eventos">
      <div className="gestion-eventos__header">
        <h2>Gestión de eventos</h2>
        <p>Cree, edite y publique los eventos de la parroquia.</p>
      </div>

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
        <div className="gestion-eventos__table-wrapper">
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
                    <span
                      className={`gestion-eventos__badge ${
                        evento.publicado
                          ? "gestion-eventos__badge--published"
                          : "gestion-eventos__badge--draft"
                      }`}
                    >
                      {evento.publicado ? "Publicado" : "Borrador"}
                    </span>
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
      )}

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
