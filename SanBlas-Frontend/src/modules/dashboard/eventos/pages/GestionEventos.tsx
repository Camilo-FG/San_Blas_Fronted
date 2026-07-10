import { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  Eye,
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
import {
  AdminModule,
  AdminSearch,
  AdminToolbar,
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Input,
  Label,
  Modal,
  Textarea,
} from "../../../../shared/ui";

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
    <Badge variant={publicado ? "success" : "neutral"}>
      {publicado ? "Publicado" : "Borrador"}
    </Badge>
  );

  return (
    <AdminModule>
      {error && <ErrorMessage message={error} />}

      <AdminToolbar>
        <AdminSearch
          placeholder="Buscar eventos..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          aria-label="Buscar eventos"
        />
        <Button variant="primary" onClick={abrirCrear}>
          <Plus size={18} />
          Nuevo evento
        </Button>
      </AdminToolbar>

      {cargando ? (
        <EmptyState title="Cargando eventos..." />
      ) : eventosFiltrados.length === 0 ? (
        <EmptyState
          title={
            busqueda
              ? "No se encontraron eventos con ese criterio."
              : "No hay eventos registrados."
          }
        />
      ) : (
        <>
          <div className="hidden gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] lg:grid-cols-3">
            {eventosFiltrados.map((evento) => (
              <article
                key={evento.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`relative flex min-h-32 items-center justify-center text-white/90 ${
                    evento.publicado
                      ? "bg-gradient-to-br from-teal to-teal-hover"
                      : "bg-gradient-to-br from-slate-500 to-slate-400"
                  }`}
                >
                  <CalendarDays size={42} />
                  <span
                    className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-wide uppercase ${
                      evento.publicado
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {evento.publicado ? "Evento" : "Borrador"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="m-0 text-base font-extrabold leading-snug text-slate-900">
                    {evento.titulo}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                    <span>{formatearFecha(evento.fechaInicio)}</span>
                    <span className="rounded-full bg-info-bg px-2 py-0.5 text-xs font-bold text-info">
                      {formatearHora(evento.fechaInicio)}
                    </span>
                  </div>
                  <p className="m-0 line-clamp-3 flex-1 text-sm leading-relaxed text-text-muted">
                    {evento.descripcion}
                  </p>
                  <p className="m-0 flex items-center gap-1.5 text-sm text-text-muted">
                    <MapPin size={14} />
                    {evento.lugar}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                  <Button variant="ghost" onClick={() => abrirEditar(evento)}>
                    <Pencil size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleEliminar(evento.id)}
                    disabled={guardando}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
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
            <Button
              variant="danger"
              onClick={() => handleEliminar(eventoSeleccionado.id)}
              disabled={guardando}
            >
              <Trash2 size={16} />
              Eliminar
            </Button>
          ) : undefined
        }
      >
        {eventoSeleccionado && (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <p className="m-0 text-sm text-slate-600">
                <strong className="text-slate-800">Lugar:</strong> {eventoSeleccionado.lugar}
              </p>
              <p className="m-0 text-sm text-slate-600">
                <strong className="text-slate-800">Fecha fin:</strong>{" "}
                {eventoSeleccionado.fechaFin
                  ? formatearFecha(eventoSeleccionado.fechaFin)
                  : "No definida"}
              </p>
            </div>
            <div className="mt-4">
              <strong className="text-sm text-slate-800">Descripción</strong>
              <p className="mt-1.5 rounded-xl border border-border-strong bg-surface-muted p-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                {eventoSeleccionado.descripcion}
              </p>
            </div>
          </>
        )}
      </AdminRecordDetailSheet>

      {modalAbierto && (
        <Modal onClose={cerrarModal} title={editandoId ? "Editar evento" : "Nuevo evento"}>
          <h3 className="mb-4 pr-10 text-lg font-bold text-royal-blue">
            {editandoId ? "Editar evento" : "Nuevo evento"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formulario.titulo}
                onChange={(e) =>
                  setFormulario({ ...formulario, titulo: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
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

            <div>
              <Label htmlFor="fechaInicio">Fecha de inicio</Label>
              <Input
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

            <div>
              <Label htmlFor="fechaFin">Fecha de fin (opcional)</Label>
              <Input
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

            <div>
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                value={formulario.lugar}
                onChange={(e) =>
                  setFormulario({ ...formulario, lugar: e.target.value })
                }
                required
              />
            </div>

            <Label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formulario.publicado}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    publicado: e.target.checked,
                  })
                }
              />
              Publicado en el sitio web
            </Label>

            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AdminModule>
  );
};

export default GestionEventos;
