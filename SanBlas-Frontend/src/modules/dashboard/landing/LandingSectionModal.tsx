import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, Maximize2, X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import type { LandingSectionKey } from "../../../services/landingService";
import { useTheme } from "../../../context/ThemeContext";
import type { LandingFieldConfig } from "./landingSectionConfig";
import { Button, FieldError, Input, Label, Textarea } from "../../../shared/ui";
import {
  SubidaImagen,
  type ArchivoImagen,
} from "../../solicSacramento/components/SubidaImagen";
import { HeroPreview } from "./HeroPreview";
import { HistoriaPreview } from "./HistoriaPreview";
import { HorariosPreview } from "./HorariosPreview";
import { SobreNosotrosPreview } from "./SobreNosotrosPreview";
import { ContactoPreview } from "./ContactoPreview";
import { BautizosPreview } from "./BautizosPreview";
import { DonacionesPreview } from "./DonacionesPreview";
import { ServiciosPreview } from "./ServiciosPreview";

interface LandingSectionModalProps {
  title: string;
  sectionKey: LandingSectionKey;
  fields: LandingFieldConfig[];
  values: Record<string, string>;
  errores?: Record<string, string>;
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
    <span className="mt-1 block text-xs text-slate-400 dark:text-[#7f8da3]" aria-live="polite">
      {value.length}/{maxLength} caracteres
    </span>
  );
}

// Caracteres raros bloqueados en texto general (guiones y resto legítimo pasan).
const CARACTERES_RAROS_REGEX = /[<>{}\[\]\\|^~`]/g;

// Sanea según el formato del campo para no romper sus validadores
// (landingValidation.ts): cada formato conserva exactamente los caracteres
// que su regex acepta; el texto general solo pierde los raros.
function sanearValorLanding(
  field: LandingFieldConfig,
  valor: string,
): string {
  switch (field.format) {
    case "email":
      return valor.replace(/[^a-zA-Z0-9._%+\-@]/g, "");
    case "phone": {
      const limpio = valor.replace(/[^0-9+\s()\-]/g, "");
      // +506 es prefijo país y no cuenta: 8 dígitos locales como máximo.
      const digitos = limpio.replace(/\D/g, "");
      const maxDigitos = digitos.startsWith("506") ? 11 : 8;
      if (digitos.length <= maxDigitos) return limpio;
      let conservar = maxDigitos;
      let resultado = "";
      for (const caracter of limpio) {
        if (/\d/.test(caracter)) {
          if (conservar === 0) continue;
          conservar -= 1;
        }
        resultado += caracter;
      }
      return resultado;
    }
    case "ibanCr":
      return valor.replace(/[^a-zA-Z0-9]/g, "");
    case "youtube":
    case "url":
      return valor.replace(/[<>"{}|\\^`\s]/g, "");
    default:
      return valor.replace(CARACTERES_RAROS_REGEX, "");
  }
}

