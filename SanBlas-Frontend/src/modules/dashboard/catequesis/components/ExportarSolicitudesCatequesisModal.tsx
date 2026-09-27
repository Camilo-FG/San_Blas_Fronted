import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { NIVELES_CATEQUESIS } from "../../../catequesis/constants/nivelesCatequesis";
import { FILIALES_CATEQUESIS } from "../../../catequesis/constants/filialesCatequesis";
import { Button, CustomSelect, LineaDoradaTitulo, Modal } from "../../../../shared/ui";

export type NivelExportacionCatequesis = "todos" | "Primero" | "Sétimo";
export type EstadoExportacionCatequesis =
  | "todos"
  | "pendiente"
  | "aprobado"
  | "rechazado";

export type OpcionesExportacionCatequesis = {
  nivel: NivelExportacionCatequesis;
  estado: EstadoExportacionCatequesis;
  filial: "todos" | (typeof FILIALES_CATEQUESIS)[number];
};

type ExportarSolicitudesCatequesisModalProps = {
  exportando?: boolean;
  onClose: () => void;
  onConfirm: (opciones: OpcionesExportacionCatequesis) => void;
};

export function ExportarSolicitudesCatequesisModal({
  exportando = false,
  onClose,
  onConfirm,
}: ExportarSolicitudesCatequesisModalProps) {
  const [nivel, setNivel] = useState<NivelExportacionCatequesis>("todos");
  const [estado, setEstado] = useState<EstadoExportacionCatequesis>("todos");
  const [filial, setFilial] = useState<
    OpcionesExportacionCatequesis["filial"]
  >("todos");
  const nivelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      nivelRef.current?.focus();
    }, 0);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <Modal
      onClose={exportando ? () => undefined : onClose}
      title="Exportar tabla"
      sinFondo
      cerrarAlClicFuera={false}
      className="overflow-visible"
      tamano="xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex min-h-[34rem] flex-col pr-10">
          <div className="flex flex-col gap-4">
          <LineaDoradaTitulo parteSubrayada="Exportar tabla" />
          <p className="m-0 text-sm text-text-muted">
            Se descargará un archivo Excel (.xlsx).
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted">
              Nivel
            </span>
            <CustomSelect
              ref={nivelRef}
              value={nivel}
              disabled={exportando}
              onChange={(valor) =>
                setNivel(valor as NivelExportacionCatequesis)
              }
              options={[
                { label: "Todos", value: "todos" },
                ...NIVELES_CATEQUESIS.map((opcion) => ({
                  label: opcion.label,
                  value: opcion.value,
                })),
              ]}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted">
              Estado
            </span>
            <CustomSelect
              value={estado}
              disabled={exportando}
              onChange={(valor) =>
                setEstado(valor as EstadoExportacionCatequesis)
              }
              options={[
                { label: "Todos", value: "todos" },
                { label: "Pendientes", value: "pendiente" },
                { label: "Aprobadas", value: "aprobado" },
                { label: "Rechazadas", value: "rechazado" },
              ]}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted">
              Filial
            </span>
            <CustomSelect
              value={filial}
              disabled={exportando}
              onChange={(valor) =>
                setFilial(valor as OpcionesExportacionCatequesis["filial"])
              }
              options={[
                { label: "Todas", value: "todos" },
                ...FILIALES_CATEQUESIS.map((nombre) => ({
                  label: nombre,
                  value: nombre,
                })),
              ]}
            />
          </label>
          </div>

          <div className="mt-auto flex shrink-0 justify-end gap-2 pt-8">
            <Button
              variant="royal"
              className="rounded-lg! duration-400 ease-in-out hover:bg-royal-blue! enabled:hover:text-[#dcb55a]"
              onClick={() => onConfirm({ nivel, estado, filial })}
              disabled={exportando}
            >
              <Download size={16} />
              {exportando ? "Exportando..." : "Exportar"}
            </Button>
            <Button
              variant="secondary"
              className="rounded-lg! border-0! hover:bg-slate-300! duration-150 ease-out"
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
