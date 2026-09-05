import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import {
  eventoToFormulario,
  useGestionEventos,
} from "../hooks/useGestionEventos";
import type { Evento } from "../../../../services/eventosService";
import type { EventoPayload } from "../../../../services/eventosService";
import {
  extraerFechaCalendario,
  formatearFechaCalendario,
  formatearHoraEvento,
} from "../../../../shared/utils/fechas";
import { EventoCard } from "../components/EventoCard";
import {
  ETIQUETA_ESTADO_EVENTO,
  VARIANTE_ESTADO_EVENTO,
  obtenerEstadoEvento,
  type EstadoEvento,
} from "../utils/estadoEvento";
import {
  SubidaImagen,
  type ArchivoImagen,
} from "../../../solicSacramento/components/SubidaImagen";
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
  Select,
  Textarea,
  useToast,
} from "../../../../shared/ui";

const formatearFecha = (fecha: string) => formatearFechaCalendario(fecha);

type Confirmacion =
  | { tipo: "publicar"; evento?: Evento }
  | { tipo: "activar"; evento?: Evento }
  | { tipo: "desactivar"; evento: Evento }
  | null;

type ErroresFormulario = {
  titulo?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  lugar?: string;
  hora?: string;
  imagen?: string;
};

const LIMITE_LETRAS = {
  titulo: 50,
  descripcion: 250,
  lugar: 50,
} as const;

const limitarLetras = (valor: string, maximo: number) => valor.slice(0, maximo);

const fechaHoy = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });

const soloFecha = (valor?: string | null) => extraerFechaCalendario(valor);

