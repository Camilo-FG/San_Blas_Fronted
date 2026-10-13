import {
  BookOpen,
  CalendarDays,
  CheckCircle,
  Church,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  User,
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
import { Badge, Button, ErrorMessage } from "../../../../shared/ui";
import { SACRAMENTOS_CICA } from "../../../cica/sacramentosCica";
import {
  getEstadoBadgeClass,
  getEstadoBadgeVariant,
  textoEstadoCica,
} from "../../../cica/estadoCica";
import type { InscripcionCica } from "../../../cica/types";

type DetalleSolicitudCicaSheetProps = {
  solicitud: InscripcionCica;
  accionError?: string | null;
  guardando: boolean;
  cerrarConEsc?: boolean;
  onAprobar: () => void;
  onRechazar: () => void;
  onClose: () => void;
};

// Helpers compartidos con la página: la tabla y el detalle formatean igual.
export const etiquetaCivil: Record<string, string> = {
  soltero: "Soltero(a)",
  matrimonio_civil: "Matrimonio civil",
  union_libre: "Unión libre",
};

export const nombreCompleto = (persona: {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
}) =>
  [persona.nombre, persona.apellido1, persona.apellido2].filter(Boolean).join(" ");

export const sacramentos = (item: InscripcionCica) =>
  SACRAMENTOS_CICA.filter((sacramento) => item[sacramento.clave])
    .map((sacramento) => sacramento.etiqueta)
    .join(", ") || "—";

export const formatearFecha = (valor?: string | null) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-CR");
};

// Sheet de detalle de una inscripción CICA, con el mismo estilo que el detalle de catequesis:
// secciones tarjetadas, campos con icono y separadores, en vez del grid plano de label/valor.
export function DetalleSolicitudCicaSheet({
  solicitud,
  accionError,
  guardando,
  cerrarConEsc = true,
  onAprobar,
  onRechazar,
  onClose,
}: DetalleSolicitudCicaSheetProps) {
  const esPendiente = solicitud.estado === "Pendiente";

  return (
    <AdminRecordDetailSheet
      open
      title={nombreCompleto(solicitud) || "Sin nombre"}
      subtitle="Inscripción CICA"
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
            <Campo label="Nacionalidad" value={valorOGuion(solicitud.nacionalidad)} icon={<Globe size={16} className="shrink-0" />} />
            <Campo
              label="Estado civil"
              value={etiquetaCivil[solicitud.estadoCivil] ?? solicitud.estadoCivil}
              icon={<Heart size={16} className="shrink-0" />}
            />
          </section>

          <section className={claseTarjetaClara}>
            <TituloSeccion>Contacto</TituloSeccion>
            <Campo label="Teléfono" value={valorOGuion(solicitud.telefono)} tabular icon={<Phone size={16} className="shrink-0" />} />
            <Separador />
            <Campo label="Correo" value={valorOGuion(solicitud.correo)} icon={<Mail size={16} className="shrink-0" />} />
            <Separador />
            <Campo label="Dirección del hogar" value={valorOGuion(solicitud.direccionHogar)} icon={<MapPin size={16} className="shrink-0" />} />
          </section>
        </div>

        <section className={claseTarjeta}>
          <TituloSeccion>Sacramentos y fe</TituloSeccion>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Sacramentos a recibir" value={sacramentos(solicitud)} icon={<Church size={16} className="shrink-0" />} />
            <Campo
              label="Religión"
              value={
                solicitud.esCatolico
                  ? "Católico"
                  : solicitud.otraIglesia?.trim() || "Otra iglesia"
              }
              icon={<BookOpen size={16} className="shrink-0" />}
            />
            <div className="sm:col-span-2">
              <Campo label="Observación" value={valorOGuion(solicitud.observacion?.trim())} />
            </div>
          </div>
        </section>

        <section className={claseTarjeta}>
          <TituloSeccion>Familia</TituloSeccion>
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo
              label="Padre"
              value={nombreCompleto({
                nombre: solicitud.padreNombre,
                apellido1: solicitud.padreApellido1,
                apellido2: solicitud.padreApellido2,
              })}
              icon={<User size={16} className="shrink-0" />}
            />
            <Campo
              label="Madre"
              value={nombreCompleto({
                nombre: solicitud.madreNombre,
                apellido1: solicitud.madreApellido1,
                apellido2: solicitud.madreApellido2,
              })}
              icon={<User size={16} className="shrink-0" />}
            />
            <Campo
              label="Cónyuge o compañero(a)"
              value={
                solicitud.conyugeNombre
                  ? nombreCompleto({
                      nombre: solicitud.conyugeNombre,
                      apellido1: solicitud.conyugeApellido1 ?? "",
                      apellido2: solicitud.conyugeApellido2,
                    })
                  : "—"
              }
              icon={<Heart size={16} className="shrink-0" />}
            />
          </div>
        </section>

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
              <p className="m-0 font-semibold">Inscripción aprobada.</p>
              <p className="mt-1 mb-0">
                {solicitud.observacionAdministrativa?.trim() || "Sin comentario de aprobación"}
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
      </div>
    </AdminRecordDetailSheet>
  );
}
