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

const claseTarjetaClara =
  "flex flex-col gap-4 rounded-2xl bg-[#f1f5fa] p-5";
const claseTarjeta =
  "flex flex-col gap-4 rounded-2xl bg-[#e4eaf3] p-5";

function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h4 className="m-0 flex items-center gap-2.5 text-sm font-bold text-royal-blue">
      <span className="h-4 w-1 rounded-full bg-[#94a3b8]" aria-hidden="true" />
      {children}
    </h4>
  );
}

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
    <div className="flex items-start gap-3">
      {icon ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#aa7323]">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 pt-0.5">
        <p className="m-0 text-xs font-medium text-slate-500">{label}</p>
        <p
          className={`m-0 mt-0.5 break-words text-[0.95rem] font-semibold leading-snug text-[#16243c] ${
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
      <div className="flex flex-col gap-5">
        {detalleError && <ErrorMessage message={detalleError} />}
        {accionError && <ErrorMessage message={accionError} />}

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <section className={claseTarjetaClara}>
                    <TituloSeccion>Catequizando</TituloSeccion>
                    <p className="m-0 text-lg font-bold tracking-tight text-[#16243c]">
                      {nombreCompleto(solicitud.catequizando)}
                    </p>
                    <Separador />
                    <Campo
                      label="Fecha de nacimiento"
                      value={formatearFechaEnvio(
                        solicitud.catequizando?.fechaNacimiento ?? "",
                      )}
                      tabular
                      icon={
                        <CalendarDays
                          size={16}
                          className="shrink-0"
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
                          className="shrink-0"
                        />
                      }
                    />
                  </section>

                  <section className={claseTarjetaClara}>
                    <TituloSeccion>Contacto</TituloSeccion>
                    <Campo
                      label="Encargado"
                      value={nombreCompleto(solicitud.encargado)}
                      icon={
                        <User
                          size={16}
                          className="shrink-0"
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
                          className="shrink-0"
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
                          className="shrink-0"
                        />
                      }
                    />
                    <Separador />
                    <Campo
                      label="Parentesco"
                      value={valorOGuion(
                        solicitud.personaInscribe?.parentesco ||
                          solicitud.encargado?.parentesco,
                      )}
                    />
                  </section>
                </div>

                <section className={claseTarjeta}>
                  <TituloSeccion>Información de catequesis</TituloSeccion>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Campo
                      label="Centro"
                      value={valorOGuion(
                        solicitud.catequesis?.centroCatequesis,
                      )}
                      icon={
                        <GraduationCap
                          size={16}
                          className="shrink-0"
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
                          className="shrink-0"
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
                          className="shrink-0"
                        />
                      }
                    />
                  </div>
                </section>

                <section className={claseTarjeta}>
                  <TituloSeccion>Fe de bautismo</TituloSeccion>
                  <EnlaceArchivo
                    archivo={solicitud.catequesis?.feBautismoArchivo}
                    label="Abrir fe de bautismo"
                  />
                </section>

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <section className={claseTarjetaClara}>
                    <TituloSeccion>Adecuación educativa</TituloSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {solicitud.catequizando?.adecuacion
                        ?.requiereAdecuacionCentroEducativo
                        ? "Sí requiere adecuación"
                        : "No requiere adecuación"}
                    </p>
                    {solicitud.catequizando?.adecuacion
                      ?.requiereAdecuacionCentroEducativo && (
                      <>
                        <Separador />
                        <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c]">
                          {valorOGuion(
                            solicitud.catequizando?.adecuacion
                              ?.descripcionAdecuacion,
                          )}
                        </p>
                      </>
                    )}
                  </section>

                  <section className={claseTarjetaClara}>
                    <TituloSeccion>Condición de salud</TituloSeccion>
                    <p className="m-0 text-sm font-semibold text-[#16243c]">
                      {solicitud.catequizando?.condicionSalud
                        ?.portadorEnfermedadCronica
                        ? "Porta enfermedad crónica"
                        : "Sin enfermedad crónica"}
                    </p>
                    {solicitud.catequizando?.condicionSalud
                      ?.portadorEnfermedadCronica && (
                      <>
                        <Separador />
                        <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c]">
                          {valorOGuion(
                            solicitud.catequizando?.condicionSalud
                              ?.descripcionEnfermedad,
                          )}
                        </p>
                      </>
                    )}
                  </section>
                </div>

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  {nombreCompleto(solicitud.madreCatequizando) !== "—" && (
                  <section className={claseTarjetaClara}>
                    <TituloSeccion>Madre o encargada</TituloSeccion>
                    <p className="m-0 text-base font-bold text-[#16243c]">
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
                          className="shrink-0"
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
                          className="shrink-0"
                        />
                      }
                    />
                  </section>
                  )}

                  {nombreCompleto(solicitud.padreCatequizando) !== "—" && (
                  <section className={claseTarjetaClara}>
                    <TituloSeccion>Padre</TituloSeccion>
                    <p className="m-0 text-base font-bold text-[#16243c]">
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
                          className="shrink-0"
                        />
                      }
                    />
                  </section>
                  )}
                </div>

                <section className={claseTarjeta}>
                  <TituloSeccion>Comprobante de pago</TituloSeccion>
                  <EnlaceArchivo
                    archivo={solicitud.pago?.comprobanteArchivo}
                    label="Abrir imagen del comprobante"
                  />
                </section>

                {estado === "aprobado" && (
                  <div className="flex gap-2.5 rounded-[12px] border border-emerald-600/25 bg-emerald-600/10 p-4 text-sm leading-relaxed text-emerald-800">
                    <CheckCircle size={17} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="m-0">
                        La inscripción ya fue aprobada e integrada al proceso de
                        catequesis.
                      </p>
                      {solicitud.observacionAdministrativa?.trim() && (
                        <p className="mt-1 mb-0">
                          Observación: {solicitud.observacionAdministrativa}
                        </p>
                      )}
                    </div>
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
