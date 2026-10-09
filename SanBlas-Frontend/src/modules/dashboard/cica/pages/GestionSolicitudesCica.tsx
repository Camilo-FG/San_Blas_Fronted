import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle,
  Clock,
  Eye,
  Inbox,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { AdminRecordCard } from "../../../../shared/components/admin/AdminRecordCard";
import {
  AdminModule,
  AdminPagination,
  AdminPaginationButton,
  AdminTable,
  AdminTableCell,
  AdminTableFooter,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  AdminToolbar,
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  FieldError,
  ConfirmacionAccionModal,
  Modal,
  Textarea,
  useToast,
} from "../../../../shared/ui";
import { SACRAMENTOS_CICA } from "../../../cica/sacramentosCica";
import {
  getEstadoBadgeClass,
  getEstadoBadgeVariant,
  textoEstadoCica,
} from "../../../cica/estadoCica";
import type { InscripcionCica } from "../../../cica/types";
import { useSolicitudesCica } from "../hooks/useSolicitudesCica";
const POR_PAGINA = 10;

const etiquetaCivil: Record<string, string> = {
  soltero: "Soltero(a)",
  matrimonio_civil: "Matrimonio civil",
  union_libre: "Unión libre",
};

const inputAdmin =
  "min-h-11 rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:placeholder:text-[#7f8da3] dark:focus:border-[#d9a928] dark:focus-visible:bg-[#0f1d33]";

const nombreCompleto = (persona: {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
}) =>
  [persona.nombre, persona.apellido1, persona.apellido2].filter(Boolean).join(" ");

const sacramentos = (item: InscripcionCica) =>
  SACRAMENTOS_CICA.filter((sacramento) => item[sacramento.clave])
    .map((sacramento) => sacramento.etiqueta)
    .join(", ") || "—";

const formatearFecha = (valor?: string | null) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-CR");
};

const coincideBusqueda = (item: InscripcionCica, texto: string) => {
  const consulta = texto.trim().toLowerCase();
  if (!consulta) return true;
  return [nombreCompleto(item), item.cedula, item.telefono, item.correo]
    .join(" ")
    .toLowerCase()
    .includes(consulta);
};

