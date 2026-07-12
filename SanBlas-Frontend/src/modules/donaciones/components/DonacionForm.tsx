import type React from "react";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Package,
  ShieldCheck,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";
import { crearDonacion } from "../../../services/donacionesService";
import { ApiError } from "../../../services/apiClient";

const MAX_DETAIL = 300;

const inputClass =
  "w-full rounded-2xl border border-border-strong bg-white px-4 py-3.5 text-[0.95rem] text-royal-blue outline-none transition-colors placeholder:text-text-muted/80 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/25 sm:px-5 sm:py-4 sm:text-base";

interface FormData {
  anonimo: boolean;
  nombre: string;
  correo: string;
  telefono: string;
  detalle: string;
}

interface FormErrors {
  nombre?: string;
  correo?: string;
  telefono?: string;
  detalle?: string;
  captcha?: string;
}

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
    correo: "",
    telefono: "",
    detalle: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const { captchaRef, captchaToken, handleCaptchaChange, handleCaptchaExpired, resetCaptcha } =
    useCaptcha();
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const captchaHabilitado = Boolean(RECAPTCHA_KEY);

  const validar = (): boolean => {
    const nuevosErrores: FormErrors = {};

    if (captchaHabilitado && !captchaToken) {
      nuevosErrores.captcha = "Por favor completá el reCAPTCHA.";
    }

    if (!formData.anonimo) {
      const nombreTrim = formData.nombre.trim();
      if (!nombreTrim) {
        nuevosErrores.nombre = "El nombre completo es requerido.";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
        nuevosErrores.nombre = "El nombre solo puede contener letras.";
      } else if (!nombreTrim.includes(" ") || nombreTrim.split(/\s+/).length < 2) {
        nuevosErrores.nombre = "Por favor, ingresá tu nombre y al menos un apellido.";
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
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string") {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTelefono = (value: string) => {
    const soloNumeros = value.replace(/\D/g, "").slice(0, 8);
    const formateado =
      soloNumeros.length > 4
        ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
        : soloNumeros;
    handleChange("telefono", formateado);
  };

  const resetFormulario = () => {
    setFormData({ anonimo: false, nombre: "", correo: "", telefono: "", detalle: "" });
    resetCaptcha();
    setErrors({});
    setEnviado(false);
    setTimeout(() => captchaRef.current?.reset(), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);

    try {
      await crearDonacion({
        anonimo: formData.anonimo,
        nombre: formData.anonimo ? "Anónimo" : formData.nombre,
        correo: formData.correo.trim(),
        telefono: formData.anonimo ? "N/A" : formData.telefono,
        detalle: formData.detalle,
      });

      setEnviado(true);
      setFormData({ anonimo: false, nombre: "", correo: "", telefono: "", detalle: "" });
      resetCaptcha();
      setTimeout(() => setEnviado(false), 4000);
    } catch (error) {
      const mensaje =
        error instanceof ApiError
          ? error.message
          : "Hubo un problema al enviar la donación al servidor. Inténtalo de nuevo.";
      alert(mensaje);
    } finally {
      setCargando(false);
    }
  };

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
                telefono: "",
              }));
              setErrors((prev) => ({
                ...prev,
                nombre: undefined,
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
                : "Se pedirá nombre completo, correo, teléfono y detalle."}
            </span>
          </span>
        </label>

        {!formData.anonimo && (
          <div className="mt-7 grid gap-6 sm:gap-7">
            <Field label="Nombre completo" htmlFor="nombre" error={errors.nombre}>
              <input
                id="nombre"
                type="text"
                required={!formData.anonimo}
                placeholder="Ej: Juan Pérez González"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Teléfono" htmlFor="telefono" error={errors.telefono}>
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
          <Field label="Correo electrónico" htmlFor="correo" error={errors.correo}>
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
          {errors.detalle && (
            <span className="mt-1 block text-xs text-danger">⚠ {errors.detalle}</span>
          )}
        </div>

        {captchaHabilitado && (
          <div className="mt-5 flex justify-center">
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={RECAPTCHA_KEY!}
              onChange={(token: string | null) => {
                handleCaptchaChange(token);
                setErrors((prev) => ({ ...prev, captcha: undefined }));
              }}
              onExpired={handleCaptchaExpired}
            />
          </div>
        )}

        {!captchaHabilitado && (
          <p className="mt-5 rounded-xl border border-dashed border-border-strong bg-surface-muted px-4 py-3 text-xs text-text-muted">
            reCAPTCHA no configurado en este entorno. El formulario funciona en modo desarrollo.
          </p>
        )}

        {errors.captcha && (
          <span className="mt-2 block text-center text-xs text-danger">
            ⚠ {errors.captcha}
          </span>
        )}

        <p className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface-muted/60 px-5 py-4 text-[0.85rem] leading-relaxed text-text-muted sm:items-center sm:text-sm">
          <ShieldCheck className="mt-0.5 size-[1.1rem] shrink-0 text-royal-blue sm:mt-0" aria-hidden="true" />
          Tu correo se usará para avisarte si tu donación es aprobada o rechazada, y para coordinar la entrega.
        </p>

        <button
          type="submit"
          disabled={cargando}
          className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-royal-blue px-6 py-4 text-[0.95rem] font-bold text-white transition-colors hover:bg-royal-blue/90 focus:outline-none focus:ring-2 focus:ring-royal-gold/40 disabled:cursor-not-allowed disabled:opacity-70 sm:py-[1.15rem] sm:text-base"
        >
          {enviado ? (
            <>
              <CheckCircle2 className="size-5" aria-hidden="true" />
              ¡Donación registrada!
            </>
          ) : cargando ? (
            "Enviando..."
          ) : (
            <>
              <Send className="size-5" aria-hidden="true" />
              Enviar Donación
            </>
          )}
        </button>

        {enviado && (
          <button
            type="button"
            onClick={resetFormulario}
            className="mt-3 w-full text-center text-sm font-semibold text-royal-blue underline-offset-2 hover:underline"
          >
            Hacer otra donación
          </button>
        )}
      </form>
    </section>
  );
}
