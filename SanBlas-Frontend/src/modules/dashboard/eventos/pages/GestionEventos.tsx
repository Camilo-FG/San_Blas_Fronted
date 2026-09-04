import { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  Plus,
  CalendarDays,
  Globe,
  PowerOff,
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
  ConfirmacionAccionModal,
  EmptyState,
  ErrorMessage,
  FieldError,
  Input,
  Label,
  Modal,
  Textarea,
  useToast,
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

type Confirmacion =
  | { tipo: "publicar"; evento?: Evento }
  | { tipo: "desactivar"; evento: Evento }
  | null;

type ErroresFormulario = {
  titulo?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  lugar?: string;
};

const LIMITE_LETRAS = {
  titulo: 50,
  descripcion: 250,
  lugar: 50,
} as const;

const limitarLetras = (valor: string, maximo: number) => valor.slice(0, maximo);

const fechaHoy = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });

const soloFecha = (valor?: string | null) =>
  valor ? valor.slice(0, 10) : "";

const eventoEstaPublicado = (evento?: Evento | null) =>
  Boolean(evento?.publicado && evento.activo);

const ContadorLetras = ({
  valor,
  maximo,
}: {
  valor: string;
  maximo: number;
}) => {
  const alLimite = valor.length >= maximo;

  return (
    <span
      className={
        alLimite
          ? "mt-1 block text-right text-xs font-semibold text-danger"
          : "mt-1 block text-right text-xs text-slate-400"
      }
      aria-live="polite"
    >
      {valor.length}/{maximo} letras
    </span>
  );
};

