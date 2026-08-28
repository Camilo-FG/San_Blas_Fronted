import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import ReCAPTCHA from "react-google-recaptcha";
import { useCreateSolicSacramento } from "../hooks/useCreateSacramento";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";
import { ApiError } from "../../../services/apiClient";
import { obtenerDatosCedula, type DatosCedula } from "../../../services/cedulaService";
import { Button, Input, Label, Textarea } from "../../../shared/ui";

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

const formatearCedula = (valor: string) => {
  const digitos = soloDigitos(valor).slice(0, 9);
  if (digitos.length <= 1) return digitos;
  if (digitos.length <= 5)
    return `${digitos.slice(0, 1)}-${digitos.slice(1)}`;
  return `${digitos.slice(0, 1)}-${digitos.slice(1, 5)}-${digitos.slice(5)}`;
};

const formatearTelefono = (valor: string) => {
  const digitos = soloDigitos(valor).slice(0, 8);
  if (digitos.length <= 4) return digitos;
  return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
};

const soloLetras = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").replace(/\s{2,}/g, " ");

const soloCorreo = (valor: string) => valor.replace(/[^a-zA-Z0-9@._+-]/g, "");

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
  const telefono = soloDigitos(valor);
  if (!telefono) return "El teléfono es obligatorio.";
  if (!/^\d{8}$/.test(telefono)) {
    return "El teléfono debe contener exactamente 8 dígitos numéricos.";
  }
  return undefined;
};

const validarMotivo = (valor: string) => requerido(valor, "Campo obligatorio.");

const fieldClass =
  "min-h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-[#fdfdfd] px-3.5 py-3 text-[0.96rem] text-slate-800 transition-[border-color,box-shadow,transform] focus:border-royal-gold focus:shadow-[0_0_0_4px_rgba(212,175,55,0.14)] focus:outline-none max-sm:min-h-11 max-sm:text-base max-sm:focus:translate-y-0";

