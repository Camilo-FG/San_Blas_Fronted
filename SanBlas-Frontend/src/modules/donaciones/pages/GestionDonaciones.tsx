import React, { useEffect, useMemo, useState } from "react";
import { Eye, HandHeart, Loader2, Mail, Phone, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useGestionDonaciones,
  Donacion,
  type EstadoDonacionAccion,
} from "../hooks/useGestionDonaciones";
import { DonacionDetalleModal } from "../components/DonacionDetalleModal";
import { AdminRecordCard } from "../../../shared/components/admin/AdminRecordCard";
import {
  AdminModule,
  AdminSearch,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  Badge,
  ConfirmacionAccionModal,
  EmptyState,
  ErrorMessage,
  resaltarCoincidencia,
  type BadgeVariant,
  useToast,
} from "../../../shared/ui";

const getEstadoBadgeVariant = (estado?: string): BadgeVariant => {
  const normalized = (estado || "pendiente").toLowerCase();
  if (normalized === "aprobado") return "success";
  if (normalized === "rechazado") return "danger";
  return "warning";
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type Confirmacion = "aprobar" | "rechazar" | null;

export default function GestionDonaciones(): React.JSX.Element {
  const { donaciones, cargando, guardando, error, cambiarEstadoDonacion } =
    useGestionDonaciones();
  const { showToast, toasts } = useToast();
  const [donacionSeleccionada, setDonacionSeleccionada] =
    useState<Donacion | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);
  const [nombreInput, setNombreInput] = useState("");
  const [correoInput, setCorreoInput] = useState("");
  const [filtros, setFiltros] = useState({ nombre: "", correo: "" });

  const formatearFecha = (fechaStr: string) => {
    const opciones: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(fechaStr).toLocaleDateString("es-CR", opciones);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({
        nombre: nombreInput.trim(),
        correo: correoInput.trim(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [nombreInput, correoInput]);

  const handleSoloLetrasNombre = (valor: string) =>
    valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").slice(0, 30);

  const handleCorreo = (valor: string) =>
    valor.replace(/[^a-zA-Z0-9@._+-]/g, "").slice(0, 80);

  const donacionesFiltradas = useMemo(() => {
    const nombreBuscado = normalizeText(filtros.nombre);
    const correoBuscado = normalizeText(filtros.correo);

    return donaciones.filter((donacion) => {
      const coincideNombre =
        !nombreBuscado ||
        normalizeText(donacion.nombre).includes(nombreBuscado);
      const coincideCorreo =
        !correoBuscado ||
        normalizeText(donacion.correo).includes(correoBuscado);

      return coincideNombre && coincideCorreo;
    });
  }, [donaciones, filtros]);

  const hayBusquedaActiva = filtros.nombre !== "" || filtros.correo !== "";
  const mostrarEstadoVacio =
    !cargando &&
    !error &&
    donacionesFiltradas.length === 0 &&
    hayBusquedaActiva;

  const abrirDetalle = (donacion: Donacion) => {
    setConfirmacion(null);
    setDonacionSeleccionada(donacion);
  };

  const cerrarDetalle = () => {
    if (guardando) return;
    setDonacionSeleccionada(null);
    setConfirmacion(null);
  };

  const abrirConfirmacion = (accion: Exclude<Confirmacion, null>) => {
    if (!donacionSeleccionada || donacionSeleccionada.estado !== "Pendiente") {
      return;
    }
    setConfirmacion(accion);
  };

  const cancelarConfirmacion = () => {
    if (guardando) return;
    setConfirmacion(null);
  };

  useEffect(() => {
    if (!donacionSeleccionada && !confirmacion) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || toasts.length > 0) return;
      if (confirmacion) {
        cancelarConfirmacion();
        return;
      }
      cerrarDetalle();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [donacionSeleccionada, confirmacion, guardando, toasts.length]);

  const confirmarCambioEstado = async (nuevoEstado: EstadoDonacionAccion) => {
    if (!donacionSeleccionada) return;

    const resultado = await cambiarEstadoDonacion(
      donacionSeleccionada.id,
      nuevoEstado,
    );

    if (resultado.ok) {
      setConfirmacion(null);
      setDonacionSeleccionada(null);
      if (nuevoEstado === "Aprobado") {
        showToast("Donativo aprobado correctamente", "success");
      } else {
        showToast("Donativo rechazado correctamente", "error");
      }
      return;
    }

    showToast(resultado.mensaje, "error");
  };

  const renderEstadoBadge = (estado?: string) => (
    <Badge variant={getEstadoBadgeVariant(estado)}>
      {estado || "Pendiente"}
    </Badge>
  );

  return (
    <AdminModule className="gap-3!">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border-strong bg-surface p-3 shadow-sm">
        <AdminSearch
          type="text"
          placeholder="Nombre o apellidos"
          maxLength={30}
          value={nombreInput}
          onChange={(e) => setNombreInput(handleSoloLetrasNombre(e.target.value))}
          className="min-w-[200px] flex-1"
          aria-label="Filtrar por nombre"
        />
        <AdminSearch
          type="text"
          placeholder="Correo"
          maxLength={80}
          value={correoInput}
          onChange={(e) => setCorreoInput(handleCorreo(e.target.value))}
          className="min-w-[200px] flex-1"
          aria-label="Filtrar por correo"
        />
      </div>

      {cargando && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2
            size={32}
            className="animate-spin text-text-muted"
          />
          <p className="m-0 text-sm text-text-secondary">
            Buscando registros...
          </p>
        </div>
      )}

      {error && !cargando && <ErrorMessage message={error} />}

      {mostrarEstadoVacio && (
        <div className="rounded-xl border border-border-strong bg-surface">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <Search
                size={28}
                strokeWidth={1.5}
                className="text-text-muted"
              />
            </span>
            <p className="m-0 max-w-md text-lg font-semibold text-text-secondary">
              No se encontraron registros
            </p>
            <p className="m-0 max-w-md text-sm text-text-muted">
              Intente con menos filtros o verifique la información ingresada
            </p>
          </div>
        </div>
      )}

      {!cargando && !error && !mostrarEstadoVacio && donaciones.length === 0 && (
        <EmptyState title="No hay donaciones registradas en el sistema." />
      )}

      {!cargando && !error && !mostrarEstadoVacio && donaciones.length > 0 && (
        <>
          <div className="hidden md:block">
            <AdminTablePanel>
              <AdminTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeaderCell>Fecha</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Donante</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Correo</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Teléfono</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                    <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                  </AdminTableRow>
                </AdminTableHead>
                <tbody>
                  {donacionesFiltradas.map((donacion: Donacion) => (
                    <AdminTableRow key={donacion.id}>
                      <AdminTableCell>
                        {formatearFecha(donacion.fecha)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <span
                          className={
                            donacion.anonimo
                              ? "font-medium italic text-slate-400"
                              : "font-medium"
                          }
                        >
                          {resaltarCoincidencia(
                            donacion.nombre,
                            filtros.nombre,
                          )}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        {resaltarCoincidencia(
                          donacion.correo,
                          filtros.correo,
                        )}
                      </AdminTableCell>
                      <AdminTableCell>
                        {donacion.telefono || (
                          <span className="text-slate-400 italic">
                            No provisto
                          </span>
                        )}
                      </AdminTableCell>
                      <AdminTableCell>
                        {renderEstadoBadge(donacion.estado)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <button
                          type="button"
                          onClick={() => abrirDetalle(donacion)}
                          aria-label="Ver solicitud"
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-info-bg hover:text-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                        >
                          <Eye
                            size={17}
                            strokeWidth={1.5}
                          />
                        </button>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTablePanel>
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
            {donacionesFiltradas.map((donacion: Donacion) => (
              <AdminRecordCard
                key={donacion.id}
                icon={<HandHeart size={20} />}
                accent={donacion.anonimo ? "#64748b" : "#003366"}
                code={`DON-${donacion.id}`}
                    title={resaltarCoincidencia(
                      donacion.nombre,
                      filtros.nombre,
                    )}
                    subtitle={formatearFecha(donacion.fecha)}
                    badges={renderEstadoBadge(donacion.estado)}
                    meta={[
                      {
                        icon: <Mail size={12} />,
                        label: "Correo",
                        value: resaltarCoincidencia(
                          donacion.correo,
                          filtros.correo,
                        ),
                      },
                  {
                    icon: <Phone size={12} />,
                    label: "Teléfono",
                    value: donacion.telefono || "No provisto",
                  },
                ]}
                actions={[
                  {
                    label: "Ver solicitud",
                    icon: <Eye size={15} />,
                    variant: "primary",
                    onClick: () => abrirDetalle(donacion),
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {donacionSeleccionada && (
          <motion.div
            className="fixed inset-0 z-[1300] bg-[#060f20]"
            initial={{ opacity: 0 }}
            animate={{ opacity: confirmacion ? 0 : 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {donacionSeleccionada && !confirmacion && (
        <DonacionDetalleModal
          donacion={donacionSeleccionada}
          formatearFecha={formatearFecha}
          onClose={cerrarDetalle}
          onAprobar={() => abrirConfirmacion("aprobar")}
          onRechazar={() => abrirConfirmacion("rechazar")}
        />
      )}

      <ConfirmacionAccionModal
        open={confirmacion === "aprobar" && donacionSeleccionada !== null}
        title="Confirmar aprobación"
        parteSubrayada="Aprobar donativo"
        mensaje="¿Estás seguro/a que quieres aprobar este donativo? Una vez aprobado su estado no podrá ser cambiado."
        confirmLabel="Aprobar"
        pendingLabel="Aprobando..."
        isPending={guardando}
        onConfirm={() => void confirmarCambioEstado("Aprobado")}
        onCancel={cancelarConfirmacion}
      />

      <ConfirmacionAccionModal
        open={confirmacion === "rechazar" && donacionSeleccionada !== null}
        title="Confirmar rechazo"
        parteSubrayada="Rechazar donativo"
        mensaje="¿Estás seguro/a que quieres rechazar este donativo? Una vez rechazado, su estado no podrá ser cambiado."
        confirmLabel="Rechazar"
        pendingLabel="Rechazando..."
        isPending={guardando}
        onConfirm={() => void confirmarCambioEstado("Rechazado")}
        onCancel={cancelarConfirmacion}
      />
    </AdminModule>
  );
}