const GestionEventos = () => {
  const {
    eventos,
    cargando,
    guardando,
    error,
    formularioVacio,
    guardarEvento,
    borrarEvento,
    publicarEventoDesdeFormulario,
    publicarEventoEnLista,
    cambiarDisponibilidadEvento,
  } = useGestionEventos();
  const { showToast } = useToast();

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState<EventoPayload>(formularioVacio());
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);

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

  const eventoEnEdicion =
    editandoId != null
      ? eventos.find((evento) => evento.id === editandoId)
      : undefined;
  const mostrarPublicar = !eventoEstaPublicado(eventoEnEdicion);

  const abrirCrear = () => {
    setEditandoId(null);
    setFormulario(formularioVacio());
    setErrores({});
    setModalAbierto(true);
  };

  const abrirEditar = (evento: Evento) => {
    setEditandoId(evento.id);
    setFormulario(eventoToFormulario(evento));
    setErrores({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormulario(formularioVacio());
    setErrores({});
  };

  const actualizarCampo = <K extends keyof EventoPayload>(
    campo: K,
    valor: EventoPayload[K],
  ) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => {
      if (!prev[campo as keyof ErroresFormulario]) return prev;
      const siguiente = { ...prev };
      delete siguiente[campo as keyof ErroresFormulario];
      return siguiente;
    });
  };

  const validarFormulario = () => {
    const nuevosErrores: ErroresFormulario = {};
    const titulo = formulario.titulo.trim();
    const descripcion = formulario.descripcion.trim();
    const lugar = formulario.lugar.trim();

    if (!titulo) {
      nuevosErrores.titulo = "El título es requerido.";
    } else if (titulo.length > LIMITE_LETRAS.titulo) {
      nuevosErrores.titulo = `El título no puede superar las ${LIMITE_LETRAS.titulo} letras.`;
    }

    if (!descripcion) {
      nuevosErrores.descripcion = "La descripción es requerida.";
    } else if (descripcion.length > LIMITE_LETRAS.descripcion) {
      nuevosErrores.descripcion = `La descripción no puede superar las ${LIMITE_LETRAS.descripcion} letras.`;
    }

    if (!formulario.fechaInicio) {
      nuevosErrores.fechaInicio = "La fecha de inicio es requerida.";
    } else if (formulario.fechaInicio < fechaHoy()) {
      nuevosErrores.fechaInicio =
        "La fecha de inicio no puede ser anterior a la fecha actual.";
    }

    if (formulario.fechaFin) {
      if (formulario.fechaFin < fechaHoy()) {
        nuevosErrores.fechaFin =
          "La fecha de fin no puede ser anterior a la fecha actual.";
      } else if (
        formulario.fechaInicio &&
        formulario.fechaFin < formulario.fechaInicio
      ) {
        nuevosErrores.fechaFin =
          "La fecha de fin no puede ser anterior a la fecha de inicio.";
      }
    }

    if (!lugar) {
      nuevosErrores.lugar = "El lugar es requerido.";
    } else if (lugar.length > LIMITE_LETRAS.lugar) {
      nuevosErrores.lugar = `El lugar no puede superar las ${LIMITE_LETRAS.lugar} letras.`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validarFormulario()) return;
    const resultado = await guardarEvento(formulario, editandoId ?? undefined);
    if (resultado.ok) cerrarModal();
  };

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm("¿Desea eliminar este evento?");
    if (!confirmar) return;
    await borrarEvento(id);
    setEventoSeleccionado(null);
  };

  const solicitarPublicar = () => {
    if (guardando || !mostrarPublicar) return;
    if (!validarFormulario()) return;
    setConfirmacion({ tipo: "publicar" });
  };

  const solicitarPublicarDesdeLista = (evento: Evento) => {
    if (guardando || eventoEstaPublicado(evento)) return;

    const hoy = fechaHoy();
    const inicio = soloFecha(evento.fechaInicio);
    const fin = soloFecha(evento.fechaFin);

    if (inicio < hoy || (fin && fin < hoy)) {
      showToast(
        "No se puede publicar un evento con una fecha anterior a la actual.",
        "error",
      );
      return;
    }

    setConfirmacion({ tipo: "publicar", evento });
  };

  const solicitarDesactivar = (evento: Evento) => {
    if (guardando || !eventoEstaPublicado(evento)) return;
    setConfirmacion({ tipo: "desactivar", evento });
  };

  const cancelarConfirmacion = () => {
    if (guardando) return;
    setConfirmacion(null);
  };

  const sincronizarEventoSeleccionado = (evento: Evento) => {
    setEventoSeleccionado((prev) =>
      prev && prev.id === evento.id ? evento : prev,
    );
  };

  const confirmarPublicar = async () => {
    const eventoEnLista =
      confirmacion?.tipo === "publicar" ? confirmacion.evento : undefined;

    const resultado = eventoEnLista
      ? await publicarEventoEnLista(eventoEnLista.id)
      : await publicarEventoDesdeFormulario(
          formulario,
          editandoId ?? undefined,
        );

    if (resultado.ok) {
      sincronizarEventoSeleccionado(resultado.evento);
      setConfirmacion(null);
      if (!eventoEnLista) {
        setModalAbierto(false);
        setEditandoId(null);
        setFormulario(formularioVacio());
      }
      showToast("Evento publicado correctamente", "success");
      return;
    }

    if (resultado.evento && !eventoEnLista) {
      setEditandoId(resultado.evento.id);
      sincronizarEventoSeleccionado(resultado.evento);
    }

    showToast(
      resultado.mensaje || "No se pudo completar la publicación del evento.",
      "error",
    );
  };

  const confirmarDesactivar = async () => {
    if (confirmacion?.tipo !== "desactivar") return;

    const resultado = await cambiarDisponibilidadEvento(
      confirmacion.evento.id,
      false,
    );

    if (resultado.ok) {
      sincronizarEventoSeleccionado(resultado.evento);
      setConfirmacion(null);
      showToast("Evento desactivado correctamente", "success");
      return;
    }

    showToast(
      resultado.mensaje || "No fue posible actualizar el estado del evento.",
      "error",
    );
  };

  const renderEstadoBadge = (evento: Evento) =>
    eventoEstaPublicado(evento) ? (
      <Badge variant="success">Publicado</Badge>
    ) : (
      <Badge variant="neutral">Desactivado</Badge>
    );

  const etiquetaPortada = (evento: Evento) =>
    eventoEstaPublicado(evento) ? "Publicado" : "Desactivado";

  const botonEstado = (evento: Evento) => {
    if (eventoEstaPublicado(evento)) {
      return (
        <Button
          variant="royal"
          onClick={() => solicitarDesactivar(evento)}
          disabled={guardando}
        >
          <PowerOff size={16} />
          Desactivar evento
        </Button>
      );
    }

    return (
      <Button
        variant="royal"
        onClick={() => solicitarPublicarDesdeLista(evento)}
        disabled={guardando}
      >
        <Globe size={16} />
        Publicar evento
      </Button>
    );
  };

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
        <Button variant="royal" onClick={abrirCrear}>
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
                    eventoEstaPublicado(evento)
                      ? "bg-gradient-to-br from-teal to-teal-hover"
                      : "bg-gradient-to-br from-slate-500 to-slate-400"
                  }`}
                >
                  <CalendarDays size={42} />
                  <span
                    className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-wide uppercase ${
                      eventoEstaPublicado(evento)
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {etiquetaPortada(evento)}
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

                <div className="flex flex-col gap-2 px-4 pb-4">
                  {botonEstado(evento)}
                  <div className="grid grid-cols-2 gap-2">
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
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
            {eventosFiltrados.map((evento) => (
              <AdminRecordCard
                key={evento.id}
                icon={<Calendar size={20} />}
                accent={
                  eventoEstaPublicado(evento) ? "#047857" : "#b45309"
                }
                code={`EVT-${evento.id}`}
                title={evento.titulo}
                subtitle={evento.lugar}
                badges={renderEstadoBadge(evento)}
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
                  eventoEstaPublicado(evento)
                    ? {
                        label: "Desactivar evento",
                        icon: <PowerOff size={15} />,
                        variant: "primary" as const,
                        disabled: guardando,
                        onClick: () => solicitarDesactivar(evento),
                      }
                    : {
                        label: "Publicar evento",
                        icon: <Globe size={15} />,
                        variant: "primary" as const,
                        disabled: guardando,
                        onClick: () => solicitarPublicarDesdeLista(evento),
                      },
                  {
                    label: "Editar",
                    icon: <Pencil size={15} />,
                    variant: "ghost" as const,
                    onClick: () => abrirEditar(evento),
                  },
                  {
                    label: "Ver evento",
                    icon: <Eye size={15} />,
                    variant: "ghost" as const,
                    onClick: () => setEventoSeleccionado(evento),
                  },
                  {
                    label: "Eliminar",
                    icon: <Trash2 size={15} />,
                    variant: "danger" as const,
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
        badges={eventoSeleccionado ? renderEstadoBadge(eventoSeleccionado) : undefined}
        onClose={() => setEventoSeleccionado(null)}
        cerrarAlClicFuera={false}
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
            <>
              {botonEstado(eventoSeleccionado)}
              <Button
                variant="danger"
                onClick={() => handleEliminar(eventoSeleccionado.id)}
                disabled={guardando}
              >
                <Trash2 size={16} />
                Eliminar
              </Button>
            </>
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

      {modalAbierto && confirmacion === null && (
        <Modal
          onClose={() => {
            if (guardando) return;
            cerrarModal();
          }}
          title={editandoId ? "Editar evento" : "Nuevo evento"}
          cerrarAlClicFuera={false}
        >
          <h3 className="mb-4 pr-10 text-lg font-bold text-royal-blue">
            {editandoId ? "Editar evento" : "Nuevo evento"}
          </h3>
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
          >
            <div>
              <Label htmlFor="titulo" required>
                Título
              </Label>
              <Input
                id="titulo"
                value={formulario.titulo}
                hasError={Boolean(errores.titulo)}
                maxLength={LIMITE_LETRAS.titulo}
                placeholder="Ej: Misa de San Blas"
                onChange={(e) =>
                  actualizarCampo(
                    "titulo",
                    limitarLetras(e.target.value, LIMITE_LETRAS.titulo),
                  )
                }
              />
              <ContadorLetras
                valor={formulario.titulo}
                maximo={LIMITE_LETRAS.titulo}
              />
              <FieldError message={errores.titulo} />
            </div>

            <div>
              <Label htmlFor="descripcion" required>
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formulario.descripcion}
                hasError={Boolean(errores.descripcion)}
                maxLength={LIMITE_LETRAS.descripcion}
                placeholder="Ej: Celebración eucarística y actividades para toda la comunidad."
                onChange={(e) =>
                  actualizarCampo(
                    "descripcion",
                    limitarLetras(e.target.value, LIMITE_LETRAS.descripcion),
                  )
                }
              />
              <ContadorLetras
                valor={formulario.descripcion}
                maximo={LIMITE_LETRAS.descripcion}
              />
              <FieldError message={errores.descripcion} />
            </div>

            <div>
              <Label htmlFor="fechaInicio" required>
                Fecha de inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                min={fechaHoy()}
                value={formulario.fechaInicio}
                hasError={Boolean(errores.fechaInicio)}
                onChange={(e) =>
                  actualizarCampo("fechaInicio", e.target.value)
                }
              />
              <FieldError message={errores.fechaInicio} />
            </div>

            <div>
              <Label htmlFor="fechaFin">Fecha de fin (opcional)</Label>
              <Input
                id="fechaFin"
                type="date"
                min={formulario.fechaInicio || fechaHoy()}
                value={formulario.fechaFin ?? ""}
                hasError={Boolean(errores.fechaFin)}
                onChange={(e) =>
                  actualizarCampo("fechaFin", e.target.value || null)
                }
              />
              <FieldError message={errores.fechaFin} />
            </div>

            <div>
              <Label htmlFor="lugar" required>
                Lugar
              </Label>
              <Input
                id="lugar"
                value={formulario.lugar}
                hasError={Boolean(errores.lugar)}
                maxLength={LIMITE_LETRAS.lugar}
                placeholder="Ej: Iglesia parroquial de San Blas"
                onChange={(e) =>
                  actualizarCampo(
                    "lugar",
                    limitarLetras(e.target.value, LIMITE_LETRAS.lugar),
                  )
                }
              />
              <ContadorLetras
                valor={formulario.lugar}
                maximo={LIMITE_LETRAS.lugar}
              />
              <FieldError message={errores.lugar} />
            </div>

            <div className="mt-2 flex flex-wrap justify-end gap-3">
              {mostrarPublicar && (
                <Button
                  type="button"
                  variant="royal"
                  onClick={solicitarPublicar}
                  disabled={guardando}
                >
                  <Globe size={16} />
                  Publicar evento
                </Button>
              )}
              <Button type="submit" variant="royal" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={cerrarModal}
                disabled={guardando}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmacionAccionModal
        open={confirmacion?.tipo === "publicar"}
        title="Confirmar publicación"
        parteSubrayada="Publicar evento"
        mensaje="¿Estás seguro/a que quieres publicar este evento? Una vez publicado aparecerá en el sitio web."
        confirmLabel="Publicar"
        pendingLabel="Publicando..."
        isPending={guardando}
        onConfirm={() => void confirmarPublicar()}
        onCancel={cancelarConfirmacion}
      />

      <ConfirmacionAccionModal
        open={confirmacion?.tipo === "desactivar"}
        title="Confirmar desactivación"
        parteSubrayada="Desactivar evento"
        mensaje="¿Estás seguro/a que quieres desactivar este evento? Dejará de mostrarse en el sitio web, pero permanecerá registrado."
        confirmLabel="Desactivar"
        pendingLabel="Desactivando..."
        isPending={guardando}
        onConfirm={() => void confirmarDesactivar()}
        onCancel={cancelarConfirmacion}
      />
    </AdminModule>
  );
};

export default GestionEventos;
