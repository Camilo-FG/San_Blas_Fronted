import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import ReCAPTCHA from 'react-google-recaptcha';
import "./FormSolic.css";
import { useCreateSolicSacramento } from "../hooks/useCreateSacramento";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";
import { ApiError } from "../../../services/apiClient";

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

const requerido = (valor: string, mensaje: string) =>
  valor.trim() ? undefined : mensaje;

const FormSolic = () => {
  const { mutateAsync, isPending } = useCreateSolicSacramento();
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const { captchaRef, captchaToken, handleCaptchaChange, handleCaptchaExpired, resetCaptcha } = useCaptcha();

  const form = useForm({
    defaultValues: {
      Nombre: '',
      PrimerApellido: '',
      SegundoApellido: '',
      Cedula: '',
      Correo: '',
      Telefono: '',
      TipoSacramento: '',
      Motivo: '',
    },
    onSubmit: async ({ value }: any) => {
      if (!captchaToken) {
        setCaptchaError('Por favor completá el reCAPTCHA.');
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
        const mensaje = error instanceof ApiError
          ? error.errores
            ? Object.values(error.errores).flat().filter(Boolean).join(" ") || error.message
            : error.message
          : 'No se pudo enviar la solicitud. Intente nuevamente.';
        setErrorEnvio(mensaje);
      }
    },
  });

  const handleHacerOtraSolicitud = () => {
    form.reset();
    setCaptchaError(null);
    setErrorEnvio(null);
    resetCaptcha();
    setEnviado(false);
  };

  return (
    <div className="form-solic">
      {enviado ? (
        <div className="form-solic__success">
          <div className="form-solic__success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h3>¡Solicitud enviada con éxito!</h3>
          <p>
            Recibimos tu solicitud de sacramento. En breve se revisará y te contactaremos.
          </p>

          <button type="button" className="form-solic__retry" onClick={handleHacerOtraSolicitud}>
            Hacer otra solicitud
          </button>
        </div>
      ) : (
        <>
          <div className="form-solic__header">
            <p className="form-solic__eyebrow">Solicitud pastoral</p>
            <h2>Formulario de Sacramento</h2>
            <p className="form-solic__description">
              Completa los datos para registrar una nueva solicitud.
            </p>
          </div>

          <form
            className="form-solic__form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="form-solic__field">
              <form.Field
                name="Nombre"
                validators={{
                  onBlur: ({ value }) => requerido(value, "El nombre es obligatorio."),
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Nombre</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: Juan"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field">
              <form.Field
                name="PrimerApellido"
                validators={{
                  onBlur: ({ value }) => requerido(value, "El primer apellido es obligatorio."),
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Primer apellido</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: Pérez"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field">
              <form.Field
                name="SegundoApellido"
                validators={{
                  onBlur: ({ value }) => requerido(value, "El segundo apellido es obligatorio."),
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Segundo apellido</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Ej: González"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field">
              <form.Field
                name="Cedula"
                validators={{
                  onBlur: ({ value }) => {
                    const cedula = soloDigitos(value);
                    if (!cedula) return "La cédula es obligatoria.";
                    if (cedula.length !== 9) return "La cédula debe tener 9 dígitos.";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Cédula</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 123456789"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field">
              <form.Field
                name="Correo"
                validators={{
                  onBlur: ({ value }) => {
                    const correo = value.trim();
                    if (!correo) return "El correo es obligatorio.";
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                      return "Ingresá un correo válido.";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Correo</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="Ej: nombre@correo.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field">
              <form.Field
                name="Telefono"
                validators={{
                  onBlur: ({ value }) => {
                    const telefono = soloDigitos(value);
                    if (!telefono) return "El teléfono es obligatorio.";
                    if (telefono.length !== 8) return "El teléfono debe tener 8 dígitos.";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Teléfono</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      inputMode="numeric"
                      placeholder="Ej: 88888888"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field">
              <form.Field
                name="TipoSacramento"
                validators={{
                  onBlur: ({ value }) =>
                    value ? undefined : "Seleccioná el tipo de sacramento.",
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Tipo de sacramento</label>
                    <select
                      value={field.state.value}
                      name={field.name}
                      id={field.name}
                      className="form-solic__input"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Seleccione un sacramento</option>
                      <option value="Bautismo">Bautismo</option>
                      <option value="Confirmación">Confirmación</option>
                      <option value="Matrimonio">Matrimonio</option>
                    </select>
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field form-solic__field--full">
              <form.Field
                name="Motivo"
                validators={{
                  onBlur: ({ value }) => requerido(value, "Indicá el motivo de la solicitud."),
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name}>Motivo</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Describe brevemente el motivo"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="form-solic__input"
                    />
                    {field.state.meta.errors[0] && (
                      <span className="form-solic__error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            <div className="form-solic__field form-solic__field--full form-solic__captcha">
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
              {captchaError && <span className="form-solic__error">⚠ {captchaError}</span>}
            </div>

            <button className="form-solic__submit" type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
            {errorEnvio && <p className="form-solic__error">{errorEnvio}</p>}
          </form>
        </>
      )}
    </div>
  );
};

export default FormSolic;
