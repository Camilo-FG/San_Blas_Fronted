import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle,
  Church,
  ExternalLink,
  FileSignature,
  Heart,
  Home,
  IdCard,
  Image as ImageIcon,
  MapPin,
  PencilLine,
  User,
  Users,
  XCircle,
} from "lucide-react";

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
  CicaSolicitudRecord,
  EstadoSolicitudCica,
} from "../Types/cica";

type DetalleSolicitudCicaModalProps = {
  solicitud: CicaSolicitudRecord;
  detalleError?: string;
  accionError?: string;
  guardando: boolean;
  cerrarConEsc?: boolean;
  onApprove: () => void;
  onRechazar: () => void;
  onSolicitarModificacion: () => void;
  onClose: () => void;
};

const normalizarEstado = (
  estado?: string | null,
): EstadoSolicitudCica => {
  const estadoLower = estado?.toLowerCase().trim();

  if (estadoLower === "pendiente") return "pendiente";
  if (estadoLower === "aprobado" || estadoLower === "aprobada")
    return "aprobado";
  if (estadoLower === "rechazado" || estadoLower === "rechazada")
    return "rechazado";
  if (
    estadoLower === "modificacion_solicitada" ||
    estadoLower === "modificacion" ||
    estadoLower === "en_modificacion" ||
    estadoLower === "modificación solicitada" ||
    estadoLower === "modificacion solicitada"
  )
    return "modificacion_solicitada";

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
    case "modificacion_solicitada":
      return "Modificación solicitada";
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
    case "modificacion_solicitada":
      return "info";
    default:
      return "warning";
  }
};

const nombreCompleto = (
  persona?: { nombre?: string | null; apellidos?: string | null } | null,
) =>
  `${persona?.nombre ?? ""} ${persona?.apellidos ?? ""}`.trim() || "—";

const valorOGuion = (valor?: string | number | boolean | null) => {
  if (valor === 0) return "0";
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  const texto = String(valor).trim();
  return texto || "—";
};

const textoSacramento = (valor?: boolean | string | null) => {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  const texto = String(valor).trim();
  if (!texto) return "—";
  const lower = texto.toLowerCase();
  if (["true", "si", "sí", "1"].includes(lower)) return "Sí";
  if (["false", "no", "0"].includes(lower)) return "No";
  return texto;
};

const claseTarjetaClara =
  "flex flex-col gap-4 rounded-2xl bg-[#f1f5fa] p-5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]";
const claseTarjeta =
  "flex flex-col gap-4 rounded-2xl bg-[#e4eaf3] p-5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]";

function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h4 className="m-0 flex items-center gap-2.5 text-sm font-bold text-royal-blue dark:text-[#f3f6fa]">
      <span className="h-4 w-1 rounded-full bg-[#94a3b8] dark:bg-[#d9a928]" aria-hidden="true" />
      {children}
    </h4>
  );
}

