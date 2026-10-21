import { cn, FieldError, Label } from "../ui";
import {
  resolverIdPorNombre,
  useCantonesCR,
  useDistritosCR,
  useProvinciasCR,
} from "../hooks/useUbicacionesCostaRica";

export type UbicacionCostaRicaValor = {
  provincia: string;
  canton: string;
  distrito: string;
};

type Props = {
  valor: UbicacionCostaRicaValor;
  onChange: (valor: UbicacionCostaRicaValor) => void;
  errores?: Partial<UbicacionCostaRicaValor>;
  disabled?: boolean;
  selectClassName?: string;
  /** Clases del contenedor de cada campo (por defecto grid cell). */
  classNameCampo?: string;
};

const selectBase =
  "min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-55";

export function UbicacionCostaRicaCampos({
  valor,
  onChange,
  errores = {},
  disabled = false,
  selectClassName,
  classNameCampo,
}: Props) {
  const provinciasQuery = useProvinciasCR();
  const provincias = provinciasQuery.data ?? [];
  const provinciaId = resolverIdPorNombre(provincias, valor.provincia);
  const hayProvincia = Boolean(valor.provincia.trim() && provinciaId);

  const cantonesQuery = useCantonesCR(provinciaId);
  const cantones = cantonesQuery.data ?? [];
  const cantonId = resolverIdPorNombre(cantones, valor.canton);
  const hayCanton = Boolean(valor.canton.trim() && cantonId);

  const distritosQuery = useDistritosCR(provinciaId, cantonId);
  const distritos = distritosQuery.data ?? [];

  const cantonBloqueado =
    disabled || !hayProvincia || cantonesQuery.isPending || cantonesQuery.isFetching;
  const distritoBloqueado =
    disabled ||
    !hayCanton ||
    distritosQuery.isPending ||
    distritosQuery.isFetching;

  const claseSelect = cn(selectBase, selectClassName);
  const claseCampo = classNameCampo ?? "flex flex-col gap-1 text-sm";

  const errorCarga =
    provinciasQuery.isError
      ? "No se pudieron cargar las provincias. Intente de nuevo."
      : cantonesQuery.isError
        ? "No se pudieron cargar los cantones."
        : distritosQuery.isError
          ? "No se pudieron cargar los distritos."
          : null;

  return (
    <>
      <div className={claseCampo}>
        <Label required>Provincia</Label>
        <select
          className={cn(claseSelect, "cursor-pointer disabled:cursor-not-allowed")}
          value={valor.provincia}
          disabled={disabled || provinciasQuery.isPending}
          aria-invalid={Boolean(errores.provincia)}
          aria-busy={provinciasQuery.isPending}
          onChange={(event) => {
            onChange({
              provincia: event.target.value,
              canton: "",
              distrito: "",
            });
          }}
        >
          <option value="">
            {provinciasQuery.isPending
              ? "Cargando provincias…"
              : "Seleccione la provincia"}
          </option>
          {provincias.map((opcion) => (
            <option key={opcion.id} value={opcion.nombre}>
              {opcion.nombre}
            </option>
          ))}
        </select>
        <FieldError message={errores.provincia} />
      </div>

      <div className={claseCampo}>
        <Label required>Cantón</Label>
        <select
          className={cn(
            claseSelect,
            cantonBloqueado ? "cursor-not-allowed" : "cursor-pointer",
          )}
          value={valor.canton}
          disabled={cantonBloqueado}
          aria-invalid={Boolean(errores.canton)}
          aria-busy={cantonesQuery.isPending || cantonesQuery.isFetching}
          aria-disabled={cantonBloqueado}
          onChange={(event) => {
            onChange({
              ...valor,
              canton: event.target.value,
              distrito: "",
            });
          }}
        >
          <option value="">
            {!hayProvincia
              ? "Primero elija la provincia"
              : cantonesQuery.isPending || cantonesQuery.isFetching
                ? "Cargando cantones…"
                : "Seleccione el cantón"}
          </option>
          {hayProvincia &&
            cantones.map((opcion) => (
              <option key={opcion.id} value={opcion.nombre}>
                {opcion.nombre}
              </option>
            ))}
        </select>
        <FieldError message={errores.canton} />
      </div>

      <div className={claseCampo}>
        <Label required>Distrito</Label>
        <select
          className={cn(
            claseSelect,
            distritoBloqueado ? "cursor-not-allowed" : "cursor-pointer",
          )}
          value={valor.distrito}
          disabled={distritoBloqueado}
          aria-invalid={Boolean(errores.distrito)}
          aria-busy={distritosQuery.isPending || distritosQuery.isFetching}
          aria-disabled={distritoBloqueado}
          onChange={(event) => {
            onChange({
              ...valor,
              distrito: event.target.value,
            });
          }}
        >
          <option value="">
            {!hayCanton
              ? "Primero elija el cantón"
              : distritosQuery.isPending || distritosQuery.isFetching
                ? "Cargando distritos…"
                : "Seleccione el distrito"}
          </option>
          {hayCanton &&
            distritos.map((opcion) => (
              <option key={opcion.id} value={opcion.nombre}>
                {opcion.nombre}
              </option>
            ))}
        </select>
        <FieldError message={errores.distrito} />
      </div>

      {errorCarga && (
        <p className="m-0 text-sm text-red-700 sm:col-span-2" role="alert">
          {errorCarga}
        </p>
      )}
    </>
  );
}
