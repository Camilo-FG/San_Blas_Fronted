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
import { AdminPaginationBar } from "../../../../shared/components/admin/AdminPaginationBar";
import { usePaginacionCliente } from "../../../../shared/hooks/usePaginacionCliente";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import {
  AdminModule,
  AdminTable,
  AdminTableCell,
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
  Textarea,
  useToast,
} from "../../../../shared/ui";
import {
  DetalleSolicitudBautismoSheet,
  formatearFecha,
  nombreCompleto,
  type CertificadoBautismo,
} from "../components/DetalleSolicitudBautismoSheet";
import {
  ETIQUETA_CONDICION,
  type InscripcionCatequesisBautismo,
} from "../../../catequesisBautismo/types";
import { validarCertificacion } from "../../../catequesisBautismo/validarCatequesisBautismo";
import { useSolicitudesCatequesisBautismo } from "../hooks/useSolicitudesCatequesisBautismo";
import {
  getEstadoBadgeClass,
  getEstadoBadgeVariant,
  textoEstadoCica,
} from "../../../cica/estadoCica";

const inputAdmin =
  "min-h-11 rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:placeholder:text-[#7f8da3] dark:focus:border-[#d9a928] dark:focus-visible:bg-[#0f1d33]";

const coincideBusqueda = (item: InscripcionCatequesisBautismo, texto: string) => {
  const consulta = texto.trim().toLowerCase();
  if (!consulta) return true;
  return [nombreCompleto(item), item.cedula, item.telefono, item.parroquiaOrigen]
    .join(" ")
    .toLowerCase()
    .includes(consulta);
};

const certificadoVacio: CertificadoBautismo = {
  fechaInicioCatequesis: "",
  fechaFinalizacionCatequesis: "",
  responsableCertifica: "",
};

