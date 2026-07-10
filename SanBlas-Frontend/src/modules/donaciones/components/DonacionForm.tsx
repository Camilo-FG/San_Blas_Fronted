import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";
import { crearDonacion } from "../../../services/donacionesService";
import { ApiError } from "../../../services/apiClient";
import { Button, cn, FieldError, Input, Label, Textarea } from "../../../shared/ui";

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

export default function DonacionForm(): React.JSX.Element {
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
  const [enviado, setEnviado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);

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
    } else if (formData.detalle.trim().length > 300) {
      nuevosErrores.detalle = "El detalle no puede superar los 300 caracteres.";
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

  const handleSubmit = async () => {
    if (!validar()) return;

    setCargando(true);

    try {
      const nuevaDonacion = {
        anonimo: formData.anonimo,
        nombre: formData.anonimo ? "Anónimo" : formData.nombre,
        correo: formData.correo,
        telefono: formData.anonimo ? "N/A" : formData.telefono,
        detalle: formData.detalle,
      };

      await crearDonacion(nuevaDonacion);

      setEnviado(true);
      setFormData({ anonimo: false, nombre: "", correo: "", telefono: "", detalle: "" });
      resetCaptcha();
    } catch (error) {
      console.error("Error de conexión con el Backend:", error);
      const mensaje =
        error instanceof ApiError
          ? error.message
          : "Hubo un problema al enviar la donación al servidor. Inténtalo de nuevo.";
      alert(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleHacerOtraDonacion = () => {
    setFormData({ anonimo: false, nombre: "", correo: "", telefono: "", detalle: "" });
    resetCaptcha();
    setErrors({});
    setEnviado(false);

    setTimeout(() => {
      captchaRef.current?.reset();
    }, 50);
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[700px] rounded-[10px] border border-border bg-surface p-4 shadow-[0_4px_16px_rgba(0,51,102,0.08)] transition-all sm:rounded-[14px] sm:p-6 md:p-9",
        enviado && "border-2 border-royal-gold",
      )}
    >
      {enviado ? (
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-400 shadow-[0_4px_12px_rgba(74,222,128,0.3)]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h3 className="m-0 mb-2.5 text-[1.2rem] font-bold text-royal-blue sm:text-[1.4rem]">
            ¡Donación enviada con éxito!
          </h3>

          <p className="m-0 mb-6 max-w-[450px] text-[0.95rem] leading-relaxed text-gray-600">
            Gracias por tu generosidad. Nos pondremos en contacto con vos pronto.
          </p>

          <Button
            onClick={handleHacerOtraDonacion}
            variant="royal"
            className="px-8 py-3 shadow-[0_4px_10px_rgba(0,51,102,0.2)]"
          >
            Hacer otra donación
          </Button>
        </div>
      ) : (
        <>
          <h3 className="m-0 mb-1.5 text-[1.2rem] text-royal-blue sm:text-[1.4rem]">
            Formulario de Donación de Insumos
          </h3>
          <p className="m-0 mb-7 text-[0.95rem] text-text">
            Completá el formulario para registrar tu donación de insumos.
          </p>

          <div
            className="mb-6 flex cursor-pointer items-center gap-3 rounded-[10px] border-2 border-royal-gold bg-surface-muted px-4 py-3.5 select-none sm:items-center sm:px-5 sm:py-4 max-[480px]:items-start"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                anonimo: !prev.anonimo,
                nombre: "",
                telefono: "",
              }));
              setErrors((prev) => ({ ...prev, nombre: undefined, telefono: undefined }));
            }}
          >
            <div
              className={cn(
                "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 border-royal-blue transition-colors",
                formData.anonimo && "border-royal-gold bg-royal-gold",
              )}
            >
              {formData.anonimo && (
                <span className="text-sm font-bold text-royal-blue">✓</span>
              )}
            </div>
            <div>
              <p className="m-0 font-semibold text-royal-blue">Donar de forma anónima</p>
              <p className="m-0 text-[0.85rem] text-text">
                {formData.anonimo
                  ? "Solo se pedirá tu correo y el detalle de la donación."
                  : "Se pedirá nombre completo, correo, teléfono y detalle."}
              </p>
            </div>
          </div>

          {!formData.anonimo && (
            <div className="mb-5">
              <Label className="text-royal-blue">Nombre completo</Label>
              <Input
                type="text"
                placeholder="Ej: Juan Pérez González"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                hasError={Boolean(errors.nombre)}
              />
              {errors.nombre && (
                <span className="mt-1 block text-[0.82rem] text-red-500">
                  ⚠ {errors.nombre}
                </span>
              )}
            </div>
          )}

          <div className="mb-5">
            <Label className="text-royal-blue">Correo electrónico</Label>
            <Input
              type="email"
              placeholder="Ej: ejemplo@correo.com"
              value={formData.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              hasError={Boolean(errors.correo)}
            />
            {errors.correo && (
              <span className="mt-1 block text-[0.82rem] text-red-500">
                ⚠ {errors.correo}
              </span>
            )}
          </div>

          {!formData.anonimo && (
            <div className="mb-5">
              <Label className="text-royal-blue">Teléfono</Label>
              <Input
                type="text"
                placeholder="Ej: 8888-8888"
                value={formData.telefono}
                onChange={(e) => handleTelefono(e.target.value)}
                hasError={Boolean(errors.telefono)}
                maxLength={9}
              />
              {errors.telefono && (
                <span className="mt-1 block text-[0.82rem] text-red-500">
                  ⚠ {errors.telefono}
                </span>
              )}
            </div>
          )}

          <div className="mb-6">
            <Label className="text-royal-blue">
              Detalle de la donación
              <span className="ml-1.5 font-normal text-gray-500">
                ({formData.detalle.length}/300)
              </span>
            </Label>
            <Textarea
              placeholder="Ej: Ropa en buen estado para niños de 5 a 10 años"
              value={formData.detalle}
              onChange={(e) => handleChange("detalle", e.target.value)}
              rows={4}
              maxLength={300}
              hasError={Boolean(errors.detalle)}
            />
            {errors.detalle && (
              <span className="mt-1 block text-[0.82rem] text-red-500">
                ⚠ {errors.detalle}
              </span>
            )}
          </div>

          <div className="mb-6 flex h-auto max-w-full justify-center overflow-visible">
            {captchaHabilitado ? (
              <ReCAPTCHA
                ref={captchaRef}
                sitekey={RECAPTCHA_KEY!}
                onChange={(token: string | null) => {
                  handleCaptchaChange(token);
                  setErrors((prev) => ({ ...prev, captcha: undefined }));
                }}
                onExpired={handleCaptchaExpired}
              />
            ) : (
              <p className="m-0 rounded-[10px] border border-dashed border-border-strong bg-surface-muted px-4 py-3 text-[0.9rem] leading-relaxed text-text-muted">
                reCAPTCHA no configurado en este entorno. El formulario funciona en modo desarrollo.
              </p>
            )}
            {errors.captcha && (
              <span className="mt-1 block text-[0.82rem] text-red-500">
                ⚠ {errors.captcha}
              </span>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={cargando}
            className="w-full bg-royal-gold py-3.5 text-base font-bold text-royal-blue shadow-[0_4px_12px_rgba(212,175,55,0.3)] hover:opacity-90"
          >
            Enviar Donación
          </Button>
        </>
      )}
    </div>
  );
}
