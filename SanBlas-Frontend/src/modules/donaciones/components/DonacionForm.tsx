import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Package,
  ShieldCheck,
  Send,
  TriangleAlert,
} from "lucide-react";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";
import { RecaptchaWidget } from "../../../shared/components/RecaptchaWidget";
import { useToast } from "../../../shared/ui";
import { useDonacionInsumos } from "../hooks/useDonacionInsumos";

const MAX_DETAIL = 300;
const MAX_NOMBRE = 25;
const MAX_APELLIDO = 25;

const soloLetras = (valor: string, permitirEspacio = false) =>
  valor.replace(
    permitirEspacio
      ? /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g
      : /[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g,
    "",
  );

const inputClass =
  "w-full rounded-2xl border border-border-strong bg-white px-4 py-3.5 text-[0.95rem] text-royal-blue outline-none transition-colors placeholder:text-text-muted/80 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/25 sm:px-5 sm:py-4 sm:text-base";

interface FormData {
  anonimo: boolean;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  correo: string;
  telefono: string;
  detalle: string;
}

interface FormErrors {
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  correo?: string;
  telefono?: string;
  detalle?: string;
  captcha?: string;
}

const ordenCampos = [
  "nombre",
  "primerApellido",
  "segundoApellido",
  "telefono",
  "correo",
  "detalle",
  "captcha",
] as const;

const primerCampoConError = (errores: FormErrors): string | null => {
  for (const campo of ordenCampos) {
    if (errores[campo]) {
      return campo === "captcha" ? "captcha-container" : campo;
    }
  }
  return null;
};

function Field({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2.5 block text-[0.9rem] font-bold text-royal-blue sm:text-sm"
      >
        {label}
      </label>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-danger">⚠ {error}</span>
      )}
    </div>
  );
}

