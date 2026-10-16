import { useId } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { FieldError, Label } from "../ui/Label";
import { Input } from "../ui/Input";
import type { EstadoConsultaCedula } from "../hooks/useAutocompletarCedula";
import type { TipoCedula } from "../utils/cedulaIdentificacion";

// Bloque compartido por las matrículas: no guarda datos personales en localStorage ni sessionStorage.
export function IdentificacionCedula({
  tipo,
  valor,
  estado,
  error,
  onTipo,
  onValor,
  onReintentar,
}: {
  tipo: TipoCedula;
  valor: string;
  estado: EstadoConsultaCedula;
  error?: string;
  onTipo: (tipo: TipoCedula) => void;
  onValor: (valor: string) => void;
  onReintentar: () => void;
}) {
  const id = useId();
  const mensaje =
    estado === "no_encontrada"
      ? "La cédula ingresada no existe."
      : estado === "error"
        ? "No se pudo verificar la cédula. Intente nuevamente."
        : undefined;

  return (
    <div className="grid gap-3 sm:col-span-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1 text-sm">
        <Label htmlFor={`${id}-tipo`} required>
          Tipo de cédula
        </Label>
        <select
          id={`${id}-tipo`}
          value={tipo}
          onChange={(event) => onTipo(event.target.value as TipoCedula)}
          className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-slate-900"
        >
          <option value="nacional">Nacional</option>
          <option value="extranjera">Extranjera</option>
        </select>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <Label htmlFor={`${id}-cedula`} required>
          Cédula
        </Label>
        <div className="relative">
          <Input
            id={`${id}-cedula`}
            inputMode="numeric"
            value={valor}
            maxLength={tipo === "nacional" ? 9 : 12}
            placeholder={tipo === "nacional" ? "Ej: 102340567" : "12 dígitos"}
            onChange={(event) => onValor(event.target.value)}
            hasError={Boolean(error || mensaje)}
            disabled={estado === "buscando"}
            className="pr-10"
            aria-busy={estado === "buscando"}
            aria-invalid={Boolean(error || mensaje)}
            aria-describedby={`${id}-estado`}
          />
          {(estado === "buscando" || estado === "encontrada") && (
            <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
              {estado === "buscando" ? (
                <Loader2 size={16} className="animate-spin text-royal-blue" aria-hidden="true" />
              ) : (
                <Check size={16} strokeWidth={3} className="text-green-500" aria-hidden="true" />
              )}
            </span>
          )}
        </div>
        <div id={`${id}-estado`}>
          <FieldError message={mensaje || error} />
          <span role="status" className="text-sm text-text-secondary">
            {estado === "buscando"
              ? "Verificando cédula..."
              : estado === "encontrada"
                ? "Cédula verificada. Nombre y apellidos completados."
                : tipo === "extranjera"
                  ? "Complete el nombre y los apellidos manualmente."
                  : ""}
          </span>
        </div>
        {estado === "error" && (
          <Button type="button" variant="royal" onClick={onReintentar}>
            Reintentar verificación
          </Button>
        )}
      </div>
    </div>
  );
}
