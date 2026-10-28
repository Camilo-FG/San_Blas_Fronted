import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { ApiError } from "../../../services/apiClient";
import {
  exportarMatriculas,
  type ModuloExportacionMatriculas,
  type OpcionesExportacionMatriculas,
} from "../../../services/exportacionesMatriculas";
import { Button, useToast } from "../../ui";
import { ExportarMatriculasModal } from "./ExportarMatriculasModal";

// Encapsula el mismo flujo en los dos paneles, sin cambiar los listados ni sus filtros.
export function ExportarMatriculas({
  modulo,
  disabled = false,
}: {
  modulo: ModuloExportacionMatriculas;
  disabled?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState("");
  const enCurso = useRef(false);
  const { showToast } = useToast();

  // El candado también cubre un doble clic antes de que React pinte el estado deshabilitado.
  const descargar = async (opciones: OpcionesExportacionMatriculas) => {
    if (enCurso.current) return;
    enCurso.current = true;
    setExportando(true);
    setError("");
    try {
      await exportarMatriculas(modulo, opciones);
      setAbierto(false);
      showToast("Se exportó el archivo de Excel.", "success");
    } catch (causa) {
      const mensaje =
        causa instanceof ApiError
          ? causa.message
          : "No se pudo exportar el archivo de Excel.";
      setError(mensaje);
      showToast(mensaje, "error");
    } finally {
      enCurso.current = false;
      setExportando(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        className="shrink-0"
        disabled={disabled || exportando}
        onClick={() => {
          setError("");
          setAbierto(true);
        }}
      >
        <Download size={16} />
        Exportar tabla
      </Button>
      {abierto && (
        <ExportarMatriculasModal
          exportando={exportando}
          error={error}
          onClose={() => {
            if (!enCurso.current) setAbierto(false);
          }}
          onConfirm={(opciones) => void descargar(opciones)}
        />
      )}
    </>
  );
}