function Separador() {
  return <div className="h-px w-full bg-[#16243c]/10 dark:bg-white/10" />;
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
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#aa7323] dark:bg-white/5 dark:text-[#d9a928]">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 pt-0.5">
        <p className="m-0 text-xs font-medium text-slate-500 dark:text-[#7f8da3]">{label}</p>
        <p
          className={`m-0 mt-0.5 break-words text-[0.95rem] font-semibold leading-snug text-[#16243c] dark:text-[#f3f6fa] ${
            tabular ? "tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function FirmaCica({ firma }: { firma?: File | string | null }) {
  const [falloCarga, setFalloCarga] = useState(false);
  const href =
    typeof firma === "string" ? resolveUploadedFileUrl(firma) : null;

  if (!href || falloCarga) {
    return (
      <p className="m-0 flex items-center gap-2 text-sm text-[#16243c]/70 dark:text-[#b7c3d4]">
        <ImageIcon size={16} className="shrink-0" />
        {falloCarga
          ? "No se pudo cargar la firma."
          : "No se adjuntó la firma."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <img
        src={href}
        alt="Firma del adulto"
        onError={() => setFalloCarga(true)}
        className="max-h-40 w-fit max-w-full rounded-xl border border-[#16243c]/10 bg-white object-contain p-2 dark:border-white/10 dark:bg-white/5"
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border-2 border-solid border-royal-blue px-4 py-2.5 font-[Arial,Helvetica,sans-serif] text-sm font-bold text-royal-blue no-underline transition-colors duration-200 ease-out hover:border-royal-blue hover:bg-royal-blue hover:text-white focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-focus-ring focus-visible:outline-none dark:border-[#d9a928] dark:text-[#f3f6fa] dark:hover:border-[#d9a928] dark:hover:bg-[#d9a928] dark:hover:text-[#040b16] dark:focus-visible:ring-[#d9a928]"
      >
        <FileSignature size={16} strokeWidth={2} className="shrink-0" />
        Ver firma
        <ExternalLink size={14} strokeWidth={2} className="shrink-0 opacity-70" />
      </a>
    </div>
  );
}

export function DetalleSolicitudCicaModal({
  solicitud,
  detalleError,
  accionError,
  guardando,
  cerrarConEsc = true,
  onApprove,
  onRechazar,
  onSolicitarModificacion,
  onClose,
}: DetalleSolicitudCicaModalProps) {
  const estado = normalizarEstado(solicitud.estado);
  const nombreAdulto = nombreCompleto(solicitud.adulto);
  const nombreConyuge = nombreCompleto(solicitud.conyuge);
  const direccionTexto =
    [
      solicitud.direccion?.direccionExacta,
      solicitud.direccion?.barrio,
      solicitud.direccion?.ciudad,
      solicitud.direccion?.provincia,
    ]
      .filter((parte) => parte?.trim())
      .join(", ") || "—";
  const motivo =
    solicitud.motivo ||
    solicitud.observacionAdministrativa ||
    solicitud.observaciones ||
    "No se especificó motivo.";

  return (
    <AdminRecordDetailSheet
      open
      title={nombreAdulto !== "—" ? nombreAdulto : "Sin nombre"}
      subtitle="Solicitud CICA"
      badges={
        <Badge
          variant={getEstadoBadgeVariant(estado)}
          className={
            estado === "aprobado"
              ? "dark:border-[#35d6a0] dark:bg-[rgba(53,214,160,0.10)] dark:text-[#35d6a0]"
              : estado === "rechazado"
                ? "dark:border-[#e66a6a] dark:bg-[rgba(230,106,106,0.10)] dark:text-[#e66a6a]"
                : "dark:border-[#f2a34a] dark:bg-[rgba(242,163,74,0.10)] dark:text-[#f2a34a]"
          }
        >
          {obtenerTextoEstado(solicitud.estado)}
        </Badge>
      }
      cerrarConEsc={cerrarConEsc}
      onClose={onClose}
      actions={
        estado !== "pendiente" ? (
          <p className="m-0 text-sm font-medium text-[#16243c] dark:text-[#b7c3d4]">
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
              className="rounded-lg! border-0! duration-150 ease-out hover:bg-slate-300! dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
              disabled={guardando}
              onClick={onRechazar}
            >
              Rechazar
            </Button>
            <Button
              variant="secondary"
              className="rounded-lg! border-0! duration-150 ease-out hover:bg-slate-300! dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
              disabled={guardando}
              onClick={onSolicitarModificacion}
            >
              Solicitar modificación
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
            <TituloSeccion>Adulto</TituloSeccion>
            <p className="m-0 text-lg font-bold tracking-tight text-[#16243c] dark:text-[#f3f6fa]">
              {nombreAdulto}
            </p>
            <Separador />
            <Campo
              label="Cédula"
              value={valorOGuion(solicitud.adulto?.cedula)}
              tabular
              icon={<IdCard size={16} className="shrink-0" />}
            />
            <Separador />
            <Campo
              label="Fecha de nacimiento"
              value={formatearFechaEnvio(
                solicitud.adulto?.fechaNacimiento ?? "",
              )}
              tabular
              icon={<CalendarDays size={16} className="shrink-0" />}
            />
          </section>

          <section className={claseTarjetaClara}>
            <TituloSeccion>Estado civil y cónyuge</TituloSeccion>
            <Campo
              label="Estado civil"
              value={valorOGuion(solicitud.adulto?.estadoCivil)}
              icon={<Heart size={16} className="shrink-0" />}
            />
            <Separador />
            <Campo
              label="Cónyuge"
              value={nombreConyuge}
              icon={<User size={16} className="shrink-0" />}
            />
          </section>
        </div>

        <section className={claseTarjeta}>
          <TituloSeccion>Sacramentos</TituloSeccion>
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo
              label="Bautismo"
              value={textoSacramento(solicitud.sacramentos?.bautismo)}
              icon={<Church size={16} className="shrink-0" />}
            />
            <Campo
              label="Confirmación"
              value={textoSacramento(solicitud.sacramentos?.confirmacion)}
            />
            <Campo
              label="Eucaristía"
              value={textoSacramento(solicitud.sacramentos?.eucaristia)}
            />
          </div>
          {solicitud.sacramentos?.detalle?.trim() && (
            <>
              <Separador />
              <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c] dark:text-[#b7c3d4]">
                {solicitud.sacramentos.detalle}
              </p>
            </>
          )}
        </section>

        {(nombreCompleto(solicitud.padre) !== "—" ||
          nombreCompleto(solicitud.madre) !== "—") && (
          <div className="grid items-stretch gap-4 md:grid-cols-2">
            {nombreCompleto(solicitud.padre) !== "—" && (
              <section className={claseTarjetaClara}>
                <TituloSeccion>Padre</TituloSeccion>
                <p className="m-0 text-base font-bold text-[#16243c] dark:text-[#f3f6fa]">
                  {nombreCompleto(solicitud.padre)}
                </p>
              </section>
            )}
            {nombreCompleto(solicitud.madre) !== "—" && (
              <section className={claseTarjetaClara}>
                <TituloSeccion>Madre</TituloSeccion>
                <p className="m-0 text-base font-bold text-[#16243c] dark:text-[#f3f6fa]">
                  {nombreCompleto(solicitud.madre)}
                </p>
              </section>
            )}
          </div>
        )}

        <section className={claseTarjetaClara}>
          <TituloSeccion>Dirección y ubicación</TituloSeccion>
          <Campo
            label="Dirección"
            value={direccionTexto}
            icon={<MapPin size={16} className="shrink-0" />}
          />
          <Separador />
          <Campo
            label="Barrio"
            value={valorOGuion(solicitud.direccion?.barrio)}
            icon={<Home size={16} className="shrink-0" />}
          />
        </section>

        <section className={claseTarjeta}>
          <TituloSeccion>Parroquia, fechas y condición</TituloSeccion>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo
              label="Parroquia"
              value={valorOGuion(solicitud.parroquia)}
              icon={<Church size={16} className="shrink-0" />}
            />
            <Campo
              label="Condición"
              value={valorOGuion(solicitud.condicion)}
              icon={<Users size={16} className="shrink-0" />}
            />
            <Campo
              label="Religión"
              value={valorOGuion(
                solicitud.religion ?? solicitud.adulto?.religion,
              )}
            />
            <Campo
              label="Fecha de solicitud"
              value={formatearFechaEnvio(solicitud.fechaSolicitud)}
              tabular
              icon={<CalendarDays size={16} className="shrink-0" />}
            />
            <Campo
              label="Fecha de revisión"
              value={formatearFechaEnvio(
                solicitud.fechaActualizacionEstado ?? "",
              )}
              tabular
              icon={<CalendarDays size={16} className="shrink-0" />}
            />
          </div>
        </section>

        <section className={claseTarjetaClara}>
          <TituloSeccion>Observaciones</TituloSeccion>
          <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c] dark:text-[#b7c3d4]">
            {valorOGuion(solicitud.observaciones)}
          </p>
        </section>

        <section className={claseTarjeta}>
          <TituloSeccion>Firma</TituloSeccion>
          <FirmaCica firma={solicitud.firma} />
        </section>

        {estado === "aprobado" && (
          <div className="flex gap-2.5 rounded-[12px] border border-emerald-600/25 bg-emerald-600/10 p-4 text-sm leading-relaxed text-emerald-800 dark:border-[#35d6a0]/30 dark:bg-[rgba(53,214,160,0.10)] dark:text-[#35d6a0]">
            <CheckCircle size={17} className="mt-0.5 shrink-0" />
            <div>
              <p className="m-0">
                La solicitud ya fue aprobada e integrada al proceso CICA.
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
          <div className="flex gap-2.5 rounded-[12px] border border-red-300 bg-red-50 p-4 text-sm leading-relaxed text-red-800 dark:border-[#ff6b6b]/50 dark:bg-[#e03131] dark:text-white">
            <XCircle size={17} className="mt-0.5 shrink-0" />
            <div>
              <p className="m-0 font-semibold">Solicitud rechazada.</p>
              <p className="mt-1 mb-0">Motivo: {motivo}</p>
            </div>
          </div>
        )}

        {estado === "modificacion_solicitada" && (
          <div className="flex gap-2.5 rounded-[12px] border border-sky-300 bg-sky-50 p-4 text-sm leading-relaxed text-sky-900 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-100">
            <PencilLine size={17} className="mt-0.5 shrink-0" />
            <div>
              <p className="m-0 font-semibold">Modificación solicitada.</p>
              <p className="mt-1 mb-0">
                Observaciones:{" "}
                {solicitud.observacionAdministrativa ||
                  solicitud.observaciones ||
                  "No se especificaron observaciones."}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminRecordDetailSheet>
  );
}
