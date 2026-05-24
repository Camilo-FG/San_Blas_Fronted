import { useForm } from "@tanstack/react-form";
import { useCreateSolicSacramento } from "../Api/useCreateSacramento";
import { useGetSolicitudes } from "../Api/useGetSolicitudes";
import { FormSacramento } from "src/types/formSacramento";

const FormSolic = () => {

  const { data: solicitudes = [], isLoading } = useGetSolicitudes();

 
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
      // Usar la mutación ya creada arriba
      mutate(value);
    },
 
  });

  if (isLoading) return <div>Cargando solicitudes...</div>;

  return (
    <div>
      <h2>Formulario de Sacramento</h2>

      {/* ✅ Select con nombre correcto */}
      <select>
        <option value="0">Seleccione una solicitud</option>
        {solicitudes.map((solic: FormSacramento) => (
          <option key={solic.id} value={solic.id}>
            {solic.Nombre}
          </option>
        ))}
      </select>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div>
          <form.Field
            name="Nombre"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Nombre:</label> {/* ✅ Corregido */}
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="PrimerApellido"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Primer Apellido:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="SegundoApellido"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Segundo Apellido:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="Cedula"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Cédula:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="Correo"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Correo:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="Telefono"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Teléfono:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="TipoSacramento"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Tipo de Sacramento:</label>
                <select
                  value={field.state.value}
                  name={field.name}
                  id={field.name}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">Seleccione un sacramento</option>
                  <option value="Bautismo">Bautismo</option>       {/* ✅ valor descriptivo */}
                  <option value="Confirmación">Confirmación</option>
                  <option value="Matrimonio">Matrimonio</option>
                </select>
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="Motivo"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Motivo:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>

        {/* ✅ Muestra estado de carga al guardar */}
        <button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default FormSolic;