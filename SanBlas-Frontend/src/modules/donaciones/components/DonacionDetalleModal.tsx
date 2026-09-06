import { CalendarDays, Mail, Package, Phone, X } from "lucide-react";
import type { Donacion, EstadoDonacion } from "../../../services/donacionesService";
import { Button, EtiquetaSeccion } from "../../../shared/ui";

type DonacionDetalleModalProps = {
  donacion: Donacion;
  formatearFecha: (fecha: string) => string;
  onClose: () => void;
  onAprobar: () => void;
  onRechazar: () => void;
};

const esEstadoFinal = (estado: EstadoDonacion) =>
  estado === "Aprobado" || estado === "Rechazado";

export function DonacionDetalleModal({
  donacion,
  formatearFecha,
  onClose,
  onAprobar,
  onRechazar,
}: DonacionDetalleModalProps) {
  const estadoPermanente = esEstadoFinal(donacion.estado);

  return (
    <div
      className="fixed inset-0 z-[1300] overflow-y-auto"
      role="presentation"
    >
      <div className="flex min-h-full items-end justify-center md:items-center md:p-4">
        <div
          className="relative z-10 w-full rounded-[16px] bg-white shadow-[0_24px_64px_rgba(6,15,32,0.45)] md:max-w-[768px]"
          style={{ fontFamily: "'Geist', sans-serif" }}
          role="dialog"
          aria-modal="true"
          aria-label="Datos de la solicitud"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 rounded-t-[16px] bg-[#f1f5fa] px-6 py-4">
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold tracking-[0.22em] text-[#aa7323] uppercase">
                Solicitud
              </p>
              <h2
                className="m-0 mt-1 text-[24px] leading-tight font-semibold tracking-tight text-[#16243c]"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Datos de la solicitud
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle"
              className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[#16243c]/10 bg-white text-[#16243c] transition-colors duration-100 ease-out hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            >
              <X size={16} />
            </button>
          </header>

          <div className="flex flex-col gap-4 p-6">
            <div className="grid items-stretch gap-4 md:grid-cols-2">
              <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                <EtiquetaSeccion>Nombre del donante</EtiquetaSeccion>
                <p
                  className={
                    donacion.anonimo
                      ? "m-0 text-sm font-semibold italic text-[#16243c]/70"
                      : "m-0 text-sm font-semibold text-[#16243c]"
                  }
                >
                  {donacion.nombre}
                </p>
                <div className="h-px w-full bg-[#16243c]/10" />
                <div className="flex items-start gap-2">
                  <CalendarDays
                    size={16}
                    className="mt-0.5 shrink-0 text-[#aa7323]"
                  />
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
                      Fecha de ingreso
                    </p>
                    <p className="m-0 mt-1 text-sm font-semibold tabular-nums text-[#16243c]">
                      {formatearFecha(donacion.fecha)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-3 rounded-[12px] bg-[#f1f5fa] p-4">
                <EtiquetaSeccion>Contacto</EtiquetaSeccion>
                <div className="flex items-start gap-2">
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0 text-[#aa7323]"
                  />
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
                      Correo
                    </p>
                    <p className="m-0 mt-1 break-words text-sm font-semibold text-[#16243c]">
                      {donacion.correo || "—"}
                    </p>
                  </div>
                </div>
                <div className="h-px w-full bg-[#16243c]/10" />
                <div className="flex items-start gap-2">
                  <Phone
                    size={16}
                    className="mt-0.5 shrink-0 text-[#aa7323]"
                  />
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[#16243c]/60 uppercase">
                      Teléfono
                    </p>
                    <p className="m-0 mt-1 text-sm font-semibold tabular-nums text-[#16243c]">
                      {donacion.telefono || "—"}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <section className="flex flex-col gap-3 rounded-[12px] bg-[#e4eaf3] p-4">
              <EtiquetaSeccion>Insumos ofrecidos</EtiquetaSeccion>
              <div className="flex items-start gap-2">
                <Package
                  size={16}
                  className="mt-0.5 shrink-0 text-[#aa7323]"
                />
                <p className="m-0 min-w-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#16243c]">
                  {donacion.detalle || "—"}
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-[12px] border border-[#aa7323]/25 bg-[#aa7323]/[0.07] p-4">
              <EtiquetaSeccion>Cambiar estado</EtiquetaSeccion>
              {estadoPermanente ? (
                <p className="m-0 text-sm font-medium text-[#16243c]">
                  {donacion.estado} (permanente)
                </p>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="royal"
                    className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
                    onClick={onAprobar}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
                    onClick={onRechazar}
                  >
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