export default function DonacionForm() {
  const [formData, setFormData] = useState<FormData>({
    anonimo: false,
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    telefono: "",
    detalle: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const { captchaRef, captchaToken, handleCaptchaChange, handleCaptchaExpired, resetCaptcha } =
    useCaptcha();
  const { showToast } = useToast();
  const { cargando, error, erroresCampo, limpiarErroresCampo, enviar } =
    useDonacionInsumos();
  const [captchaExpirado, setCaptchaExpirado] = useState(false);

  const erroresVisibles: FormErrors = useMemo(() => {
    const combinados: FormErrors = { ...errors };
    (Object.keys(erroresCampo) as (keyof FormErrors)[]).forEach((campo) => {
      if (campo === "anonimo") return;
      const mensaje = erroresCampo[campo];
      if (mensaje) combinados[campo] = mensaje;
    });
    return combinados;
  }, [errors, erroresCampo]);

  const RECAPTCHA_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ??
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  const validar = (): FormErrors => {
    const nuevosErrores: FormErrors = {};

    if (!captchaToken) {
      nuevosErrores.captcha = "Debé completar el captcha antes de enviar.";
    }

    if (!formData.anonimo) {
      const nombreTrim = formData.nombre.trim();
      if (!nombreTrim) {
        nuevosErrores.nombre = "El nombre es requerido.";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
        nuevosErrores.nombre = "El nombre solo puede contener letras.";
      } else if (nombreTrim.length > MAX_NOMBRE) {
        nuevosErrores.nombre = `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`;
      }

      const primerApellidoTrim = formData.primerApellido.trim();
      if (!primerApellidoTrim) {
        nuevosErrores.primerApellido = "El primer apellido es requerido.";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(primerApellidoTrim)) {
        nuevosErrores.primerApellido =
          "El primer apellido solo puede contener letras.";
      } else if (primerApellidoTrim.length > MAX_APELLIDO) {
        nuevosErrores.primerApellido = `El primer apellido no puede superar los ${MAX_APELLIDO} caracteres.`;
      }

      const segundoApellidoTrim = formData.segundoApellido.trim();
      if (segundoApellidoTrim) {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(segundoApellidoTrim)) {
          nuevosErrores.segundoApellido =
            "El segundo apellido solo puede contener letras.";
        } else if (segundoApellidoTrim.length > MAX_APELLIDO) {
          nuevosErrores.segundoApellido = `El segundo apellido no puede superar los ${MAX_APELLIDO} caracteres.`;
        }
      }
    }

    const correoTrim = formData.correo.trim();
    if (!correoTrim) {
      nuevosErrores.correo = "El correo electrónico es requerido.";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correoTrim)
    ) {
      nuevosErrores.correo = "Ingresá un correo válido. Ej: nombre@dominio.com";
    }

    if (!formData.anonimo) {
      if (!formData.telefono.trim()) {
        nuevosErrores.telefono = "El teléfono es requerido.";
      } else if (!/^\d{4}-\d{4}$/.test(formData.telefono)) {
        nuevosErrores.telefono = "El formato debe ser 8888-8888.";
      }
    }

    if (!formData.detalle.trim()) {
      nuevosErrores.detalle = "El detalle es requerido.";
    } else if (formData.detalle.trim().length < 10) {
      nuevosErrores.detalle = "El detalle debe tener al menos 10 caracteres.";
    } else if (formData.detalle.trim().length > MAX_DETAIL) {
      nuevosErrores.detalle = `El detalle no puede superar los ${MAX_DETAIL} caracteres.`;
    }

    setErrors(nuevosErrores);
    return nuevosErrores;
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string") {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    limpiarErroresCampo();
  };

  const handleTelefono = (value: string) => {
    const soloNumeros = value.replace(/\D/g, "").slice(0, 8);
    const formateado =
      soloNumeros.length > 4
        ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
        : soloNumeros;
    handleChange("telefono", formateado);
  };

  const handleNombre = (value: string) =>
    handleChange("nombre", soloLetras(value, true).slice(0, MAX_NOMBRE));

  const handlePrimerApellido = (value: string) =>
    handleChange("primerApellido", soloLetras(value).slice(0, MAX_APELLIDO));

  const handleSegundoApellido = (value: string) =>
    handleChange("segundoApellido", soloLetras(value).slice(0, MAX_APELLIDO));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const revision = validar();
    if (Object.keys(revision).length > 0) {
      const primerId = primerCampoConError(revision);
      if (primerId) {
        document
          .getElementById(primerId)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!navigator.onLine) {
      showToast("No hay conexión a Internet, inténtalo más tarde.", "error");
      return;
    }

    const nombreCompleto = [formData.nombre, formData.primerApellido, formData.segundoApellido]
      .map((parte) => parte.trim())
      .filter(Boolean)
      .join(" ");

    const enviada = await enviar({
      anonimo: formData.anonimo,
      nombre: formData.anonimo ? "Anónimo" : nombreCompleto,
      correo: formData.correo.trim(),
      telefono: formData.anonimo ? "N/A" : formData.telefono,
      detalle: formData.detalle,
      recaptchaToken: captchaToken ?? undefined,
    });

    if (!enviada) return;

    showToast(
      "¡Tu solicitud de donación fue enviada correctamente! Te contactaremos por los medios indicados.",
      "success",
    );
    setFormData({
      anonimo: false,
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      correo: "",
      telefono: "",
      detalle: "",
    });
    resetCaptcha();
    setCaptchaExpirado(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!error) return;
    showToast(error, "error");
  }, [error, showToast]);

  return (
    <section id="insumos" className="scroll-mt-24">
      <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-royal-blue text-royal-gold sm:size-16">
          <Package className="size-7 sm:size-8" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-[clamp(1.6rem,3.5vw,2rem)] font-bold text-royal-blue">
          Donación de Insumos
        </h2>
        <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-text-muted sm:text-base">
          Completa el formulario para registrar tu donación de insumos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[1.35rem] border border-border bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:p-9"
      >
        <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-royal-gold/35 bg-surface-muted/50 p-5 transition-colors hover:bg-surface-muted sm:p-6">
          <input
            type="checkbox"
            checked={formData.anonimo}
onChange={(e) => {
                const checked = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  anonimo: checked,
                  nombre: "",
                  primerApellido: "",
                  segundoApellido: "",
                  telefono: "",
                }));
                setErrors((prev) => ({
                  ...prev,
                  nombre: undefined,
                  primerApellido: undefined,
                  segundoApellido: undefined,
                  telefono: undefined,
                }));
              }}
            className="mt-1 size-[1.15rem] shrink-0 accent-royal-blue sm:mt-0.5"
          />
          <span>
            <span className="block text-[0.95rem] font-bold text-royal-blue sm:text-base">
              Donar de forma anónima
            </span>
            <span className="mt-1 block text-[0.9rem] leading-relaxed text-text-muted sm:text-sm">
              {formData.anonimo
                ? "Tu nombre no será visible. Te notificaremos por correo si tu donación es aprobada o rechazada."
                : "Se pedirá nombre, apellidos, correo, teléfono y detalle."}
            </span>
          </span>
        </label>

        {!formData.anonimo && (
          <div className="mt-7 grid gap-6 sm:gap-7">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-7">
            <Field label="Nombre" htmlFor="nombre" error={erroresVisibles.nombre}>
              <input
                id="nombre"
                type="text"
                required={!formData.anonimo}
                placeholder="Ej: Juan"
                value={formData.nombre}
                onChange={(e) => handleNombre(e.target.value)}
                maxLength={MAX_NOMBRE}
                className={inputClass}
              />
            </Field>

            <Field
              label="Primer apellido"
              htmlFor="primerApellido"
              error={erroresVisibles.primerApellido}
            >
              <input
                id="primerApellido"
                type="text"
                required={!formData.anonimo}
                placeholder="Ej: Pérez"
                value={formData.primerApellido}
                onChange={(e) => handlePrimerApellido(e.target.value)}
                maxLength={MAX_APELLIDO}
                className={inputClass}
              />
            </Field>

            <Field
              label="Segundo apellido (opcional)"
              htmlFor="segundoApellido"
              error={erroresVisibles.segundoApellido}
            >
              <input
                id="segundoApellido"
                type="text"
                placeholder="Ej: González"
                value={formData.segundoApellido}
                onChange={(e) => handleSegundoApellido(e.target.value)}
                maxLength={MAX_APELLIDO}
                className={inputClass}
              />
            </Field>
          </div>

            <Field label="Teléfono" htmlFor="telefono" error={erroresVisibles.telefono}>
              <input
                id="telefono"
                type="tel"
                required={!formData.anonimo}
                placeholder="Ej: 8888-8888"
                value={formData.telefono}
                onChange={(e) => handleTelefono(e.target.value)}
                maxLength={9}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        <div className={formData.anonimo ? "mt-7" : "mt-6"}>
          <Field label="Correo electrónico" htmlFor="correo" error={erroresVisibles.correo}>
            <input
              id="correo"
              type="email"
              required
              placeholder="Ej: ejemplo@correo.com"
              value={formData.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className={formData.anonimo ? "mt-7" : "mt-6"}>
          <div className="mb-2.5 flex items-baseline justify-between">
            <label htmlFor="detalle" className="text-[0.9rem] font-bold text-royal-blue sm:text-sm">
              Detalle de la donación
            </label>
            <span className="text-xs text-text-muted sm:text-[0.8rem]">
              {formData.detalle.length}/{MAX_DETAIL}
            </span>
          </div>
          <textarea
            id="detalle"
            required
            rows={5}
            maxLength={MAX_DETAIL}
            value={formData.detalle}
            onChange={(e) => handleChange("detalle", e.target.value)}
            placeholder="Ej: Ropa en buen estado para niños de 5 a 10 años"
            className={`${inputClass} resize-none`}
          />
          {erroresVisibles.detalle && (
            <span className="mt-1 block text-xs text-danger">⚠ {erroresVisibles.detalle}</span>
          )}
        </div>

        <div
          id="captcha-container"
          className="mt-6 flex flex-col items-center rounded-xl border border-border bg-surface-muted p-4"
        >
          <div className="flex w-full max-w-[304px] justify-center overflow-visible">
            <RecaptchaWidget
              sitekey={RECAPTCHA_KEY}
              captchaRef={captchaRef}
              onChange={(token: string | null) => {
                handleCaptchaChange(token);
                if (token) {
                  setCaptchaExpirado(false);
                  setErrors((prev) => ({ ...prev, captcha: undefined }));
                }
              }}
              onExpired={() => {
                handleCaptchaExpired();
                setCaptchaExpirado(true);
              }}
            />
          </div>
          {captchaExpirado && (
            <p className="mt-3 flex w-full max-w-[304px] items-center justify-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-center text-[0.85rem] font-medium text-yellow-700">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              La verificación expiró, resolvela de nuevo para continuar
            </p>
          )}
        </div>

        <p className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface-muted/60 px-5 py-4 text-[0.85rem] leading-relaxed text-text-muted sm:items-center sm:text-sm">
          <ShieldCheck className="mt-0.5 size-[1.1rem] shrink-0 text-royal-blue sm:mt-0" aria-hidden="true" />
          Tu correo se usará para avisarte si tu donación es aprobada o rechazada, y para coordinar la entrega.
        </p>

        <button
          type="submit"
          disabled={cargando || captchaExpirado || !captchaToken}
          className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-royal-blue px-6 py-4 text-[0.95rem] font-bold text-white transition-colors hover:bg-royal-blue/90 focus:outline-none focus:ring-2 focus:ring-royal-gold/40 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white sm:py-[1.15rem] sm:text-base"
        >
          {cargando ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden="true" />
              Enviar Donación
            </>
          )}
        </button>
      </form>
    </section>
  );
}
