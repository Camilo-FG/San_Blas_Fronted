import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import ReCAPTCHA from 'react-google-recaptcha';
import "./FormSolic.css";
import { useCreateSolicSacramento } from "../hooks/useCreateSacramento";
import { useCaptcha } from "../../../shared/hooks/useCaptcha";

const FormSolic = () => {
  const { mutateAsync, isPending } = useCreateSolicSacramento();
  const [enviado, setEnviado] = useState(false);
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

      await mutateAsync({ ...value, Estado: 'Pendiente' });
      form.reset();
      setCaptchaError(null);
      resetCaptcha();
      setEnviado(true);
    },
 
  });

  const handleHacerOtraSolicitud = () => {
    form.reset();
    setCaptchaError(null);
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
            children={(field) => (
              <>
                <label htmlFor={field.name}>Nombre</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej: Juan"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
        </div>

        <div className="form-solic__field">
          <form.Field
            name="PrimerApellido"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Primer apellido</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej: Pérez"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
        </div>

        <div className="form-solic__field">
          <form.Field
            name="SegundoApellido"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Segundo apellido</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej: González"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
        </div>

        <div className="form-solic__field">
          <form.Field
            name="Cedula"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Cédula</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej: 001-000000-0000A"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
        </div>

        <div className="form-solic__field">
          <form.Field
            name="Correo"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Correo</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Ej: nombre@correo.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
        </div>

        <div className="form-solic__field">
          <form.Field
            name="Telefono"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Teléfono</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  placeholder="Ej: 8888-8888"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
        </div>

        <div className="form-solic__field">
          <form.Field
            name="TipoSacramento"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Tipo de sacramento</label>
                <select
                  value={field.state.value}
                  name={field.name}
                  id={field.name}
                  className="form-solic__input"
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">Seleccione un sacramento</option>
                  <option value="Bautismo">Bautismo</option>
                  <option value="Confirmación">Confirmación</option>
                  <option value="Matrimonio">Matrimonio</option>
                </select>
              </>
            )}
          />
        </div>

        <div className="form-solic__field form-solic__field--full">
          <form.Field
            name="Motivo"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Motivo</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Describe brevemente el motivo"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-solic__input"
                />
              </>
            )}
          />
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
      </form>
        </>
      )}
    </div>
  );
};

export default FormSolic;