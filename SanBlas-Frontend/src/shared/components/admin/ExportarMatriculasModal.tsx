import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import {
  Button,
  CustomSelect,
  ErrorMessage,
  LineaDoradaTitulo,
  Modal,
} from "../../ui";
import type {
  EstadoExportacionMatriculas,
  OpcionesExportacionMatriculas,
} from "../../../services/exportacionesMatriculas";

// Mismo campo de fecha que usa exportar donaciones, para que el panel siga siendo consistente.
const claseFecha =
  "min-h-11 min-w-0 w-full rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-slate-500 focus-visible:bg-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:hover:bg-white/[0.035] dark:focus-visible:border-[#d9a928] dark:scheme-dark";

const estiloSelect = {
  className: "dark:text-[#f3f6fa]",
  triggerClassName:
    "dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:hover:bg-white/[0.035]",
  menuClassName: "dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]",
  optionClassName:
    "dark:text-[#b7c3d4] dark:hover:bg-white/[0.035] dark:hover:text-[#f3f6fa]",
};

// Mismo modal de Juvenil, con filtros propios; no se modifica ni se reemplaza el componente original.
export function ExportarMatriculasModal({
  exportando,
  error,
  onClose,
  onConfirm,
}: {
  exportando: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (opciones: OpcionesExportacionMatriculas) => void;
}) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estado, setEstado] = useState<EstadoExportacionMatriculas>("todos");
  const primerFiltro = useRef<HTMLButtonElement>(null);
  const rangoValido = !desde || !hasta || desde <= hasta;

  useEffect(() => {
    const temporizador = setTimeout(() => primerFiltro.current?.focus(), 0);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <Modal
      onClose={exportando ? () => undefined : onClose}
      title="Exportar tabla"
      sinFondo
      cerrarAlClicFuera={false}
      className="overflow-visible dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
      overlayClassName="fixed inset-0 z-[1350] bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
      tamano="xl"
    >
      <motion.div
        className="w-full min-w-0"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex min-h-0 w-full min-w-0 flex-col">
          <div className="flex min-w-0 flex-col gap-4">
            <LineaDoradaTitulo parteSubrayada="Exportar tabla" />
            <p className="m-0 text-sm text-text-muted dark:text-[#7f8da3]">
              Se descargará un archivo Excel (.xlsx).
            </p>
            {error && <ErrorMessage message={error} />}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-muted dark:text-[#7f8da3]">
                Estado
              </span>
              <CustomSelect
                {...estiloSelect}
                ref={primerFiltro}
                value={estado}
                onChange={(valor) =>
                  setEstado(valor as EstadoExportacionMatriculas)
                }
                disabled={exportando}
                ariaLabel="Estado"
                options={[
                  { label: "Todos", value: "todos" },
                  { label: "Pendientes", value: "Pendiente" },
                  { label: "Aprobadas", value: "Aprobada" },
                  { label: "Rechazadas", value: "Rechazada" },
                ]}
              />
            </label>
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2 text-xs font-semibold text-text-muted dark:text-[#7f8da3]">
                Fecha de inscripción
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold text-text-muted dark:text-[#7f8da3]">
                    Desde
                  </span>
                  <input
                    type="date"
                    className={claseFecha}
                    value={desde}
                    max={hasta || "9999-12-31"}
                    onChange={(event) => setDesde(event.target.value)}
                    disabled={exportando}
                    aria-invalid={!rangoValido}
                    aria-describedby="ayuda-rango-exportacion"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold text-text-muted dark:text-[#7f8da3]">
                    Hasta
                  </span>
                  <input
                    type="date"
                    className={claseFecha}
                    value={hasta}
                    min={desde || undefined}
                    max="9999-12-31"
                    onChange={(event) => setHasta(event.target.value)}
                    disabled={exportando}
                    aria-invalid={!rangoValido}
                    aria-describedby="ayuda-rango-exportacion"
                  />
                </label>
              </div>
              <p
                id="ayuda-rango-exportacion"
                aria-live="polite"
                className={`mb-0 mt-2 text-xs ${rangoValido ? "text-text-muted dark:text-[#7f8da3]" : "font-semibold text-red-600 dark:text-[#e66a6a]"}`}
              >
                {rangoValido
                  ? "Ambas fechas están incluidas. Dejá las fechas vacías para exportar sin límite."
                  : "La fecha desde no puede ser posterior a la fecha hasta."}
              </p>
            </fieldset>
          </div>
          <div className="mt-auto flex min-w-0 shrink-0 flex-wrap justify-end gap-2 pt-6">
            <Button
              variant="royal"
              className="max-w-full rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
              onClick={() => {
                if (rangoValido) onConfirm({ estado, desde, hasta });
              }}
              disabled={exportando || !rangoValido}
            >
              <Download size={16} />
              {exportando ? "Exportando..." : "Exportar"}
            </Button>
            <Button
              variant="secondary"
              className="max-w-full rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
              onClick={onClose}
              disabled={exportando}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}