export default function LandingSectionModal({
  title,
  sectionKey,
  fields,
  values,
  errores = {},
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
  const [campoResaltado, setCampoResaltado] = useState<string | null>(null);
  // intento de guardado actual; sirve pa saber cuándo llevar el scroll al
  // primer campo con error sin interferir mientras el usuario escribe
  const [intentoGuardado, setIntentoGuardado] = useState(0);
  const intentoProcesadoRef = useRef(0);
  const reducirMovimiento = useReducedMotion();
  const { esOscuro } = useTheme();
  const transicionVisor = reducirMovimiento
    ? { duration: 0 }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };
  const esHero = sectionKey === "hero";
  const esSobreNosotros = sectionKey === "sobre-nosotros";
  const esHistoria = sectionKey === "historia";
  const esHorarios = sectionKey === "horarios";
  const esContacto = sectionKey === "contacto";
  const esBautizos = sectionKey === "bautizos";
  const esDonaciones = sectionKey === "donaciones";
  const esServicios = sectionKey === "servicios";
  const tieneVisor =
    esHero ||
    esSobreNosotros ||
    esHistoria ||
    esHorarios ||
    esContacto ||
    esBautizos ||
    esDonaciones ||
    esServicios;
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
  // bloques del volante pa la vista previa (lee los campos del formulario tal cual están)
  const bloquesHorarios = [1, 2, 3, 4].map((index) => ({
    titulo: values[`bloque${index}Titulo`] ?? "",
    filas: values[`bloque${index}Filas`] ?? "",
  }));
  // servicios pa la vista previa (lee los campos del formulario)
  const serviciosPreview = [1, 2, 3, 4, 5].map((index) => ({
    titulo: values[`servicio${index}Titulo`] ?? "",
    descripcion: values[`servicio${index}Descripcion`] ?? "",
    categoria: values[`servicio${index}Categoria`] ?? "",
    boton: values[`servicio${index}Boton`] ?? "",
    imagen:
      archivosImagen[`servicio${index}Imagen`]?.preview ||
      values[`servicio${index}Imagen`] ||
      "",
  }));
  // fondo del volante: si adjuntó una nueva se previsualiza esa, si no la guardada o la por defecto
  const imagenHorariosPreview =
    archivosImagen.imageUrl?.preview || values.imageUrl || "";

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

  useEffect(() => {
    if (!campoResaltado || (!visorVisible && !previewAmpliada)) return;
    let cancelado = false;
    let reintento = 0;

    const llevarALaVista = () => {
      if (cancelado) return;
      const raiz = previewAmpliada
        ? visorAmpliadoRef.current
        : dialogRef.current;
      const nodo = raiz?.querySelector(
        `[data-campo-preview="${CSS.escape(campoResaltado)}"]`,
      );
      if (!(nodo instanceof HTMLElement)) {
        if (reintento === 0) {
          reintento = window.setTimeout(llevarALaVista, 420);
        }
        return;
      }
      const scroller = nodo.closest("[data-preview-scroll]");
      if (!(scroller instanceof HTMLElement)) return;
      const nodoRect = nodo.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const delta =
        nodoRect.top -
        scrollerRect.top -
        scroller.clientHeight / 2 +
        nodoRect.height / 2;
      if (Math.abs(delta) < 12) return;
      scroller.scrollTo({
        top: scroller.scrollTop + delta,
        behavior: "smooth",
      });
    };

    const frame = requestAnimationFrame(llevarALaVista);
    return () => {
      cancelado = true;
      cancelAnimationFrame(frame);
      if (reintento) window.clearTimeout(reintento);
    };
  }, [campoResaltado, previewAmpliada, visorVisible]);

  // al intentar guardar con errores, hace scroll hasta el primer campo con
  // problema; no vuelve a scrollear mientras el usuario corrige (mismo intento)
  useEffect(() => {
    if (intentoGuardado === 0) return;
    const primerConError = fields.find((field) => errores[field.name]);
    if (!primerConError) return;
    if (intentoProcesadoRef.current === intentoGuardado) return;
    intentoProcesadoRef.current = intentoGuardado;
    const nodo = document.getElementById(
      `landing-field-${primerConError.name}`,
    );
    nodo?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [intentoGuardado, errores, fields]);

  const camposFormulario = fields.map((field) => {
    const value = values[field.name] ?? "";
    const fieldId = `landing-field-${field.name}`;
    const errorId = `${fieldId}-error`;
    const mensajeError = errores[field.name];
    const esObligatorio =
      field.type !== "image" &&
      field.type !== "file" &&
      field.required !== false;
    const puedeResaltar =
      tieneVisor && field.type !== "image" && field.type !== "file";
    const marcarEnPreview = () => {
      if (!puedeResaltar) return;
      setCampoResaltado(field.name);
    };
    const escribirEnCampo = (valor: string) => {
      if (puedeResaltar) setCampoResaltado(null);
      onChange(field.name, sanearValorLanding(field, valor));
    };
    const quitarResalte = () => {
      if (!puedeResaltar) return;
      setCampoResaltado((actual) => (actual === field.name ? null : actual));
    };

    if (field.type === "image") {
      const archivoCampo = archivosImagen[field.name] ?? null;
      return (
        <div key={field.name}>
          <SubidaImagen
            id={fieldId}
            darkMode={esOscuro}
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
          />
        </div>
      );
    }

    // documento (PDF): mismo flujo que una imagen pero solo acepta PDF y se
    // muestra como archivo en vez de como vista previa de imagen
    if (field.type === "file") {
      const archivoCampo = archivosImagen[field.name] ?? null;
      return (
        <div key={field.name}>
          <SubidaImagen
            id={fieldId}
            darkMode={esOscuro}
            label={field.label}
            hint={field.hint}
            value={archivoCampo}
            existingPreview={value || null}
            tiposPermitidos={["application/pdf"]}
            varianteVistaPrevia="tarjeta"
            textoArrastrar="Arrastre el PDF aquí"
            textoBoton="Seleccionar PDF"
            onChange={(archivo) => {
              onArchivoChange?.(field.name, archivo);
              if (archivo) {
                onChange(field.name, values[field.name] ?? "");
              }
            }}
          />
          <FieldError id={errorId} message={mensajeError} />
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
            <p className="mb-1.5 text-sm text-text-muted dark:text-[#b7c3d4]">{field.hint}</p>
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
            onFocus={marcarEnPreview}
            onClick={marcarEnPreview}
            onBlur={quitarResalte}
            onChange={(event) => escribirEnCampo(event.target.value)}
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
        {field.hint && field.format !== "ibanCr" && (
          <p className="mb-1.5 text-sm text-text-muted dark:text-[#b7c3d4]">{field.hint}</p>
        )}
        <Input
          id={fieldId}
          type={field.type === "url" ? "url" : "text"}
          value={value}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          hasError={Boolean(mensajeError)}
          aria-invalid={Boolean(mensajeError)}
          aria-describedby={
            field.format === "ibanCr"
              ? `${fieldId}-formato${mensajeError ? ` ${errorId}` : ""}`
              : mensajeError
                ? errorId
                : undefined
          }
          onFocus={marcarEnPreview}
          onClick={marcarEnPreview}
          onBlur={quitarResalte}
          onChange={(event) => escribirEnCampo(event.target.value)}
        />
        {field.format === "ibanCr" && field.hint && (
          <p id={`${fieldId}-formato`} className="mt-1.5 text-sm text-text-muted">
            {field.hint}
          </p>
        )}
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
          campoResaltado={campoResaltado}
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
          campoResaltado={campoResaltado}
        />
      );
    }

    if (esHorarios) {
      return (
        <HorariosPreview
          title={values.title ?? ""}
          subtitle={values.subtitle ?? ""}
          titleHighlight={values.titleHighlight ?? ""}
          intro={values.intro ?? ""}
          imageUrl={imagenHorariosPreview}
          bloques={bloquesHorarios}
          ampliadas={ampliadas}
          campoResaltado={campoResaltado}
        />
      );
    }

    if (esContacto) {
      return (
        <ContactoPreview
          eyebrow={values.eyebrow ?? ""}
          title={values.title ?? ""}
          intro={values.intro ?? ""}
          telefono={values.telefono ?? ""}
          correo={values.correo ?? ""}
          ubicacion={values.ubicacion ?? ""}
          horariosAtencion={values.horariosAtencion ?? ""}
          mapaUrl={values.mapaUrl ?? ""}
          ampliadas={ampliadas}
          campoResaltado={campoResaltado}
        />
      );
    }

    if (esBautizos) {
      return (
        <BautizosPreview
          title={values.title ?? ""}
          intro={values.intro ?? ""}
          requisitos={values.requisitos ?? ""}
          charlas={values.charlas ?? ""}
          solicitud={values.solicitud ?? ""}
          ampliadas={ampliadas}
          campoResaltado={campoResaltado}
        />
      );
    }

    if (esDonaciones) {
      return (
        <DonacionesPreview
          title={values.title ?? ""}
          intro={values.intro ?? ""}
          sinpe={values.sinpe ?? ""}
          cuentaBancaria={values.cuentaBancaria ?? ""}
          banco={values.banco ?? ""}
          ampliadas={ampliadas}
          campoResaltado={campoResaltado}
        />
      );
    }

    if (esServicios) {
      return (
        <ServiciosPreview
          eyebrow={values.eyebrow ?? ""}
          title={values.title ?? ""}
          intro={values.intro ?? ""}
          items={serviciosPreview}
          ampliadas={ampliadas}
          campoResaltado={campoResaltado}
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
        campoResaltado={campoResaltado}
      />
    );
  };

  const pieFormulario = (
    <footer className="mt-auto flex shrink-0 flex-col gap-2.5 border-t border-border-strong bg-surface px-4 py-3 md:flex-row md:justify-end dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]">
      <Button type="submit" variant="royal" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar"}
      </Button>
      {tieneVisor && !visorVisible && (
        <Button
          type="button"
          variant="secondary"
          className="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
          onClick={() => setVisorVisible(true)}
        >
          <Eye size={16} />
          Vista previa
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        className="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
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
          className={`fixed inset-0 z-[1200] flex justify-center bg-slate-900/55 dark:bg-black/60 ${
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
          setIntentoGuardado((valor) => valor + 1);
          onSave();
        }}
      >
        <motion.section
          layout={!reducirMovimiento}
          transition={transicionVisor}
          className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-transparent bg-surface shadow-[0_24px_50px_rgba(15,23,42,0.28)] dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] ${
            visorVisible
              ? "flex-1 md:w-[min(52%,640px)] md:max-w-[640px] md:flex-none"
              : "max-h-[92vh] md:max-h-[88vh]"
          }`}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-strong px-4 py-3.5 dark:border-[rgba(220,230,242,0.12)]">
            <h3 id={titleId} className="m-0 text-lg font-bold text-royal-blue dark:text-[#d9a928]">
              Personalizar {title}
            </h3>
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white/5 dark:text-[#f3f6fa] dark:hover:bg-white/10"
              onClick={onClose}
              aria-label="Cerrar editor"
              disabled={guardando}
            >
              <X size={20} />
            </button>
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
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
              className="flex min-h-[220px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-transparent bg-surface shadow-[0_24px_50px_rgba(15,23,42,0.28)] max-md:aspect-video md:min-h-0 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)]"
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
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/75 p-3 md:p-8 dark:bg-black/60"
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
                    : esHistoria ||
                        esHorarios ||
                        esContacto ||
                        esServicios
                      ? "h-[min(86vh,920px)] max-w-6xl bg-surface"
                      : "aspect-[16/11] max-w-6xl bg-surface"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label={`Vista previa ampliada de ${
                  esHero
                    ? "hero"
                    : esHistoria
                      ? "Historia y legado"
                      : esHorarios
                        ? "Horarios"
                        : esContacto
                          ? "Contacto"
                          : esBautizos
                            ? "Bautizos"
                            : esDonaciones
                              ? "Donaciones"
                              : esServicios
                                ? "Servicios"
                                : "Sobre nosotros"
                }`}
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
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-[#f3f6fa] dark:hover:bg-white/10"
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