function CampoDetalle({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-text-muted dark:text-[#7f8da3]">
        {label}
      </span>
      <span className="text-sm text-slate-900 dark:text-[#f3f6fa]">{value}</span>
    </div>
  );
}

const GestionSolicitudesCica = () => {
  const { showToast } = useToast();
  const {
    pendientes,
    historial,
    cargando,
    error,
    reintentar,
    cambiarEstado,
    guardando,
  } = useSolicitudesCica();
  const [vista, setVista] = useState<"solicitudes" | "historial">("solicitudes");
  const [filtro, setFiltro] = useState<"todos" | "Aprobada" | "Rechazada">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<InscripcionCica | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<"aprobar" | "rechazar" | null>(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [vista, filtro, busqueda]);

  const aprobadas = historial.filter((item) => item.estado === "Aprobada").length;
  const rechazadas = historial.filter((item) => item.estado === "Rechazada").length;

  const filas = useMemo(() => {
    const base =
      vista === "solicitudes"
        ? pendientes
        : historial.filter((item) => filtro === "todos" || item.estado === filtro);
    return base.filter((item) => coincideBusqueda(item, busqueda));
  }, [busqueda, filtro, historial, pendientes, vista]);

  const totalPaginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = filas.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA,
  );
  const hayFiltros = busqueda.trim() !== "" || (vista === "historial" && filtro !== "todos");

  const pedirAprobacion = () => {
    setErrorAccion(null);
    setConfirmacion("aprobar");
  };

  const pedirRechazo = () => {
    setMotivo("");
    setErrorAccion(null);
    setConfirmacion("rechazar");
  };

  const cambiar = async (estado: "Aprobada" | "Rechazada") => {
    if (!seleccion) return;
    if (estado === "Rechazada" && !motivo.trim()) {
      setErrorAccion("La observación es obligatoria al rechazar.");
      return;
    }
    setErrorAccion(null);
    const resultado = await cambiarEstado(
      seleccion.id,
      estado,
      estado === "Rechazada" ? motivo.trim() : undefined,
    );
    if (resultado.ok) {
      showToast(
        estado === "Aprobada"
          ? "Solicitud aprobada correctamente"
          : "Solicitud rechazada correctamente",
        estado === "Aprobada" ? "success" : "error",
      );
      setConfirmacion(null);
      setSeleccion(null);
      setMotivo("");
      return;
    }
    setErrorAccion(resultado.mensaje);
    showToast(resultado.mensaje, "error");
  };

  return (
    <AdminModule className="gap-3!">
      {guardando && (
        <p
          className="rounded-xl bg-info-bg px-3.5 py-2.5 text-sm font-semibold text-info dark:bg-[rgba(217,169,40,0.12)] dark:text-[#d9a928]"
          role="status"
        >
          Guardando cambios...
        </p>
      )}

      <div className="flex w-full flex-wrap items-center gap-1 rounded-xl border border-border-strong bg-surface p-1 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none">
        <button
          type="button"
          onClick={() => setVista("solicitudes")}
          aria-pressed={vista === "solicitudes"}
          className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 text-sm transition-colors ${
            vista === "solicitudes"
              ? "bg-[#003366] font-semibold text-white dark:bg-[#d9a928] dark:text-[#040b16]"
              : "bg-transparent font-medium text-text-secondary hover:bg-surface-muted dark:text-[#b7c3d4] dark:hover:bg-white/[0.035] dark:hover:text-[#f3f6fa]"
          }`}
        >
          <Inbox size={16} />
          Solicitudes
        </button>
        <button
          type="button"
          onClick={() => setVista("historial")}
          aria-pressed={vista === "historial"}
          className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 text-sm transition-colors ${
            vista === "historial"
              ? "bg-[#003366] font-semibold text-white dark:bg-[#d9a928] dark:text-[#040b16]"
              : "bg-transparent font-medium text-text-secondary hover:bg-surface-muted dark:text-[#b7c3d4] dark:hover:bg-white/[0.035] dark:hover:text-[#f3f6fa]"
          }`}
        >
          <Archive size={16} />
          Historial
        </button>
      </div>

      {error && (
        <div className="flex flex-wrap items-center gap-3">
          <ErrorMessage message={error} className="min-w-0 flex-1" />
          <Button type="button" variant="royal" onClick={reintentar} disabled={cargando}>
            {cargando ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="flex items-center justify-between rounded-3xl border border-slate-100 bg-surface p-5 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none">
          <div>
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-[#7f8da3]">
              Total pendientes
            </span>
            <strong className="mt-1.5 block font-heading text-3xl text-royal-blue dark:text-[#f3f6fa]">
              {pendientes.length}
            </strong>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-[rgba(242,163,74,0.12)] dark:text-[#f2a34a]">
            <Clock size={22} />
          </div>
        </article>
        <article className="flex items-center justify-between rounded-3xl border border-slate-100 bg-surface p-5 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none">
          <div>
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-[#7f8da3]">
              Inscripciones aprobadas
            </span>
            <strong className="mt-1.5 block font-heading text-3xl text-royal-blue dark:text-[#f3f6fa]">
              {aprobadas}
            </strong>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success-bg text-emerald-600 dark:bg-[rgba(53,214,160,0.12)] dark:text-[#35d6a0]">
            <CheckCircle size={22} />
          </div>
        </article>
        <article className="flex items-center justify-between rounded-3xl border border-slate-100 bg-surface p-5 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none">
          <div>
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-[#7f8da3]">
              Inscripciones rechazadas
            </span>
            <strong className="mt-1.5 block font-heading text-3xl text-royal-blue dark:text-[#f3f6fa]">
              {rechazadas}
            </strong>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-danger-bg text-red-600 dark:bg-[rgba(230,106,106,0.12)] dark:text-[#e66a6a]">
            <XCircle size={22} />
          </div>
        </article>
      </div>

      <AdminToolbar className="p-3!">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, cédula o teléfono"
            className={`${inputAdmin} min-w-[220px] flex-1`}
            aria-label="Buscar inscripciones CICA"
          />
          {vista === "historial" && (
            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value as "todos" | "Aprobada" | "Rechazada")
              }
              className={`${inputAdmin} cursor-pointer`}
              aria-label="Filtrar historial por estado"
            >
              <option value="todos">Todos</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Rechazada">Rechazadas</option>
            </select>
          )}
          {cargando && (
            <Loader2
              size={18}
              className="animate-spin text-text-muted dark:text-[#7f8da3]"
              aria-label="Cargando solicitudes"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setFiltro("todos");
            }}
            disabled={!hayFiltros}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
          >
            <RotateCcw size={15} strokeWidth={2} />
            Limpiar
          </button>
        </div>
      </AdminToolbar>

      {!cargando && filas.length === 0 && (
        <EmptyState
          title={
            hayFiltros
              ? "No se encontraron registros con los filtros aplicados."
              : vista === "solicitudes"
                ? "Aún no hay solicitudes pendientes."
                : "Aún no hay inscripciones en el historial."
          }
        />
      )}

      {visibles.length > 0 && (
        <>
          <div className="hidden md:block">
            <AdminTablePanel>
              <AdminTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeaderCell>Nombre</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Cédula</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Estado civil</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Teléfono</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Sacramentos</AdminTableHeaderCell>
                    <AdminTableHeaderCell>
                      {vista === "historial" ? "Fecha de revisión" : "Fecha de solicitud"}
                    </AdminTableHeaderCell>
                    <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                  </AdminTableRow>
                </AdminTableHead>
                <tbody>
                  {visibles.map((item) => (
                    <AdminTableRow key={item.id}>
                      <AdminTableCell>
                        <span className="font-medium text-text dark:text-[#f3f6fa]">
                          {nombreCompleto(item)}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="tabular-nums text-text-secondary dark:text-[#b7c3d4]">
                          {item.cedula}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        {etiquetaCivil[item.estadoCivil] ?? item.estadoCivil}
                      </AdminTableCell>
                      <AdminTableCell>{item.telefono}</AdminTableCell>
                      <AdminTableCell>{sacramentos(item)}</AdminTableCell>
                      <AdminTableCell>
                        <span className="tabular-nums text-text-secondary dark:text-[#b7c3d4]">
                          {formatearFecha(
                            vista === "historial"
                              ? item.fechaActualizacionEstado
                              : item.fechaSolicitud,
                          )}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <Badge variant={getEstadoBadgeVariant(item.estado)} className={getEstadoBadgeClass(item.estado)}>
                          {textoEstadoCica(item.estado)}
                        </Badge>
                      </AdminTableCell>
                      <AdminTableCell>
                        <button
                          type="button"
                          onClick={() => {
                            setSeleccion(item);
                            setMotivo("");
                            setErrorAccion(null);
                            setConfirmacion(null);
                          }}
                          aria-label={`Ver detalle de ${nombreCompleto(item)}`}
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:text-[#7f8da3] dark:hover:bg-white/[0.035] dark:hover:text-[#d9a928]"
                        >
                          <Eye size={17} strokeWidth={1.5} />
                        </button>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTablePanel>
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
            {visibles.map((item) => (
              <AdminRecordCard
                key={item.id}
                icon={<Inbox size={20} />}
                accent="#003366"
                title={nombreCompleto(item)}
                subtitle={item.cedula}
                badges={
                  <Badge variant={getEstadoBadgeVariant(item.estado)} className={getEstadoBadgeClass(item.estado)}>
                    {textoEstadoCica(item.estado)}
                  </Badge>
                }
                meta={[
                  { label: "Estado civil", value: etiquetaCivil[item.estadoCivil] ?? item.estadoCivil },
                  { label: "Teléfono", value: item.telefono },
                  { label: "Sacramentos", value: sacramentos(item) },
                ]}
                onViewDetail={() => {
                  setSeleccion(item);
                  setMotivo("");
                  setErrorAccion(null);
                  setConfirmacion(null);
                }}
                viewLabel="Ver detalle"
              />
            ))}
          </div>

          <AdminTableFooter>
            <span className="text-sm text-text-muted dark:text-[#7f8da3]">
              {filas.length} registro{filas.length === 1 ? "" : "s"}
            </span>
            <AdminPagination>
              <AdminPaginationButton
                type="button"
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                disabled={paginaSegura <= 1}
                aria-label="Página anterior"
              >
                Anterior
              </AdminPaginationButton>
              <span className="text-sm text-text-muted dark:text-[#7f8da3]">
                {paginaSegura} de {totalPaginas}
              </span>
              <AdminPaginationButton
                type="button"
                onClick={() =>
                  setPagina((actual) => Math.min(totalPaginas, actual + 1))
                }
                disabled={paginaSegura >= totalPaginas}
                aria-label="Página siguiente"
              >
                Siguiente
              </AdminPaginationButton>
            </AdminPagination>
          </AdminTableFooter>
        </>
      )}

      {seleccion && (
        <Modal
          onClose={() => {
            setSeleccion(null);
            setMotivo("");
            setErrorAccion(null);
            setConfirmacion(null);
          }}
          title={nombreCompleto(seleccion)}
          sinFondo
          tamano="xl"
          cerrarConEsc={!confirmacion}
          cerrarAlClicFuera={!confirmacion}
          overlayClassName="fixed inset-0 z-[1350] bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
          className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        >
          <div className="flex flex-col gap-5 pr-10">
            <div className="flex flex-col gap-2">
              <p className="m-0 text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-[#7f8da3]">
                Inscripción CICA
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="m-0 font-heading text-2xl text-slate-900 dark:text-[#f3f6fa]">
                  {nombreCompleto(seleccion)}
                </h2>
                <Badge variant={getEstadoBadgeVariant(seleccion.estado)} className={getEstadoBadgeClass(seleccion.estado)}>
                  {textoEstadoCica(seleccion.estado)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CampoDetalle label="Cédula" value={seleccion.cedula} />
              <CampoDetalle label="Nacimiento" value={formatearFecha(seleccion.fechaNacimiento)} />
              <CampoDetalle label="Nacionalidad" value={seleccion.nacionalidad} />
              <CampoDetalle label="Teléfono" value={seleccion.telefono} />
              <CampoDetalle label="Correo" value={seleccion.correo} />
              <CampoDetalle
                label="Estado civil"
                value={
                  etiquetaCivil[seleccion.estadoCivil] ?? seleccion.estadoCivil
                }
              />
              <CampoDetalle
                label="Cónyuge o compañero(a)"
                value={
                  seleccion.conyugeNombre
                    ? nombreCompleto({
                        nombre: seleccion.conyugeNombre,
                        apellido1: seleccion.conyugeApellido1 ?? "",
                        apellido2: seleccion.conyugeApellido2,
                      })
                    : "—"
                }
              />
              <CampoDetalle label="Sacramentos" value={sacramentos(seleccion)} />
              <CampoDetalle
                label="Padre"
                value={nombreCompleto({
                  nombre: seleccion.padreNombre,
                  apellido1: seleccion.padreApellido1,
                  apellido2: seleccion.padreApellido2,
                })}
              />
              <CampoDetalle
                label="Madre"
                value={nombreCompleto({
                  nombre: seleccion.madreNombre,
                  apellido1: seleccion.madreApellido1,
                  apellido2: seleccion.madreApellido2,
                })}
              />
              <CampoDetalle label="Dirección" value={seleccion.direccionHogar} />
              <CampoDetalle
                label="Religión"
                value={
                  seleccion.esCatolico
                    ? "Católico"
                    : seleccion.otraIglesia?.trim() || "Otra iglesia"
                }
              />
              <CampoDetalle label="Observación" value={seleccion.observacion?.trim() || "—"} />
            </div>

            {seleccion.estado === "Aprobada" && (
              <div className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-[#35d6a0]/30 dark:bg-[rgba(53,214,160,0.10)]">
                <CheckCircle size={17} className="mt-0.5 shrink-0 text-emerald-700 dark:text-[#35d6a0]" />
                <div>
                  <p className="m-0 text-sm font-semibold text-emerald-900 dark:text-[#35d6a0]">Aprobación</p>
                  <p className="m-0 mt-1 text-sm text-emerald-900 dark:text-[#d7f8ec]">
                    {seleccion.observacionAdministrativa?.trim() || "Sin comentario de aprobación"}
                  </p>
                  <p className="m-0 mt-1 text-xs text-emerald-700 dark:text-[#35d6a0]">
                    Aprobado el {formatearFecha(seleccion.fechaActualizacionEstado)}
                  </p>
                </div>
              </div>
            )}

            {seleccion.estado === "Rechazada" && (
              <div className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-[#e66a6a]/30 dark:bg-[rgba(230,106,106,0.10)]">
                <XCircle size={17} className="mt-0.5 shrink-0 text-red-700 dark:text-[#e66a6a]" />
                <div>
                  <p className="m-0 text-sm font-semibold text-red-900 dark:text-[#e66a6a]">Rechazo</p>
                  <p className="m-0 mt-1 text-sm text-red-900 dark:text-[#f8d0d0]">
                    {seleccion.observacionAdministrativa?.trim() || "Motivo no especificado"}
                  </p>
                  <p className="m-0 mt-1 text-xs text-red-700 dark:text-[#e66a6a]">
                    Rechazado el {formatearFecha(seleccion.fechaActualizacionEstado)}
                  </p>
                </div>
              </div>
            )}

            {seleccion.estado === "Pendiente" && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="royal" disabled={guardando} onClick={pedirAprobacion}>
                  <CheckCircle size={16} />
                  Aprobar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-lg! border! border-border-strong! duration-150 ease-out hover:bg-slate-300! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
                  disabled={guardando}
                  onClick={pedirRechazo}
                >
                  <XCircle size={16} />
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      <ConfirmacionAccionModal
        open={confirmacion === "aprobar"}
        title="Confirmar aprobación"
        parteSubrayada="Aprobar inscripción"
        mensaje="¿Estás seguro/a que quieres aprobar esta inscripción de CICA? Una vez aprobada, su estado no podrá ser cambiado."
        confirmLabel="Aprobar"
        pendingLabel="Aprobando..."
        isPending={guardando}
        onConfirm={() => void cambiar("Aprobada")}
        onCancel={() => setConfirmacion(null)}
        overlayClassName="fixed inset-0 z-[1400] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
        className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        cancelClassName="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
      />
      <ConfirmacionAccionModal
        open={confirmacion === "rechazar"}
        title="Confirmar rechazo"
        parteSubrayada="Rechazar solicitud"
        mensaje="¿Estás seguro/a que quieres rechazar esta inscripción de CICA? Una vez rechazada, su estado no podrá ser cambiado."
        confirmLabel="Rechazar solicitud"
        pendingLabel="Rechazando..."
        isPending={guardando}
        onConfirm={() => void cambiar("Rechazada")}
        onCancel={() => setConfirmacion(null)}
        overlayClassName="fixed inset-0 z-[1400] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
        className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        cancelClassName="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
      >
        <label className="mt-4 flex w-full flex-col gap-1 text-left text-sm">
          <span className="font-semibold text-slate-800 dark:text-[#f3f6fa]">
            Observación al rechazar
          </span>
          <Textarea
            value={motivo}
            onChange={(event) => {
              setMotivo(event.target.value);
              if (errorAccion) setErrorAccion(null);
            }}
            rows={3}
            placeholder="Ej: Falta confirmar la cédula."
            hasError={Boolean(errorAccion)}
            disabled={guardando}
          />
          <FieldError message={errorAccion} />
        </label>
      </ConfirmacionAccionModal>
    </AdminModule>
  );
};

export default GestionSolicitudesCica;
