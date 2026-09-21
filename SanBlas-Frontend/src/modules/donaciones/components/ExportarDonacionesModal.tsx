import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button, LineaDoradaTitulo, Modal } from "../../../shared/ui";

export type FormatoExportacionDonaciones = "csv" | "pdf";
export type EstadoExportacionDonaciones =
  | "todos"
  | "pendiente"
  | "aprobado"
  | "rechazado";

export type OpcionesExportacionDonaciones = {
  formato: FormatoExportacionDonaciones;
  estado: EstadoExportacionDonaciones;
  desde: string;
  hasta: string;
};

type ExportarDonacionesModalProps = {
  onClose: () => void;
  onConfirm: (opciones: OpcionesExportacionDonaciones) => void;
};

const rangoFechasValido = (desde: string, hasta: string): boolean => {
  if (!desde || !hasta) return true;
  return (
    new Date(`${desde}T00:00:00`).getTime() <=
    new Date(`${hasta}T00:00:00`).getTime()
  );
};

const claseInterruptor = (activo: boolean) =>
  `inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 text-sm transition-colors ${
    activo
      ? "bg-[#003366] font-semibold text-white"
      : "bg-transparent font-medium text-text-secondary hover:bg-surface-muted"
  }`;

const claseCampo = (extra = "") =>
  `min-h-10 w-full rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none ${extra}`.trim();

export function ExportarDonacionesModal({
  onClose,
  onConfirm,
}: ExportarDonacionesModalProps) {
  const [formato, setFormato] =
    useState<FormatoExportacionDonaciones>("csv");
  const [estado, setEstado] =
    useState<EstadoExportacionDonaciones>("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const rangoValido = rangoFechasValido(desde, hasta);

  return (
    <Modal
      onClose={onClose}
      title="Exportar tabla"
      sinFondo
      cerrarAlClicFuera={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex min-h-44 flex-col gap-4">
          <LineaDoradaTitulo parteSubrayada="Exportar tabla" />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted">
              Formato
            </span>
            <div
              role="group"
              aria-label="Formato de exportación"
              className="flex w-full items-center gap-1 rounded-xl border border-border-strong bg-surface p-1 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setFormato("csv")}
                aria-pressed={formato === "csv"}
                className={claseInterruptor(formato === "csv")}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setFormato("pdf")}
                aria-pressed={formato === "pdf"}
                className={claseInterruptor(formato === "pdf")}
              >
                PDF
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted">
              Estado
            </span>
            <select
              value={estado}
              onChange={(event) =>
                setEstado(
                  event.target.value as EstadoExportacionDonaciones,
                )
              }
              className={claseCampo("cursor-pointer")}
              aria-label="Exportar por estado"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobadas</option>
              <option value="rechazado">Rechazadas</option>
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Desde
              </span>
              <input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
                className={claseCampo("cursor-pointer")}
                aria-label="Exportar desde fecha"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted">
                Hasta
              </span>
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                className={claseCampo("cursor-pointer")}
                aria-label="Exportar hasta fecha"
              />
            </label>
          </div>
          {desde && hasta && !rangoValido && (
            <p className="m-0 text-xs font-semibold text-red-600">
              La fecha de inicio no puede ser mayor que la fecha de fin
            </p>
          )}

          <div className="flex shrink-0 justify-end gap-2">
            <Button
              variant="royal"
              className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
              onClick={() => onConfirm({ formato, estado, desde, hasta })}
              disabled={!rangoValido}
            >
              <Download size={16} />
              Exportar
            </Button>
            <Button
              variant="secondary"
              className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}
