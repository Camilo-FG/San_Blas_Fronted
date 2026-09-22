import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";

import { obtenerEtiquetaNivelCatequesis } from "../../../catequesis/constants/nivelesCatequesis";
import { formatearFechaEnvio } from "../../../../shared/utils/fechas";
import { resolveUploadedFileUrl } from "../../../../utils/files";
import { AdminRecordDetailSheet } from "../../../../shared/components/admin/AdminRecordDetailSheet";
import {
  Badge,
  Button,
  ErrorMessage,
  EtiquetaSeccion,
  type BadgeVariant,
} from "../../../../shared/ui";
import type {
  CatequesisEnrollmentRecord,
  EstadoInscripcionCatequesis,
} from "../Types/catequesis";

type DetalleSolicitudCatequesisModalProps = {
  solicitud: CatequesisEnrollmentRecord;
  detalleError?: string;
  accionError?: string;
  guardando: boolean;
  cerrarConEsc?: boolean;
  onApprove: () => void;
  onRechazar: () => void;
  onClose: () => void;
};

const normalizarEstado = (
  estado?: string | null,
): EstadoInscripcionCatequesis => {
  const estadoLower = estado?.toLowerCase().trim();

  if (estadoLower === "pendiente") return "pendiente";
  if (estadoLower === "aprobado" || estadoLower === "aprobada")
    return "aprobado";
  if (estadoLower === "rechazado" || estadoLower === "rechazada")
    return "rechazado";

  return "pendiente";
};

const obtenerTextoEstado = (estado?: string | null) => {
  switch (normalizarEstado(estado)) {
    case "pendiente":
      return "Pendiente";
    case "aprobado":
      return "Aprobado";
    case "rechazado":
      return "Rechazado";
    default:
      return "Desconocido";
  }
};

const getEstadoBadgeVariant = (estado?: string | null): BadgeVariant => {
  switch (normalizarEstado(estado)) {
    case "aprobado":
      return "success";
    case "rechazado":
      return "danger";
    default:
      return "warning";
  }
};

const nombreCompleto = (
  persona?: { nombre?: string | null; apellidos?: string | null } | null,
) =>
  `${persona?.nombre ?? ""} ${persona?.apellidos ?? ""}`.trim() || "—";

const valorOGuion = (valor?: string | number | null) => {
  if (valor === 0) return "0";
  if (valor === null || valor === undefined) return "—";
  const texto = String(valor).trim();
  return texto || "—";
};

function Separador() {
  return <div className="h-px w-full bg-[#16243c]/10" />;
}

