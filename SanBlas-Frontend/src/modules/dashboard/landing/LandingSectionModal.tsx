import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { LandingFieldConfig } from "./landingSectionConfig";
import { Button, Input, Label, Textarea } from "../../../shared/ui";

interface LandingSectionModalProps {
  title: string;
  fields: LandingFieldConfig[];
  values: Record<string, string>;
  guardando: boolean;
  onChange: (name: string, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

function CharacterCounter({
  value,
  maxLength,
}: {
  value: string;
  maxLength?: number;
}) {
  if (!maxLength) return null;

  return (
    <span className="mt-1 block text-xs text-slate-400" aria-live="polite">
      {value.length}/{maxLength} caracteres
    </span>
  );
}

export default function LandingSectionModal({
  title,
  fields,
  values,
  guardando,
  onChange,
  onClose,
  onSave,
}: LandingSectionModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guardando) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [guardando, onClose]);

  const imageField = fields.find((field) => field.type === "image");
  const imageUrl = imageField ? values[imageField.name] : "";

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/55 md:items-center md:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl md:max-h-[88vh] md:max-w-2xl md:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-border-strong px-4 py-3.5">
          <h3 id={titleId} className="m-0 text-lg font-bold text-slate-900">
            Personalizar {title}
          </h3>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onClose}
            aria-label="Cerrar editor"
            disabled={guardando}
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="flex flex-col gap-4 overflow-y-auto px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {fields.map((field) => {
            const value = values[field.name] ?? "";
            const fieldId = `landing-field-${field.name}`;

            if (field.type === "image") {
              return (
                <div key={field.name}>
                  <Label htmlFor={fieldId}>{field.label}</Label>
                  {field.hint && (
                    <p className="mb-1.5 text-sm text-text-muted">{field.hint}</p>
                  )}
                  <Input
                    id={fieldId}
                    type="url"
                    value={value}
                    placeholder="https://..."
                    onChange={(event) => onChange(field.name, event.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-sm font-semibold text-text-muted">
                        Vista previa
                      </p>
                      <img
                        src={imageUrl}
                        alt="Vista previa de la imagen"
                        className="max-h-56 w-full rounded-xl border border-border-strong object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            }

            if (field.type === "textarea" || field.type === "lines") {
              return (
                <div key={field.name}>
                  <Label htmlFor={fieldId}>{field.label}</Label>
                  {field.hint && (
                    <p className="mb-1.5 text-sm text-text-muted">{field.hint}</p>
                  )}
                  <Textarea
                    id={fieldId}
                    rows={field.rows ?? 4}
                    value={value}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    onChange={(event) => onChange(field.name, event.target.value)}
                  />
                  <CharacterCounter value={value} maxLength={field.maxLength} />
                </div>
              );
            }

            return (
              <div key={field.name}>
                <Label htmlFor={fieldId}>{field.label}</Label>
                {field.hint && (
                  <p className="mb-1.5 text-sm text-text-muted">{field.hint}</p>
                )}
                <Input
                  id={fieldId}
                  type={field.type === "url" ? "url" : "text"}
                  value={value}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
                <CharacterCounter value={value} maxLength={field.maxLength} />
              </div>
            );
          })}

          <footer className="mt-2 flex flex-col-reverse gap-2.5 border-t border-border-strong pt-4 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="ghost" className="bg-blue-600 text-white hover:bg-blue-700" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
