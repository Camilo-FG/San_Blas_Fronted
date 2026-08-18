import { useState, type FormEvent } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import ReCAPTCHA from "react-google-recaptcha";
import { useCreateSolicSacramento } from "../hooks/useCreateSacramento";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";
import { ApiError } from "../../../services/apiClient";
import { Button, Input, Label } from "../../../shared/ui";

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

const soloLetras = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").replace(/\s{2,}/g, " ");

const soloCorreo = (valor: string) =>
  valor.replace(/[^a-zA-Z0-9@._+-]/g, "");

const requerido = (valor: string, mensaje: string) =>
  valor.trim() ? undefined : mensaje;

const validarNombre = (valor: string) =>
  requerido(valor, "El nombre es obligatorio.");

const validarPrimerApellido = (valor: string) =>
  requerido(valor, "El primer apellido es obligatorio.");

const validarSegundoApellido = (valor: string) =>
  requerido(valor, "El segundo apellido es obligatorio.");

const validarCedula = (valor: string) => {
  const cedula = soloDigitos(valor);
  if (!cedula) return "La cédula es obligatoria.";
  if (cedula.length !== 9) return "La cédula debe tener 9 dígitos.";
  return undefined;
};

const validarCorreo = (valor: string) => {
  const correo = valor.trim();
  if (!correo) return "El correo es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return "Ingresá un correo válido.";
  }
  return undefined;
};

const validarTelefono = (valor: string) => {
  if (!valor) return "El teléfono es obligatorio.";
  if (!/^\d{8}$/.test(valor)) {
    return "El teléfono debe contener exactamente 8 dígitos numéricos.";
  }
  return undefined;
};

const validarMotivo = (valor: string) =>
  requerido(valor, "Campo obligatorio.");

const fieldClass =
  "min-h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-[#fdfdfd] px-3.5 py-3 text-[0.96rem] text-slate-800 transition-[border-color,box-shadow,transform] focus:border-royal-gold focus:shadow-[0_0_0_4px_rgba(212,175,55,0.14)] focus:outline-none max-sm:min-h-11 max-sm:text-base max-sm:focus:translate-y-0";

