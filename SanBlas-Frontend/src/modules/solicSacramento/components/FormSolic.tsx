import { useForm } from "@tanstack/react-form";
import { useCreateSolicSacramento } from "../Api/useCreateSacramento";
import "./FormSolic.css";

const FormSolic = () => {
  const { mutate, isPending } = useCreateSolicSacramento();

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
      // El estado no lo elige el usuario; inicia siempre pendiente.
      mutate({ ...value, Estado: 'Pendiente' });
    },
 
  });

 

  return (
    <div className="form-solic">
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

        <button className="form-solic__submit" type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default FormSolic;