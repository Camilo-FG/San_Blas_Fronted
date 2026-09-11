import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  Textarea,
} from "../../../../shared/ui";
import { PERMISOS_ROL } from "../../../../types/Rol";
import { normalizarTexto } from "../../Utils/normalizarTexto";

interface CreateRolData {
  nombre: string;
  descripcion: string;
  permisos: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRolData) => Promise<boolean>;
  guardando?: boolean;
}

export default function CreateRolModal({
  isOpen,
  onClose,
  onSave,
  guardando = false,
}: Props) {
  const form = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      permisos: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const ok = await onSave({
        nombre: normalizarTexto(value.nombre),
        descripcion: normalizarTexto(value.descripcion),
        permisos: value.permisos,
      });
      if (ok) form.reset();
    },
  });

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal onClose={guardando ? () => undefined : onClose} title="Crear rol" cerrarAlClicFuera={false}>
      <h2 className="m-0 mb-1 pr-12 font-heading text-xl text-royal-blue">
        Crear rol
      </h2>
      <p className="m-0 mb-5 text-sm text-text-muted">
        Defina el nombre y los módulos a los que tendrá acceso.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4">
          <form.Field
            name="nombre"
            validators={{
              onBlur: ({ value }) =>
                normalizarTexto(value)
                  ? undefined
                  : "El nombre del rol es obligatorio.",
              onSubmit: ({ value }) =>
                normalizarTexto(value)
                  ? undefined
                  : "El nombre del rol es obligatorio.",
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="rol-nombre" required>
                  Nombre
                </Label>
                <Input
                  id="rol-nombre"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  maxLength={80}
                  placeholder="Ej: Secretaría"
                  disabled={guardando}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                />
                <FieldError message={field.state.meta.errors[0] as string | undefined} />
              </div>
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <Label htmlFor="rol-descripcion">Descripción</Label>
                <Textarea
                  id="rol-descripcion"
                  rows={3}
                  value={field.state.value}
                  maxLength={400}
                  placeholder="Qué hace este rol en la parroquia."
                  disabled={guardando}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="permisos">
            {(field) => (
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-2 text-sm font-semibold text-slate-800">
                  Permisos
                </legend>
                <div className="flex flex-col gap-2">
                  {PERMISOS_ROL.map((permiso) => {
                    const marcado = field.state.value.includes(permiso.id);
                    return (
                      <label
                        key={permiso.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-strong bg-surface-muted px-3 py-2.5 text-sm text-text"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 accent-royal-blue"
                          checked={marcado}
                          disabled={guardando}
                          onChange={() => {
                            const siguiente = marcado
                              ? field.state.value.filter((id) => id !== permiso.id)
                              : [...field.state.value, permiso.id];
                            field.handleChange(siguiente);
                          }}
                        />
                        <span>{permiso.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </form.Field>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border-strong pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" variant="royal" disabled={guardando}>
            {guardando ? "Creando..." : "Crear rol"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