const FormSolic = () => {
  const { mutateAsync, isPending } = useCreateSolicSacramento();
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const { captchaRef, captchaToken, handleCaptchaChange, handleCaptchaExpired, resetCaptcha } =
    useCaptcha();

  const form = useForm({
    defaultValues: {
      Nombre: "",
      PrimerApellido: "",
      SegundoApellido: "",
      Cedula: "",
      Correo: "",
      Telefono: "",
      Motivo: "",
    },
    onSubmit: async ({ value }: any) => {
      if (!captchaToken) {
        setCaptchaError("Por favor completá el reCAPTCHA.");
        return;
      }

      try {
        setErrorEnvio(null);
        await mutateAsync(value);
        form.reset();
        setCaptchaError(null);
        resetCaptcha();
        setEnviado(true);
      } catch (error) {
        const mensaje =
          error instanceof ApiError
            ? error.errores
              ? Object.values(error.errores).flat().filter(Boolean).join(" ") ||
                error.message
              : error.message
            : "No se pudo enviar la solicitud. Intente nuevamente.";
        setErrorEnvio(mensaje);
      }
    },
  });

  const valores = useStore(form.store, (state) => state.values);

  const obtenerPrimerCampoInvalido = () => {
    if (validarNombre(valores.Nombre)) return "Nombre";
    if (validarPrimerApellido(valores.PrimerApellido)) return "PrimerApellido";
    if (validarSegundoApellido(valores.SegundoApellido)) return "SegundoApellido";
    if (validarCedula(valores.Cedula)) return "Cedula";
    if (validarCorreo(valores.Correo)) return "Correo";
    if (validarTelefono(valores.Telefono)) return "Telefono";
    if (validarMotivo(valores.Motivo)) return "Motivo";
    return null;
  };

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await form.handleSubmit();
    const campoInvalido = obtenerPrimerCampoInvalido();
    if (campoInvalido) {
      const elemento = document.getElementById(campoInvalido) as HTMLInputElement | null;
      elemento?.focus();
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!captchaToken) {
      document
        .getElementById("captcha-container")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleHacerOtraSolicitud = () => {
    form.reset();
    setCaptchaError(null);
    setErrorEnvio(null);
    resetCaptcha();
    setEnviado(false);
  };

  return (
    <div className="mx-auto box-border min-w-0 w-full max-w-[760px] overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:rounded-[22px] sm:p-8">
      {enviado ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3.5 py-3 text-center sm:min-h-[320px]">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-400 shadow-[0_10px_24px_rgba(34,197,94,0.24)]">
            <svg
              width="28"
              height="28"
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

          <h3 className="m-0 text-[1.55rem] font-extrabold text-royal-blue">
            ¡Solicitud enviada con éxito!
          </h3>
          <p className="m-0 max-w-[460px] text-[0.98rem] leading-relaxed text-gray-600">
            Recibimos tu solicitud de sacramento. En breve se revisará y te contactaremos.
          </p>

          <Button
            type="button"
            variant="royal"
            onClick={handleHacerOtraSolicitud}
            className="min-h-12 px-5 shadow-[0_8px_18px_rgba(0,51,102,0.18)] hover:-translate-y-px"
          >
            Hacer otra solicitud
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 border-b border-border pb-3.5 sm:mb-6 sm:pb-4">
            <p className="m-0 mb-2 text-xs font-black tracking-[2px] text-royal-gold uppercase">
              Solicitud pastoral
            </p>
            <h2 className="m-0 mb-2 font-heading text-2xl font-extrabold text-royal-blue sm:text-[30px]">
              Formulario de Sacramento
            </h2>
            <p className="m-0 text-sm leading-relaxed text-text-secondary sm:text-[15px]">
              Completa los datos para registrar una nueva solicitud.
            </p>
          </div>

          <form
            className="grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4"
            onSubmit={manejarEnvio}
          >
            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="Nombre"
                validators={{
                  onChange: ({ value }) => validarNombre(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Nombre
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: Juan"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(soloLetras(e.target.value).slice(0, 50))}
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <span className="text-right text-[0.78rem] font-medium text-text-secondary">
                      {field.state.value.length}/50
                    </span>
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="PrimerApellido"
                validators={{
                  onChange: ({ value }) => validarPrimerApellido(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Primer apellido
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: Pérez"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(soloLetras(e.target.value).slice(0, 50))}
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <span className="text-right text-[0.78rem] font-medium text-text-secondary">
                      {field.state.value.length}/50
                    </span>
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="SegundoApellido"
                validators={{
                  onChange: ({ value }) => validarSegundoApellido(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Segundo apellido
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: González"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(soloLetras(e.target.value).slice(0, 50))}
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <span className="text-right text-[0.78rem] font-medium text-text-secondary">
                      {field.state.value.length}/50
                    </span>
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="Cedula"
                validators={{
                  onChange: ({ value }) => validarCedula(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Cédula
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 123456789"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(soloDigitos(e.target.value).slice(0, 9))
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="Correo"
                validators={{
                  onChange: ({ value }) => validarCorreo(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Correo
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="Ej: nombre@correo.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(soloCorreo(e.target.value))}
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="Telefono"
                validators={{
                  onChange: ({ value }) => validarTelefono(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Teléfono
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      inputMode="numeric"
                      placeholder="Ej: 88888888"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(soloDigitos(e.target.value).slice(0, 8))
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="col-span-1 flex w-full min-w-0 flex-col gap-2 sm:col-span-2">
              <form.Field
                name="Motivo"
                validators={{
                  onChange: ({ value }) => validarMotivo(value),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name} className="text-sm font-bold text-royal-blue">
                      Motivo
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Describe brevemente el motivo"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.slice(0, 250))}
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <span className="text-right text-[0.78rem] font-medium text-text-secondary">
                      {field.state.value.length}/250
                    </span>
                    {field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div
              id="captcha-container"
              className="col-span-1 flex flex-col items-center overflow-x-auto rounded-xl border border-border bg-surface-muted p-4 sm:col-span-2"
            >
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(token: string | null) => {
                  handleCaptchaChange(token);
                  if (token) {
                    setCaptchaError(null);
                  }
                }}
                onExpired={handleCaptchaExpired}
              />
              {captchaError && (
                <span className="mt-2 block text-[0.84rem] font-semibold text-red-500">
                  ⚠ {captchaError}
                </span>
              )}
            </div>

            <Button
              className="col-span-1 mt-1.5 min-h-[52px] w-full bg-gradient-to-br from-royal-gold to-[#f0d67a] text-base font-extrabold text-royal-blue shadow-[0_10px_18px_rgba(212,175,55,0.22)] hover:-translate-y-px hover:shadow-[0_14px_24px_rgba(212,175,55,0.28)] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none sm:col-span-2"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
            {errorEnvio && (
              <p className="col-span-1 text-[0.84rem] font-semibold text-red-500 sm:col-span-2">
                {errorEnvio}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default FormSolic;
