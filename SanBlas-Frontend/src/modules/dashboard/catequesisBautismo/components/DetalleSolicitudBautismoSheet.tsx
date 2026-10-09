import {
  CalendarDays,
  CheckCircle,
  Church,
  Heart,
  MapPin,
  Phone,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

import { AdminRecordDetailSheet } from "../../../../shared/components/admin/AdminRecordDetailSheet";
import {
  Campo,
  Separador,
  TituloSeccion,
  claseTarjeta,
  claseTarjetaClara,
  valorOGuion,
} from "../../../../shared/components/admin/AdminDetalleSecciones";
import {
  Badge,
  Button,
  ErrorMessage,
  FieldError,
  Input,
  Label,
} from "../../../../shared/ui";
import {
  ETIQUETA_CONDICION,
  ETIQUETA_ESTADO_CIVIL,
  type InscripcionCatequesisBautismo,
} from "../../../catequesisBautismo/types";
import {
  MAX_NOMBRE_BAUTISMO,
  filtrarNombreBautismo,
} from "../../../catequesisBautismo/validarCatequesisBautismo";
import {
  getEstadoBadgeClass,
  getEstadoBadgeVariant,
  textoEstadoCica,
} from "../../../cica/estadoCica";

// Formulario de certificación que llena el admin al aprobar (solo para pendientes).
export interface CertificadoBautismo {
  fechaInicioCatequesis: string;
  fechaFinalizacionCatequesis: string;
  responsableCertifica: string;
}

type DetalleSolicitudBautismoSheetProps = {
  solicitud: InscripcionCatequesisBautismo;
  accionError?: string | null;
  guardando: boolean;
  certificado: CertificadoBautismo;
  erroresCertificado: Record<string, string>;
  onCambiarCertificado: (
    campo: keyof CertificadoBautismo,
    valor: string,
  ) => void;
  cerrarConEsc?: boolean;
  onAprobar: () => void;
  onRechazar: () => void;
  onClose: () => void;
};

// Helpers compartidos con la página: la tabla y el detalle formatean igual.
export const nombreCompleto = (persona: {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
}) =>
  [persona.nombre, persona.apellido1, persona.apellido2].filter(Boolean).join(" ");

export const formatearFecha = (valor?: string | null) => {
  if (!valor) return "—";
  const soloDia = valor.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(soloDia)) {
    const [anio, mes, dia] = soloDia.split("-");
    if (valor.length <= 10) return `${dia}/${mes}/${anio}`;
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-CR");
};

// Sheet de detalle de una inscripción de catequesis para el bautismo,
// con el mismo estilo que el detalle de catequesis: secciones tarjetadas e iconos por campo.
// El formulario de certificación se mantiene intacto, solo cambia dónde se ve.
export function DetalleSolicitudBautismoSheet({
  solicitud,
  accionError,
  guardando,
  certificado,
  erroresCertificado,
  onCambiarCertificado,
  cerrarConEsc = true,
  onAprobar,
  onRechazar,
  onClose,
}: DetalleSolicitudBautismoSheetProps) {
  const esPendiente = solicitud.estado === "Pendiente";

  return (
    <AdminRecordDetailSheet
      open
      title={nombreCompleto(solicitud) || "Sin nombre"}
      subtitle="Catequesis para el bautismo"
      badges={
        <Badge
          variant={getEstadoBadgeVariant(solicitud.estado)}
          className={getEstadoBadgeClass(solicitud.estado)}
        >
          {textoEstadoCica(solicitud.estado)}
        </Badge>
      }
      cerrarConEsc={cerrarConEsc}
      cerrarAlClicFuera={cerrarConEsc}
      onClose={onClose}
      actions={
        esPendiente ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              variant="royal"
              className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
              disabled={guardando}
              onClick={onAprobar}
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
          </div>
        ) : (
          <p className="m-0 text-sm font-medium text-[#16243c] dark:text-[#b7c3d4]">
            {textoEstadoCica(solicitud.estado)} (permanente)
          </p>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {accionError && <ErrorMessage message={accionError} />}

        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <section className={claseTarjetaClara}>
            <TituloSeccion>Datos personales</TituloSeccion>
            <p className="m-0 text-lg font-bold tracking-tight text-[#16243c] dark:text-[#f3f6fa]">
              {nombreCompleto(solicitud)}
            </p>
            <Separador />
            <Campo label="Cédula" value={valorOGuion(solicitud.cedula)} tabular icon={<User size={16} className="shrink-0" />} />
            <Separador />
            <Campo
              label="Nacimiento"
              value={formatearFecha(solicitud.fechaNacimiento)}
              tabular
              icon={<CalendarDays size={16} className="shrink-0" />}
            />
            <Separador />
            <Campo
              label="Estado civil"
              value={ETIQUETA_ESTADO_CIVIL[solicitud.estadoCivil] ?? solicitud.estadoCivil}
              icon={<Heart size={16} className="shrink-0" />}
            />
            <Campo
              label="Condición"
              value={ETIQUETA_CONDICION[solicitud.condicion] ?? solicitud.condicion}
              icon={<UserCheck size={16} className="shrink-0" />}
            />
          </section>

          <section className={claseTarjetaClara}>
            <TituloSeccion>Contacto y ubicación</TituloSeccion>
            <Campo label="Teléfono" value={valorOGuion(solicitud.telefono)} tabular icon={<Phone size={16} className="shrink-0" />} />
            <Separador />
            <Campo label="Parroquia de origen" value={valorOGuion(solicitud.parroquiaOrigen)} icon={<Church size={16} className="shrink-0" />} />
            <Separador />
            <Campo label="Provincia" value={valorOGuion(solicitud.provincia)} icon={<MapPin size={16} className="shrink-0" />} />
            <Campo label="Cantón" value={valorOGuion(solicitud.canton)} />
            <Campo label="Distrito" value={valorOGuion(solicitud.distrito)} />
            <Campo label="Barrio" value={valorOGuion(solicitud.barrio)} />
          </section>
        </div>

        <section className={claseTarjeta}>
          <TituloSeccion>Fechas del trámite</TituloSeccion>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo
              label="Fecha de solicitud"
              value={formatearFecha(solicitud.fechaSolicitud)}
              tabular
              icon={<CalendarDays size={16} className="shrink-0" />}
            />
            <Campo
              label="Fecha de revisión"
              value={formatearFecha(solicitud.fechaActualizacionEstado)}
              tabular
              icon={<CalendarDays size={16} className="shrink-0" />}
            />
          </div>
        </section>

        {solicitud.estado === "Aprobada" && (
          <div className="flex gap-2.5 rounded-[12px] border border-emerald-600/25 bg-emerald-600/10 p-4 text-sm leading-relaxed text-emerald-800 dark:border-[#35d6a0]/30 dark:bg-[rgba(53,214,160,0.10)] dark:text-[#35d6a0]">
            <CheckCircle size={17} className="mt-0.5 shrink-0" />
            <div>
              <p className="m-0 font-semibold">Catequesis certificada.</p>
              <p className="mt-1 mb-0">
                Del {formatearFecha(solicitud.fechaInicioCatequesis)} al{" "}
                {formatearFecha(solicitud.fechaFinalizacionCatequesis)}. Certifica{" "}
                {solicitud.responsableCertifica?.trim() || "—"}.
              </p>
              <p className="mt-1 mb-0 text-xs">
                Aprobada el {formatearFecha(solicitud.fechaActualizacionEstado)}
              </p>
            </div>
          </div>
        )}

        {solicitud.estado === "Rechazada" && (
          <div className="flex gap-2.5 rounded-[12px] border border-red-300 bg-red-50 p-4 text-sm leading-relaxed text-red-800 dark:border-[#ff6b6b]/50 dark:bg-[#e03131] dark:text-white">
            <XCircle size={17} className="mt-0.5 shrink-0" />
            <div>
              <p className="m-0 font-semibold">Solicitud rechazada.</p>
              <p className="mt-1 mb-0">
                Motivo:{" "}
                {solicitud.observacionAdministrativa || "No se especificó motivo."}
              </p>
              <p className="mt-1 mb-0 text-xs">
                Rechazada el {formatearFecha(solicitud.fechaActualizacionEstado)}
              </p>
            </div>
          </div>
        )}

        {esPendiente && (
          <section className={claseTarjeta}>
            <TituloSeccion>Certificación de catequesis</TituloSeccion>
            {/* Al aprobar hay que certificar las fechas y el responsable; la validación sigue en validarCertificacion */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1 text-sm">
                <Label required>Inicio de las catequesis</Label>
                <Input
                  type="date"
                  value={certificado.fechaInicioCatequesis}
                  hasError={Boolean(erroresCertificado.fechaInicioCatequesis)}
                  onChange={(event) =>
                    onCambiarCertificado(
                      "fechaInicioCatequesis",
                      event.target.value,
                    )
                  }
                />
                <FieldError message={erroresCertificado.fechaInicioCatequesis} />
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <Label required>Finalización de las catequesis</Label>
                <Input
                  type="date"
                  value={certificado.fechaFinalizacionCatequesis}
                  hasError={Boolean(erroresCertificado.fechaFinalizacionCatequesis)}
                  onChange={(event) =>
                    onCambiarCertificado(
                      "fechaFinalizacionCatequesis",
                      event.target.value,
                    )
                  }
                />
                <FieldError message={erroresCertificado.fechaFinalizacionCatequesis} />
              </div>
              <div className="flex flex-col gap-1 text-sm sm:col-span-2">
                <Label required>Responsable que certifica</Label>
                <Input
                  value={certificado.responsableCertifica}
                  maxLength={MAX_NOMBRE_BAUTISMO}
                  placeholder="Ej: Padre Juan Mora"
                  hasError={Boolean(erroresCertificado.responsableCertifica)}
                  onChange={(event) =>
                    onCambiarCertificado(
                      "responsableCertifica",
                      filtrarNombreBautismo(event.target.value),
                    )
                  }
                />
                <FieldError message={erroresCertificado.responsableCertifica} />
              </div>
            </div>
          </section>
        )}
      </div>
    </AdminRecordDetailSheet>
  );
}
