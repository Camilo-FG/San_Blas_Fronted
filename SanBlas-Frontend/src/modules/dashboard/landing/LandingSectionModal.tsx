import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, Maximize2, X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import type { LandingSectionKey } from "../../../services/landingService";
import type { LandingFieldConfig } from "./landingSectionConfig";
import { Button, ErrorMessage, FieldError, Input, Label, Textarea } from "../../../shared/ui";
import {
  SubidaImagen,
  type ArchivoImagen,
} from "../../solicSacramento/components/SubidaImagen";
import { HeroPreview } from "./HeroPreview";
import { HistoriaPreview } from "./HistoriaPreview";
import { SobreNosotrosPreview } from "./SobreNosotrosPreview";

interface LandingSectionModalProps {
  title: string;
  sectionKey: LandingSectionKey;
  fields: LandingFieldConfig[];
  values: Record<string, string>;
  errores?: Record<string, string>;
  errorMensaje?: string | null;
  guardando: boolean;
  archivosImagen?: Record<string, ArchivoImagen | null>;
  onArchivoChange?: (name: string, archivo: ArchivoImagen | null) => void;
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
  sectionKey,
  fields,
  values,
  errores = {},
  errorMensaje,
  guardando,
  archivosImagen = {},
  onArchivoChange,
  onChange,
  onClose,
  onSave,
}: LandingSectionModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLFormElement>(null);
  const visorAmpliadoRef = useRef<HTMLDivElement>(null);
  const [previewAmpliada, setPreviewAmpliada] = useState(false);
  const [visorVisible, setVisorVisible] = useState(false);
  const reducirMovimiento = useReducedMotion();
  const transicionVisor = reducirMovimiento
    ? { duration: 0 }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };
  const esHero = sectionKey === "hero";
  const esSobreNosotros = sectionKey === "sobre-nosotros";
  const esHistoria = sectionKey === "historia";
  const tieneVisor = esHero || esSobreNosotros || esHistoria;
  const imagenPreview =
    archivosImagen.imageUrl?.preview ||
    values.imageUrl ||
    (esHero ? "/hero.webp" : "/sobre-nosotros.jpg");
  const headerHistoriaPreview =
    archivosImagen.headerImageUrl?.preview || values.headerImageUrl || "";
  const quoteHistoriaPreview =
    archivosImagen.quoteImageUrl?.preview || values.quoteImageUrl || "";
  const tarjetasSobreNosotros = [1, 2, 3, 4].map((index) => ({
    icono: String(index).padStart(2, "0"),
    titulo: values[`card${index}Titulo`] ?? "",
    texto: values[`card${index}Texto`] ?? "",
  }));

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || guardando) return;
      if (previewAmpliada) {
        setPreviewAmpliada(false);
        return;
      }
      if (visorVisible) {
        setVisorVisible(false);
        return;
      }
      onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [guardando, onClose, previewAmpliada, visorVisible]);

  const camposFormulario = fields.map((field) => {
    const value = values[field.name] ?? "";
    const fieldId = `landing-field-${field.name}`;
    const errorId = `${fieldId}-error`;
    const mensajeError = errores[field.name];
    const esObligatorio = field.type !== "image";

    if (field.type === "image") {
      const archivoCampo = archivosImagen[field.name] ?? null;
      return (
        <div key={field.name}>
          <SubidaImagen
            id={fieldId}
            label={field.label}
            hint={field.hint}
            value={archivoCampo}
            existingPreview={value || null}
            textoArrastrar={
              field.name === "imageUrl" && esHero
                ? "Arrastre la imagen del banner aquí"
                : "Arrastre la imagen aquí"
            }
            textoBoton="Seleccionar archivo"
            onChange={(archivo) => {
              onArchivoChange?.(field.name, archivo);
              if (archivo) {
                onChange(field.name, values[field.name] ?? "");
              }
            }}
            onClearExisting={() => onChange(field.name, "")}
          />
        </div>
      );
    }

    if (field.type === "textarea" || field.type === "lines") {
      return (
        <div key={field.name}>
          <Label htmlFor={fieldId} required={esObligatorio}>
            {field.label}
          </Label>
          {field.hint && (
            <p className="mb-1.5 text-sm text-text-muted">{field.hint}</p>
          )}
          <Textarea
            id={fieldId}
            rows={field.rows ?? 4}
            value={value}
            maxLength={field.type === "lines" ? undefined : field.maxLength}
            placeholder={field.placeholder}
            hasError={Boolean(mensajeError)}
            aria-invalid={Boolean(mensajeError)}
            aria-describedby={mensajeError ? errorId : undefined}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
          <CharacterCounter
            value={value}
            maxLength={field.type === "lines" ? undefined : field.maxLength}
          />
          <FieldError id={errorId} message={mensajeError} />
        </div>
      );
    }

    return (
      <div key={field.name}>
        <Label htmlFor={fieldId} required={esObligatorio}>
          {field.label}
        </Label>
        {field.hint && (
          <p className="mb-1.5 text-sm text-text-muted">{field.hint}</p>
        )}
        <Input
          id={fieldId}
          type={field.type === "url" ? "url" : "text"}
          value={value}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          hasError={Boolean(mensajeError)}
          aria-invalid={Boolean(mensajeError)}
          aria-describedby={mensajeError ? errorId : undefined}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
        <CharacterCounter value={value} maxLength={field.maxLength} />
        <FieldError id={errorId} message={mensajeError} />
      </div>
    );
  });

  const visorContenido = (ampliadas = false) => {
    if (esHero) {
      return (
        <HeroPreview
          subtitle={values.subtitle ?? ""}
          title={values.title ?? ""}
          titleHighlight={values.titleHighlight ?? ""}
          description={values.description ?? ""}
          imageSrc={imagenPreview}
          ampliadas={ampliadas}
        />
      );
    }

    if (esHistoria) {
      return (
        <HistoriaPreview
          eyebrow={values.eyebrow ?? ""}
          subtitle={values.subtitle ?? ""}
          origenes={values.origenes ?? ""}
          restauraciones={values.restauraciones ?? ""}
          cita={values.cita ?? ""}
          fachada={values.fachada ?? ""}
          invitacion={values.invitacion ?? ""}
          videoUrl={values.videoUrl ?? ""}
          headerImageSrc={headerHistoriaPreview}
          quoteImageSrc={quoteHistoriaPreview}
          ampliadas={ampliadas}
        />
      );
    }

    return (
      <SobreNosotrosPreview
        eyebrow={values.eyebrow ?? ""}
        title={values.title ?? ""}
        lead={values.lead ?? ""}
        cards={tarjetasSobreNosotros}
        imageSrc={imagenPreview}
        ampliadas={ampliadas}
      />
    );
  };

  const pieFormulario = (
    <footer className="mt-auto flex shrink-0 flex-col gap-2.5 border-t border-border-strong bg-surface px-4 py-3 md:flex-row md:justify-end">
      <Button type="submit" variant="royal" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar"}
      </Button>
      {tieneVisor && !visorVisible && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setVisorVisible(true)}
        >
          <Eye size={16} />
          Vista previa
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={guardando}
      >
        Cancelar
      </Button>
    </footer>
  );

  return (
    <>
      <FocusTrap
        active={!previewAmpliada}
        focusTrapOptions={{
          clickOutsideDeactivates: false,
          escapeDeactivates: false,
          allowOutsideClick: () => true,
          initialFocus: () => dialogRef.current ?? false,
          fallbackFocus: () => dialogRef.current ?? document.body,
        }}
      >
        <div
          className={`fixed inset-0 z-[1200] flex justify-center bg-slate-900/55 ${
            visorVisible
              ? "items-center p-3 md:p-5"
              : "items-end md:items-center md:p-4"
          }`}
          role="presentation"
        >
          <motion.form
            ref={dialogRef}
            tabIndex={-1}
            layout={!reducirMovimiento}
            transition={transicionVisor}
            className={
              visorVisible
                ? "flex h-auto w-full max-w-[1480px] flex-col gap-3 outline-none md:h-[min(92vh,900px)] md:flex-row md:items-stretch md:gap-4"
                : "flex max-h-[92vh] w-full max-w-3xl flex-col outline-none md:max-h-[88vh]"
            }
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        noValidate
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <motion.section
          layout={!reducirMovimiento}
          transition={transicionVisor}
          className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_24px_50px_rgba(15,23,42,0.28)] ${
            visorVisible
              ? "flex-1 md:w-[min(52%,640px)] md:max-w-[640px] md:flex-none"
              : "max-h-[92vh] md:max-h-[88vh]"
          }`}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-strong px-4 py-3.5">
            <h3 id={titleId} className="m-0 text-lg font-bold text-royal-blue">
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
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
            {errorMensaje && <ErrorMessage message={errorMensaje} />}
            {camposFormulario}
          </div>
          {pieFormulario}
        </motion.section>

        <AnimatePresence>
          {visorVisible && (
            <motion.aside
              key="visor-landing"
              initial={
                reducirMovimiento ? false : { opacity: 0, x: 36 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                reducirMovimiento
                  ? { opacity: 0 }
                  : { opacity: 0, x: 24 }
              }
              transition={transicionVisor}
              onAnimationComplete={() => {
                window.dispatchEvent(new Event("resize"));
              }}
              className="flex min-h-[220px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_24px_50px_rgba(15,23,42,0.28)] max-md:aspect-video md:min-h-0"
            >
              <header className="flex shrink-0 items-center justify-between gap-2 bg-royal-blue px-4 py-3.5">
                <h3 className="m-0 text-sm font-extrabold tracking-[0.16em] text-royal-gold uppercase">
                  Vista previa
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-none bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-white/18"
                    onClick={() => setPreviewAmpliada(true)}
                  >
                    <Maximize2 size={13} />
                    Ampliar
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-white/10 text-white transition-colors hover:bg-white/18"
                    onClick={() => setVisorVisible(false)}
                    aria-label="Cerrar vista previa"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>
              <div
                className={`min-h-0 flex-1 overflow-hidden ${
                  esHero ? "bg-royal-blue" : "bg-surface"
                }`}
              >
                {visorContenido()}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
          </motion.form>
        </div>
      </FocusTrap>

      <AnimatePresence>
        {previewAmpliada && (
          <motion.div
            key="visor-ampliado"
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/75 p-3 md:p-8"
            role="presentation"
            initial={reducirMovimiento ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transicionVisor}
            onClick={() => setPreviewAmpliada(false)}
          >
            <FocusTrap
              focusTrapOptions={{
                clickOutsideDeactivates: false,
                escapeDeactivates: false,
                allowOutsideClick: () => true,
                initialFocus: () => visorAmpliadoRef.current ?? false,
                fallbackFocus: () => visorAmpliadoRef.current ?? document.body,
              }}
            >
              <motion.div
                ref={visorAmpliadoRef}
                tabIndex={-1}
                className={`relative w-full overflow-hidden rounded-2xl outline-none ${
                  esHero
                    ? "aspect-video max-w-6xl bg-royal-blue"
                    : esHistoria
                      ? "h-[min(86vh,920px)] max-w-6xl bg-surface"
                      : "aspect-[16/11] max-w-6xl bg-surface"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label={
                  esHero
                    ? "Vista previa ampliada del hero"
                    : esHistoria
                      ? "Vista previa ampliada de Historia y legado"
                      : "Vista previa ampliada de Sobre nosotros"
                }
                initial={reducirMovimiento ? false : { opacity: 0, scale: 0.94, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reducirMovimiento
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.97, y: 10 }
                }
                transition={transicionVisor}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={`absolute top-3 right-3 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors ${
                    esHero
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  onClick={() => setPreviewAmpliada(false)}
                  aria-label="Cerrar vista previa"
                >
                  <X size={20} />
                </button>
                {visorContenido(true)}
              </motion.div>
            </FocusTrap>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