const GestionCatequesisBautismo = () => {
  const { showToast } = useToast();
  const {
    pendientes,
    historial,
    cargando,
    error,
    reintentar,
    cambiarEstado,
    guardando,
  } = useSolicitudesCatequesisBautismo();
  const [vista, setVista] = useState<"solicitudes" | "historial">("solicitudes");
  const [filtro, setFiltro] = useState<"todos" | "Aprobada" | "Rechazada">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<InscripcionCatequesisBautismo | null>(null);
  const [motivo, setMotivo] = useState("");
  const [certificado, setCertificado] = useState(certificadoVacio);
  const [erroresCertificado, setErroresCertificado] = useState<Record<string, string>>({});
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<"aprobar" | "rechazar" | null>(null);

  // Debounce de la búsqueda para no recalcular filas ni resetear la página con cada tecla, igual que catequesis.
  const busquedaDebounced = useDebouncedValue(busqueda, 400);

  const aprobadas = historial.filter((item) => item.estado === "Aprobada").length;
  const rechazadas = historial.filter((item) => item.estado === "Rechazada").length;

  const filas = useMemo(() => {
    const base =
      vista === "solicitudes"
        ? pendientes
        : historial.filter((item) => filtro === "todos" || item.estado === filtro);
    return base.filter((item) => coincideBusqueda(item, busquedaDebounced));
  }, [busquedaDebounced, filtro, historial, pendientes, vista]);

  // Paginación en cliente con el hook compartido: sanea la página cuando el dataset encoge (antes el "Siguiente" se trababa).
  const paginacion = usePaginacionCliente(filas, 10);
  const { visibles, reiniciar } = paginacion;

  // Al cambiar de vista o filtros volvemos a la primera página.
  useEffect(() => {
    reiniciar();
  }, [vista, filtro, busquedaDebounced, reiniciar]);

  const hayFiltros = busqueda.trim() !== "" || (vista === "historial" && filtro !== "todos");

  const abrir = (item: InscripcionCatequesisBautismo) => {
    setSeleccion(item);
    setMotivo("");
    setCertificado(certificadoVacio);
    setErroresCertificado({});
    setErrorAccion(null);
    setConfirmacion(null);
  };

  const pedirAprobacion = () => {
    if (!seleccion) return;
    const encontrados = validarCertificacion(certificado);
    setErroresCertificado(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    setErrorAccion(null);
    setConfirmacion("aprobar");
  };

  const pedirRechazo = () => {
    setMotivo("");
    setErrorAccion(null);
    setConfirmacion("rechazar");
  };

  const aprobar = async () => {
    if (!seleccion) return;
    const encontrados = validarCertificacion(certificado);
    setErroresCertificado(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    setErrorAccion(null);
    const resultado = await cambiarEstado(seleccion.id, "Aprobada", {
      fechaInicioCatequesis: certificado.fechaInicioCatequesis,
      fechaFinalizacionCatequesis: certificado.fechaFinalizacionCatequesis,
      responsableCertifica: certificado.responsableCertifica.trim(),
    });
    if (resultado.ok) {
      showToast("La catequesis quedó certificada.", "success");
      setConfirmacion(null);
      setSeleccion(null);
      return;
    }
    setErrorAccion(resultado.mensaje);
    showToast(resultado.mensaje, "error");
  };

  const rechazar = async () => {
    if (!seleccion) return;
    if (!motivo.trim()) {
      setErrorAccion("La observación es obligatoria al rechazar.");
      return;
    }
    setErrorAccion(null);
    const resultado = await cambiarEstado(seleccion.id, "Rechazada", {
      observacionAdministrativa: motivo.trim(),
    });
    if (resultado.ok) {
      showToast("Solicitud rechazada correctamente", "error");
      setConfirmacion(null);
      setSeleccion(null);
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
              Catequesis certificadas
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
            aria-label="Buscar inscripciones de catequesis para el bautismo"
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
                    <AdminTableHeaderCell>Teléfono</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Condición</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Parroquia</AdminTableHeaderCell>
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
                      <AdminTableCell>{item.telefono}</AdminTableCell>
                      <AdminTableCell>
                        {ETIQUETA_CONDICION[item.condicion] ?? item.condicion}
                      </AdminTableCell>
                      <AdminTableCell>{item.parroquiaOrigen}</AdminTableCell>
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
                          onClick={() => abrir(item)}
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
                  { label: "Teléfono", value: item.telefono },
                  { label: "Parroquia", value: item.parroquiaOrigen },
                  {
                    label: "Condición",
                    value: ETIQUETA_CONDICION[item.condicion] ?? item.condicion,
                  },
                ]}
                onViewDetail={() => abrir(item)}
                viewLabel="Ver detalle"
              />
            ))}
          </div>

          {/* Barra de paginación compartida: misma pinta que catequesis ("Mostrando X-Y de Z", selector y chevrons) */}
          <AdminPaginationBar
            pegadoAbajo
            className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#040b16]/95 dark:text-[#b7c3d4]"
            desde={paginacion.desde}
            hasta={paginacion.hasta}
            total={paginacion.totalRegistros}
            pagina={paginacion.pagina}
            totalPaginas={paginacion.totalPaginas}
            registrosPorPagina={paginacion.registrosPorPagina}
            puedeAnterior={paginacion.puedeAnterior}
            puedeSiguiente={paginacion.puedeSiguiente}
            onAnterior={paginacion.anterior}
            onSiguiente={paginacion.siguiente}
            onCambiarRegistrosPorPagina={paginacion.cambiarRegistrosPorPagina}
          />
        </>
      )}

      {seleccion && (
        <DetalleSolicitudBautismoSheet
          solicitud={seleccion}
          accionError={errorAccion}
          guardando={guardando}
          certificado={certificado}
          erroresCertificado={erroresCertificado}
          onCambiarCertificado={(campo, valor) =>
            setCertificado((actual) => ({ ...actual, [campo]: valor }))
          }
          cerrarConEsc={!confirmacion}
          onAprobar={pedirAprobacion}
          onRechazar={pedirRechazo}
          onClose={() => {
            setSeleccion(null);
            setConfirmacion(null);
          }}
        />
      )}

      <ConfirmacionAccionModal
        open={confirmacion === "aprobar"}
        title="Confirmar aprobación"
        parteSubrayada="Certificar catequesis"
        mensaje="¿Estás seguro/a que quieres aprobar esta catequesis? Una vez aprobada, queda constancia de que ya puede seguir con el bautismo y su estado no podrá ser cambiado."
        confirmLabel="Aprobar"
        pendingLabel="Aprobando..."
        isPending={guardando}
        onConfirm={() => void aprobar()}
        onCancel={() => setConfirmacion(null)}
        overlayClassName="fixed inset-0 z-[1400] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
        className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        cancelClassName="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
      />
      <ConfirmacionAccionModal
        open={confirmacion === "rechazar"}
        title="Confirmar rechazo"
        parteSubrayada="Rechazar solicitud"
        mensaje="¿Estás seguro/a que quieres rechazar esta inscripción? Una vez rechazada, su estado no podrá ser cambiado."
        confirmLabel="Rechazar solicitud"
        pendingLabel="Rechazando..."
        isPending={guardando}
        onConfirm={() => void rechazar()}
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
            placeholder="Ej: No completó las charlas."
            hasError={Boolean(errorAccion)}
            disabled={guardando}
          />
          <FieldError message={errorAccion} />
        </label>
      </ConfirmacionAccionModal>
    </AdminModule>
  );
};

export default GestionCatequesisBautismo;