const FormSolic = () => {
  const { mutateAsync, isPending } = useCreateSolicSacramento();
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [errorCedula, setErrorCedula] = useState<string | null>(null);
  const [errorMotivoBackend, setErrorMotivoBackend] = useState<string | null>(
    null,
  );
  const [verificandoCedula, setVerificandoCedula] = useState(false);
  const [cedulaValida, setCedulaValida] = useState(false);
  const [datosCedulaValidada, setDatosCedulaValidada] = useState<DatosCedula | null>(null);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const cedulaValidadaRef = useRef<string | null>(null);
  const exitoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (enviado) {
      exitoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [enviado]);

  const {
    captchaRef,
    captchaToken,
    handleCaptchaChange,
    handleCaptchaExpired,
    resetCaptcha,
  } = useCaptcha();

  const form = useForm({
    defaultValues: {
      Nombre: "",
      PrimerApellido: "",
      SegundoApellido: "",
      Cedula: "",
      Correo: "",
      Telefono: "",
      TipoSacramento: "Bautismo",
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
        setErrorCedula(null);
        setErrorMotivoBackend(null);
        resetCaptcha();
        setEnviado(true);
      } catch (error) {
        const erroresMotivo: string[] = [];
        const esErrorMotivo = (clave: string, mensaje: string) =>
          /motivo/i.test(clave) || /contiene caracteres no permitidos/i.test(mensaje);
        let mensaje = "No se pudo enviar la solicitud. Intente nuevamente.";
        if (error instanceof ApiError) {
          if (error.errores) {
            mensaje =
              Object.entries(error.errores)
                .flatMap(([clave, mensajes]) =>
                  (Array.isArray(mensajes) ? mensajes : [mensajes]).map(
                    (m) => ({ clave, m }),
                  ),
                )
                .filter(({ m }) => Boolean(m))
                .filter(({ clave, m }) => {
                  if (esErrorMotivo(clave, m)) {
                    erroresMotivo.push(m);
                    return false;
                  }
                  return !/Cedula must not be less than \d+/.test(m);
                })
                .map(({ m }) => m)
                .join(" ") || error.message;
          } else if (/motivo/i.test(error.message)) {
            erroresMotivo.push(error.message);
            mensaje = "";
          } else {
            mensaje = error.message;
          }
        }
        if (erroresMotivo.length > 0) {
          setErrorMotivoBackend(erroresMotivo.join(" "));
          document
            .getElementById("Motivo")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setErrorEnvio(mensaje || null);
      }
    },
  });

  const valores = useStore(form.store, (state) => state.values);

  const obtenerPrimerCampoInvalido = () => {
    if (validarNombre(valores.Nombre)) return "Nombre";
    if (validarPrimerApellido(valores.PrimerApellido)) return "PrimerApellido";
    if (validarSegundoApellido(valores.SegundoApellido))
      return "SegundoApellido";
    if (validarCedula(valores.Cedula)) return "Cedula";
    if (validarCorreo(valores.Correo)) return "Correo";
    if (validarTelefono(valores.Telefono)) return "Telefono";
    if (validarMotivo(valores.Motivo)) return "Motivo";
    return null;
  };

  // Trigger cédula validation when 9 digits are entered
  useEffect(() => {
    const digitos = soloDigitos(valores.Cedula);
    if (digitos.length === 9) {
      const validar = async () => {
        setVerificandoCedula(true);
        setErrorCedula(null);
        setCedulaValida(false);
        setDatosCedulaValidada(null);

        try {
          // Forced minimum 2-second loading
          const [datos] = await Promise.all([
            obtenerDatosCedula(digitos),
            new Promise((resolve) => setTimeout(resolve, 2000)),
          ]);

          if (datos) {
            setCedulaValida(true);
            setDatosCedulaValidada(datos);
            setErrorCedula(null);
            cedulaValidadaRef.current = digitos;

            // Auto-fill name fields
            form.setFieldValue(
              "Nombre",
              soloLetras(datos.nombre).slice(0, 20),
            );
            form.setFieldValue(
              "PrimerApellido",
              soloLetras(datos.primerApellido).slice(0, 20),
            );
            form.setFieldValue(
              "SegundoApellido",
              soloLetras(datos.segundoApellido).slice(0, 20),
            );
          } else {
            setCedulaValida(false);
            setDatosCedulaValidada(null);
            setErrorCedula("La cédula ingresada no existe.");
          }
        } catch {
          setCedulaValida(false);
          setDatosCedulaValidada(null);
          setErrorCedula("No se pudo verificar la cédula. Intente nuevamente.");
        } finally {
          setVerificandoCedula(false);
        }
      };

      validar();
    } else if (digitos.length < 9) {
      // Reset when cedula is cleared or incomplete
      setCedulaValida(false);
      setDatosCedulaValidada(null);
      setVerificandoCedula(false);
      setErrorCedula(null);
      cedulaValidadaRef.current = null;

      // Clear auto-filled name fields
      form.setFieldValue("Nombre", "");
      form.setFieldValue("PrimerApellido", "");
      form.setFieldValue("SegundoApellido", "");
    }
  }, [valores.Cedula, form]);

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIntentoEnvio(true);

    const campoInvalido = obtenerPrimerCampoInvalido();
    if (campoInvalido) {
      const elemento = document.getElementById(
        campoInvalido,
      ) as HTMLInputElement | null;
      elemento?.focus();
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Check if cedula was already validated before submitting
    if (!cedulaValida) {
      if (!errorCedula) {
        setErrorCedula("La cédula no ha sido validada. Complete la cédula y espere la validación.");
      }
      const cedulaInput = document.getElementById(
        "Cedula",
      ) as HTMLInputElement | null;
      cedulaInput?.focus();
      cedulaInput?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!captchaToken) {
      document
        .getElementById("captcha-container")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    await form.handleSubmit();
  };

  const handleHacerOtraSolicitud = () => {
    form.reset();
    setCaptchaError(null);
    setErrorCedula(null);
    setErrorMotivoBackend(null);
    setErrorEnvio(null);
    setVerificandoCedula(false);
    setCedulaValida(false);
    setDatosCedulaValidada(null);
    setIntentoEnvio(false);
    cedulaValidadaRef.current = null;
    resetCaptcha();
    setEnviado(false);
  };

  return (
    <div className="mx-auto box-border min-w-0 w-full max-w-[760px] overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:rounded-[22px] sm:p-8">
      {enviado ? (
        <div
          ref={exitoRef}
          className="flex min-h-[260px] flex-col items-center justify-center gap-3.5 py-3 text-center sm:min-h-[320px]"
        >
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
            Recibimos tu solicitud de sacramento. En breve se revisará y te
            contactaremos.
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
              Solicitud de Sacramento
            </h2>
            <p className="m-0 text-sm leading-relaxed text-text-secondary sm:text-[15px]">
              Completa el formulario para solicitar tus constancia sacramental.
            </p>
          </div>

          <form
            className="grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4"
            onSubmit={manejarEnvio}
          >
            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="Cedula"
                validators={{
                  onChange: ({ value }) => validarCedula(value),
                }}
              >
                {(field) => (
                  <>
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Cédula
                    </Label>
                    <div className="relative">
                      <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 1-2345-6789"
                      value={field.state.value}
                      onChange={(e) => {
                        const formatted = formatearCedula(e.target.value);
                        field.handleChange(formatted);

                        // Detect post-validation modification
                        const digitos = soloDigitos(formatted);
                        if (cedulaValida && cedulaValidadaRef.current && digitos !== cedulaValidadaRef.current) {
                          // User modified validated cedula - silently clear auto-filled data
                          setCedulaValida(false);
                          setDatosCedulaValidada(null);
                          setErrorCedula(null);
                          cedulaValidadaRef.current = null;
                          form.setFieldValue("Nombre", "");
                          form.setFieldValue("PrimerApellido", "");
                          form.setFieldValue("SegundoApellido", "");
                        }

                        if (errorCedula) setErrorCedula(null);
                      }}
                      onBlur={field.handleBlur}
                      className={fieldClass}
                      disabled={verificandoCedula}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {verificandoCedula && (
                        <svg
                          className="animate-spin h-4 w-4 text-royal-blue"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {cedulaValida && (
                        <svg
                          className="h-4 w-4 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                    {intentoEnvio && field.state.meta.errors[0] && (
                      <span className="text-[0.84rem] font-semibold text-red-500">
                        ⚠ {field.state.meta.errors[0]}
                      </span>
                    )}
                    {errorCedula && (
                      <span
                        role="alert"
                        className="text-[0.84rem] font-semibold text-red-500"
                      >
                        ⚠ {errorCedula}
                      </span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <form.Field
                name="Nombre"
                validators={{
                  onChange: ({ value }) => validarNombre(value),
                }}
              >
                {(field) => (
                  <>
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Nombre
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: Juan"
                      value={field.state.value}
                      disabled={verificandoCedula}
                      onChange={(e) =>
                        field.handleChange(
                          soloLetras(e.target.value).slice(0, 20),
                        )
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <div className="flex w-full items-start justify-between gap-2">
                      {intentoEnvio && field.state.meta.errors[0] && (
                        <span className="text-[0.84rem] font-semibold text-red-500">
                          ⚠ {field.state.meta.errors[0]}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-right text-[0.78rem] font-medium text-text-secondary">
                        {field.state.value.length}/20
                      </span>
                    </div>
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
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Primer apellido
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: Pérez"
                      value={field.state.value}
                      disabled={verificandoCedula}
                      onChange={(e) =>
                        field.handleChange(
                          soloLetras(e.target.value).slice(0, 20),
                        )
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <div className="flex w-full items-start justify-between gap-2">
                      {intentoEnvio && field.state.meta.errors[0] && (
                        <span className="text-[0.84rem] font-semibold text-red-500">
                          ⚠ {field.state.meta.errors[0]}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-right text-[0.78rem] font-medium text-text-secondary">
                        {field.state.value.length}/20
                      </span>
                    </div>
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
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Segundo apellido
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: González"
                      value={field.state.value}
                      disabled={verificandoCedula}
                      onChange={(e) =>
                        field.handleChange(
                          soloLetras(e.target.value).slice(0, 20),
                        )
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <div className="flex w-full items-start justify-between gap-2">
                      {intentoEnvio && field.state.meta.errors[0] && (
                        <span className="text-[0.84rem] font-semibold text-red-500">
                          ⚠ {field.state.meta.errors[0]}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-right text-[0.78rem] font-medium text-text-secondary">
                        {field.state.value.length}/20
                      </span>
                    </div>
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
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Correo
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="Ej: nombre@correo.com"
                      maxLength={35}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(
                          soloCorreo(e.target.value).slice(0, 35),
                        )
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    <div className="flex w-full items-start justify-between gap-2">
                      {intentoEnvio && field.state.meta.errors[0] && (
                        <span className="text-[0.84rem] font-semibold text-red-500">
                          ⚠ {field.state.meta.errors[0]}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-right text-[0.78rem] font-medium text-text-secondary">
                        {field.state.value.length}/35
                      </span>
                    </div>
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
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Teléfono
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      inputMode="numeric"
                      placeholder="Ej: 8888-8888"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(formatearTelefono(e.target.value))
                      }
                      onBlur={field.handleBlur}
                      className={fieldClass}
                    />
                    {intentoEnvio && field.state.meta.errors[0] && (
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
                    <Label
                      htmlFor={field.name}
                      required
                      className="text-sm font-bold text-royal-blue"
                    >
                      Motivo
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Describe brevemente el motivo"
                      maxLength={250}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value.slice(0, 250));
                        if (errorMotivoBackend) setErrorMotivoBackend(null);
                      }}
                      onBlur={field.handleBlur}
                    />
                    <div className="flex w-full items-start justify-between gap-2">
                      {(errorMotivoBackend || (intentoEnvio && field.state.meta.errors[0])) && (
                        <span className="text-[0.84rem] font-semibold text-red-500">
                          {errorMotivoBackend && (
                            <span role="alert">⚠ {errorMotivoBackend}</span>
                          )}
                          {intentoEnvio && field.state.meta.errors[0] && (
                            <span>⚠ {field.state.meta.errors[0]}</span>
                          )}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-right text-[0.78rem] font-medium text-text-secondary">
                        {field.state.value.length}/250
                      </span>
                    </div>
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
              variant="royal"
              className="col-span-1 mt-7 w-full rounded-2xl px-6 py-4 text-[0.95rem] transition-colors focus:outline-none focus:ring-2 focus:ring-royal-gold/40 sm:col-span-2 sm:py-[1.15rem] sm:text-base"
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? "Enviando..."
                : verificandoCedula
                  ? "Verificando cédula..."
                  : "Enviar solicitud de sacramento"}
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