function Campo({
  label,
  value,
  icon,
  tabular = false,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tabular?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
          {label}
        </p>
        <p
          className={`m-0 mt-1 break-words text-sm font-semibold text-[#16243c] ${
            tabular ? "tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function EnlaceArchivo({
  archivo,
  label,
}: {
  archivo?: File | string | null;
  label: string;
}) {
  const href =
    typeof archivo === "string" ? resolveUploadedFileUrl(archivo) : null;

  if (!href) {
    return (
      <p className="m-0 text-sm text-[#16243c]/70">
        No se adjuntó ningún archivo.
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border-2 border-solid border-royal-blue px-4 py-2.5 font-[Arial,Helvetica,sans-serif] text-sm font-bold text-royal-blue no-underline transition-colors duration-200 ease-out hover:border-royal-blue hover:bg-royal-blue hover:text-white focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-focus-ring focus-visible:outline-none"
    >
      <ImageIcon size={16} strokeWidth={2} className="shrink-0" />
      {label}
      <ExternalLink size={14} strokeWidth={2} className="shrink-0 opacity-70" />
    </a>
  );
}

export function DetalleSolicitudCatequesisModal({
  solicitud,
  detalleError,
  accionError,
  guardando,
  cerrarConEsc = true,
  onApprove,
  onRechazar,
  onClose,
}: DetalleSolicitudCatequesisModalProps) {
  const estado = normalizarEstado(solicitud.estado);

  return (
    <AdminRecordDetailSheet
      open
      title={nombreCompleto(solicitud.catequizando) || "Sin nombre"}
      subtitle={`Solicitud de catequesis · ${solicitud.codigoSolicitud || `CAT-${solicitud.id}`}`}
      badges={
        <Badge variant={getEstadoBadgeVariant(estado)}>
          {obtenerTextoEstado(solicitud.estado)}
        </Badge>
      }
      cerrarConEsc={cerrarConEsc}
      onClose={onClose}
      actions={
        estado !== "pendiente" ? (
          <p className="m-0 text-sm font-medium text-[#16243c]">
            {obtenerTextoEstado(solicitud.estado)}
            {estado === "aprobado" || estado === "rechazado"
              ? " (permanente)"
              : ""}
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              variant="royal"
              className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
              disabled={guardando}
              onClick={onApprove}
            >
              Aprobar
            </Button>
            <Button
              variant="secondary"
              className="rounded-lg! border-0! duration-150 ease-out hover:bg-slate-300!"
              disabled={guardando}
              onClick={onRechazar}
            >
              Rechazar
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {detalleError && <ErrorMessage message={detalleError} />}
        {accionError && <ErrorMessage message={accionError} />}

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                    <EtiquetaSeccion>Nombre del catequizando</EtiquetaSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {nombreCompleto(solicitud.catequizando)}
                    </p>
                    <Separador />
                    <Campo
                      label="Fecha de nacimiento"
                      value={valorOGuion(
                        solicitud.catequizando?.fechaNacimiento,
                      )}
                      tabular
                      icon={
                        <CalendarDays
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                    <Separador />
                    <Campo
                      label="Dirección"
                      value={valorOGuion(
                        solicitud.catequizando?.direccion?.direccionExacta,
                      )}
                      icon={
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                  </section>

                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                    <EtiquetaSeccion>Contacto</EtiquetaSeccion>
                    <Campo
                      label="Encargado"
                      value={nombreCompleto(solicitud.encargado)}
                      icon={
                        <User
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                    <Separador />
                    <Campo
                      label="Teléfono"
                      value={valorOGuion(solicitud.encargado?.telefono)}
                      tabular
                      icon={
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                    <Separador />
                    <Campo
                      label="Correo"
                      value={valorOGuion(
                        solicitud.personaInscribe?.correo ||
                          solicitud.encargado?.correo,
                      )}
                      icon={
                        <Mail
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                  </section>
                </div>

                <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
                  <EtiquetaSeccion>Información de catequesis</EtiquetaSeccion>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Campo
                      label="Centro"
                      value={valorOGuion(
                        solicitud.catequesis?.centroCatequesis,
                      )}
                      icon={
                        <GraduationCap
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                    <Campo
                      label="Nivel"
                      value={obtenerEtiquetaNivelCatequesis(
                        solicitud.catequesis?.nivelAInscribirse,
                      )}
                    />
                    <Campo
                      label="Código"
                      value={valorOGuion(
                        solicitud.codigoSolicitud || `CAT-${solicitud.id}`,
                      )}
                    />
<Campo
                  label="Fecha de ingreso"
                  value={formatearFechaEnvio(solicitud.fechaSolicitud)}
                  tabular
                  icon={
                    <CalendarDays
                      size={16}
                      className="mt-0.5 shrink-0 text-[#aa7323]"
                    />
                  }
                />
                <Campo
                  label="Fecha de revisión"
                  value={formatearFechaEnvio(
                    solicitud.fechaActualizacionEstado,
                  )}
                  tabular
                  icon={
                    <CalendarDays
                      size={16}
                      className="mt-0.5 shrink-0 text-[#aa7323]"
                    />
                  }
                />
                  </div>
                </section>

                <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
                  <EtiquetaSeccion>Datos de bautismo</EtiquetaSeccion>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Campo
                      label="Parroquia"
                      value={valorOGuion(
                        solicitud.catequizando?.bautismo?.parroquia,
                      )}
                    />
                    <Campo
                      label="Fecha"
                      value={valorOGuion(
                        solicitud.catequizando?.bautismo?.fecha,
                      )}
                      tabular
                    />
                    <Campo
                      label="Tomo"
                      value={valorOGuion(
                        solicitud.catequizando?.bautismo?.tomo,
                      )}
                    />
                    <Campo
                      label="Folio"
                      value={valorOGuion(
                        solicitud.catequizando?.bautismo?.folio,
                      )}
                    />
                    <Campo
                      label="Asiento"
                      value={valorOGuion(
                        solicitud.catequizando?.bautismo?.asiento,
                      )}
                    />
                  </div>
                  <Separador />
                  <div className="flex flex-col gap-2">
                    <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
                      Fe de bautismo
                    </p>
                    <EnlaceArchivo
                      archivo={solicitud.catequesis?.feBautismoArchivo}
                      label="Abrir fe de bautismo"
                    />
                  </div>
                </section>

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                    <EtiquetaSeccion>Adecuación educativa</EtiquetaSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {solicitud.catequizando?.adecuacion
                        ?.requiereAdecuacionCentroEducativo
                        ? "Sí requiere adecuación"
                        : "No requiere adecuación"}
                    </p>
                    <Separador />
                    <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c]">
                      {valorOGuion(
                        solicitud.catequizando?.adecuacion
                          ?.descripcionAdecuacion,
                      )}
                    </p>
                  </section>

                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                    <EtiquetaSeccion>Condición de salud</EtiquetaSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {solicitud.catequizando?.condicionSalud
                        ?.portadorEnfermedadCronica
                        ? "Porta enfermedad crónica"
                        : "Sin enfermedad crónica"}
                    </p>
                    <Separador />
                    <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c]">
                      {valorOGuion(
                        solicitud.catequizando?.condicionSalud
                          ?.descripcionEnfermedad,
                      )}
                    </p>
                  </section>
                </div>

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                    <EtiquetaSeccion>Madre o encargada</EtiquetaSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {nombreCompleto(solicitud.madreCatequizando)}
                    </p>
                    <Separador />
                    <Campo
                      label="Teléfono"
                      value={valorOGuion(solicitud.madreCatequizando?.telefono)}
                      tabular
                      icon={
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                    <Separador />
                    <Campo
                      label="Dirección"
                      value={[
                        solicitud.madreCatequizando?.direccion
                          ?.direccionExacta,
                        solicitud.madreCatequizando?.direccion?.ciudad,
                        solicitud.madreCatequizando?.direccion?.provincia,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                      icon={
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                  </section>

                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                    <EtiquetaSeccion>Padre</EtiquetaSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {nombreCompleto(solicitud.padreCatequizando)}
                    </p>
                    <Separador />
                    <Campo
                      label="Teléfono"
                      value={valorOGuion(solicitud.padreCatequizando?.telefono)}
                      tabular
                      icon={
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-[#aa7323]"
                        />
                      }
                    />
                  </section>
                </div>

                <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
                  <EtiquetaSeccion>Persona que inscribe</EtiquetaSeccion>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Campo
                      label="Nombre"
                      value={nombreCompleto(solicitud.personaInscribe)}
                    />
                    <Campo
                      label="Parentesco"
                      value={valorOGuion(
                        solicitud.personaInscribe?.parentesco ||
                          solicitud.encargado?.parentesco,
                      )}
                    />
                  </div>
                </section>

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
                    <EtiquetaSeccion>Datos de pago</EtiquetaSeccion>
                    <Campo
                      label="Método"
                      value={valorOGuion(solicitud.pago?.metodoPago)}
                    />
                    <Separador />
                    <Campo
                      label="Número de comprobante"
                      value={valorOGuion(solicitud.pago?.numeroComprobante)}
                    />
                  </section>

                  <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
                    <EtiquetaSeccion>Comprobante de pago</EtiquetaSeccion>
                    <EnlaceArchivo
                      archivo={solicitud.pago?.comprobanteArchivo}
                      label="Abrir imagen del comprobante"
                    />
                  </section>
                </div>

                {estado === "aprobado" && (
                  <div className="flex gap-2.5 rounded-[12px] border border-emerald-600/25 bg-emerald-600/10 p-4 text-sm leading-relaxed text-emerald-800">
                    <CheckCircle size={17} className="mt-0.5 shrink-0" />
                    <p className="m-0">
                      La inscripción ya fue aprobada e integrada al proceso de
                      catequesis.
                    </p>
                  </div>
                )}

                {estado === "rechazado" && (
                  <div className="flex gap-2.5 rounded-[12px] border border-red-300 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
                    <XCircle size={17} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="m-0 font-semibold">Solicitud rechazada.</p>
                      <p className="mt-1 mb-0">
                        Motivo:{" "}
                        {solicitud.observacionAdministrativa ||
                          solicitud.observaciones ||
                          "No se especificó motivo."}
                      </p>
                    </div>
                  </div>
                )}

                </div>
    </AdminRecordDetailSheet>
  );
}
