import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { LandingFieldConfig } from "./landingSectionConfig";
import "./LandingSectionModal.css";

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
    <span className="landing-modal__counter" aria-live="polite">
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
    <div className="landing-modal" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="landing-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="landing-modal__header">
          <h3 id={titleId}>Personalizar {title}</h3>
          <button
            type="button"
            className="landing-modal__close"
            onClick={onClose}
            aria-label="Cerrar editor"
            disabled={guardando}
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="landing-modal__body"
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
                <div key={field.name} className="landing-modal__field">
                  <label htmlFor={fieldId}>{field.label}</label>
                  {field.hint && (
                    <p className="landing-modal__hint">{field.hint}</p>
                  )}
                  <input
                    id={fieldId}
                    type="url"
                    value={value}
                    placeholder="https://..."
                    onChange={(event) => onChange(field.name, event.target.value)}
                  />
                  {imageUrl && (
                    <div className="landing-modal__preview">
                      <p className="landing-modal__preview-label">Vista previa</p>
                      <img src={imageUrl} alt="Vista previa de la imagen" />
                    </div>
                  )}
                </div>
              );
            }

            if (field.type === "textarea" || field.type === "lines") {
              return (
                <div key={field.name} className="landing-modal__field">
                  <label htmlFor={fieldId}>{field.label}</label>
                  {field.hint && (
                    <p className="landing-modal__hint">{field.hint}</p>
                  )}
                  <textarea
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
              <div key={field.name} className="landing-modal__field">
                <label htmlFor={fieldId}>{field.label}</label>
                {field.hint && <p className="landing-modal__hint">{field.hint}</p>}
                <input
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

          <footer className="landing-modal__footer">
            <button
              type="button"
              className="landing-modal__btn landing-modal__btn--ghost"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="landing-modal__btn landing-modal__btn--primary"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