type FiltroEstadoEvento = "todos" | EstadoEvento;

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
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoEvento>("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState<EventoPayload>(formularioVacio());
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);
  const [archivoImagen, setArchivoImagen] = useState<ArchivoImagen | null>(null);
  const [quitarImagen, setQuitarImagen] = useState(false);

  const eventosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    return eventos.filter((evento) => {
      const coincideTexto =
        !query ||
        [evento.titulo, evento.descripcion, evento.lugar]
          .join(" ")
          .toLowerCase()
          .includes(query);

      if (!coincideTexto) return false;

      return filtroEstado === "todos" || obtenerEstadoEvento(evento) === filtroEstado;
    });
  }, [busqueda, eventos, filtroEstado]);

  useEffect(() => {
    if (!eventoSeleccionado) return;
    const actualizado = eventos.find((item) => item.id === eventoSeleccionado.id);
    if (actualizado && actualizado !== eventoSeleccionado) {
      setEventoSeleccionado(actualizado);
    }
  }, [eventos, eventoSeleccionado]);

  const eventoEnEdicion =
    editandoId != null
      ? eventos.find((evento) => evento.id === editandoId)
      : undefined;
  const estadoEnEdicion = obtenerEstadoEvento(eventoEnEdicion);
  const mostrarPublicar = !editandoId || estadoEnEdicion === "borrador";
  const mostrarActivar = estadoEnEdicion === "publicado-inactivo";

  const limpiarImagenLocal = () => {
    if (archivoImagen?.preview) URL.revokeObjectURL(archivoImagen.preview);
    setArchivoImagen(null);
    setQuitarImagen(false);
  };

  const opcionesImagen = () => ({
    archivo: archivoImagen?.file ?? null,
    eliminarImagen: quitarImagen && !archivoImagen,
  });

  const abrirCrear = () => {
    setEditandoId(null);
    setFormulario(formularioVacio());
    setErrores({});
    limpiarImagenLocal();
    setModalAbierto(true);
  };

  const abrirEditar = (evento: Evento) => {
    setEditandoId(evento.id);
    setFormulario(eventoToFormulario(evento));
    setErrores({});
    limpiarImagenLocal();
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormulario(formularioVacio());
    setErrores({});
    limpiarImagenLocal();
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

    if (formulario.hora && !/^\d{2}:\d{2}$/.test(formulario.hora)) {
      nuevosErrores.hora = "La hora no es válida.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validarFormulario()) return;
    const resultado = await guardarEvento(
      formulario,
      editandoId ?? undefined,
      opcionesImagen(),
    );
    if (resultado.ok) cerrarModal();
  };

  const handleEliminar = async (evento: Evento) => {
    const confirmar = window.confirm("¿Desea eliminar este evento?");
    if (!confirmar) return;
    await borrarEvento(evento.id);
    setEventoSeleccionado(null);
  };

  const solicitarPublicar = () => {
    if (guardando || !mostrarPublicar) return;
    if (!validarFormulario()) return;
    setConfirmacion({ tipo: "publicar" });
  };

  const solicitarPublicarDesdeLista = (evento: Evento) => {
    if (guardando || obtenerEstadoEvento(evento) !== "borrador") return;

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

  const solicitarActivar = (evento?: Evento) => {
    if (guardando) return;
    if (evento && obtenerEstadoEvento(evento) !== "publicado-inactivo") return;
    if (!evento && !mostrarActivar) return;
    if (!evento && !validarFormulario()) return;
    setConfirmacion({ tipo: "activar", evento });
  };

  const solicitarDesactivar = (evento: Evento) => {
    if (guardando || obtenerEstadoEvento(evento) !== "publicado-activo") return;
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
          opcionesImagen(),
        );

    if (resultado.ok) {
      sincronizarEventoSeleccionado(resultado.evento);
      setConfirmacion(null);
      if (!eventoEnLista) {
        setModalAbierto(false);
        setEditandoId(null);
        setFormulario(formularioVacio());
        limpiarImagenLocal();
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

  const confirmarActivar = async () => {
    if (confirmacion?.tipo !== "activar") return;

    const eventoEnLista = confirmacion.evento;
    const resultado = eventoEnLista
      ? await cambiarDisponibilidadEvento(eventoEnLista.id, true)
      : await publicarEventoDesdeFormulario(
          formulario,
          editandoId ?? undefined,
          opcionesImagen(),
        );

    if (resultado.ok) {
      sincronizarEventoSeleccionado(resultado.evento);
      setConfirmacion(null);
      if (!eventoEnLista) {
        setModalAbierto(false);
        setEditandoId(null);
        setFormulario(formularioVacio());
        limpiarImagenLocal();
      }
      showToast("Evento activado correctamente", "success");
      return;
    }

    showToast(
      resultado.mensaje || "No fue posible activar el evento.",
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

  const renderEstadoBadge = (evento: Evento) => {
    const estado = obtenerEstadoEvento(evento);
    return (
      <Badge variant={VARIANTE_ESTADO_EVENTO[estado]}>
        {ETIQUETA_ESTADO_EVENTO[estado]}
      </Badge>
    );
  };

  const botonEstado = (evento: Evento) => {
    const estado = obtenerEstadoEvento(evento);

    if (estado === "publicado-activo") {
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

    if (estado === "publicado-inactivo") {
      return (
        <Button
          variant="royal"
          onClick={() => solicitarActivar(evento)}
          disabled={guardando}
        >
          <Power size={16} />
          Activar evento
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
        <Select
          className="md:w-60"
          value={filtroEstado}
          onChange={(event) =>
            setFiltroEstado(event.target.value as FiltroEstadoEvento)
          }
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos los estados</option>
          <option value="publicado-activo">Publicado / Activo</option>
          <option value="publicado-inactivo">Publicado / Inactivo</option>
          <option value="borrador">Borrador</option>
        </Select>
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
            busqueda || filtroEstado !== "todos"
              ? "No se encontraron eventos con ese criterio."
              : "No hay eventos registrados."
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {eventosFiltrados.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              guardando={guardando}
              onPublicar={solicitarPublicarDesdeLista}
              onActivar={solicitarActivar}
              onDesactivar={solicitarDesactivar}
              onEditar={abrirEditar}
              onEliminar={handleEliminar}
              onVer={setEventoSeleccionado}
            />
          ))}
        </div>
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
                onClick={() => handleEliminar(eventoSeleccionado)}
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
            {eventoSeleccionado.imagenUrl && (
              <img
                src={eventoSeleccionado.imagenUrl}
                alt=""
                className="mb-4 h-40 w-full rounded-xl border border-border-strong object-cover"
              />
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <p className="m-0 text-sm text-slate-600">
                <strong className="text-slate-800">Lugar:</strong> {eventoSeleccionado.lugar}
              </p>
              <p className="m-0 text-sm text-slate-600">
                <strong className="text-slate-800">Hora:</strong>{" "}
                {formatearHoraEvento(eventoSeleccionado.hora) || "No definida"}
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

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formulario.hora ?? ""}
                  hasError={Boolean(errores.hora)}
                  onChange={(e) =>
                    actualizarCampo("hora", e.target.value || null)
                  }
                />
                <FieldError message={errores.hora} />
              </div>
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

            <SubidaImagen
              id="imagen-evento"
              label="Imagen del evento"
              hint="Opcional. JPG, PNG, WEBP o GIF de hasta 5 MB."
              textoArrastrar="Arrastra y suelta archivos aquí"
              textoBoton="Seleccionar archivo"
              mostrarVistaPrevia={false}
              value={archivoImagen}
              existingPreview={quitarImagen ? null : formulario.imagenUrl}
              errorExterno={errores.imagen}
              onChange={(archivo) => {
                setArchivoImagen(archivo);
                if (archivo) {
                  setQuitarImagen(false);
                  setErrores((prev) => {
                    if (!prev.imagen) return prev;
                    const siguiente = { ...prev };
                    delete siguiente.imagen;
                    return siguiente;
                  });
                }
              }}
              onClearExisting={() => {
                setQuitarImagen(true);
                actualizarCampo("imagenUrl", null);
              }}
            />

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
              {mostrarActivar && (
                <Button
                  type="button"
                  variant="royal"
                  onClick={() => solicitarActivar()}
                  disabled={guardando}
                >
                  <Power size={16} />
                  Activar evento
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
        open={confirmacion?.tipo === "activar"}
        title="Confirmar activación"
        parteSubrayada="Activar evento"
        mensaje="¿Estás seguro/a que quieres activar este evento? Volverá a mostrarse en el sitio web."
        confirmLabel="Activar"
        pendingLabel="Activando..."
        isPending={guardando}
        onConfirm={() => void confirmarActivar()}
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
