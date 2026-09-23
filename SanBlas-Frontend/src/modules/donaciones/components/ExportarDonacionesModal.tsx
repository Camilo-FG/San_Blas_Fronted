import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button, CustomSelect, LineaDoradaTitulo, Modal } from "../../../shared/ui";

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

  const estadoRef = useRef<HTMLButtonElement>(null);
  const csvRef = useRef<HTMLButtonElement>(null);
  const pdfRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      estadoRef.current?.focus();
    }, 0);
    return () => clearTimeout(temporizador);
  }, []);

  const moverFocoFormato = (siguiente: FormatoExportacionDonaciones) => {
    setFormato(siguiente);
    (siguiente === "csv" ? csvRef : pdfRef).current?.focus();
  };

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
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  moverFocoFormato("csv");
                } else if (
                  event.key === "ArrowRight" ||
                  event.key === "ArrowDown"
                ) {
                  event.preventDefault();
                  moverFocoFormato("pdf");
                }
              }}
              className="flex w-full items-center gap-1 rounded-xl border border-border-strong bg-surface p-1 shadow-sm"
            >
              {(["csv", "pdf"] as const).map((opcion) => {
                const activo = formato === opcion;
                return (
                  <button
                    key={opcion}
                    ref={opcion === "csv" ? csvRef : pdfRef}
                    type="button"
                    onClick={() => setFormato(opcion)}
                    aria-pressed={activo}
                    className={`relative min-h-10 flex-1 cursor-pointer rounded-lg px-4 text-sm transition-colors duration-150 ease-out focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none ${
                      activo
                        ? "font-semibold text-white"
                        : "font-medium text-text-secondary hover:bg-surface-muted"
                    }`}
                  >
                    {activo && (
                      <motion.span
                        layoutId="formato-exportacion-thumb"
                        className="absolute inset-0 rounded-lg bg-[#003366]"
                        transition={{
                          type: "spring",
                          stiffness: 550,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center justify-center">
                      {opcion === "csv" ? "CSV" : "PDF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted">
              Estado
            </span>
            <CustomSelect
              ref={estadoRef}
              value={estado}
              onChange={(valor) =>
                setEstado(valor as EstadoExportacionDonaciones)
              }
              options={[
                { label: "Todos", value: "todos" },
                { label: "Pendientes", value: "pendiente" },
                { label: "Aprobadas", value: "aprobado" },
                { label: "Rechazadas", value: "rechazado" },
              ]}
            />
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
