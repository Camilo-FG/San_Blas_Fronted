import { useSearch } from "@tanstack/react-router";
import FormSolic from "../components/FormSolic";
import "./solicSacramento.css";

const SolicSacramento = () => {
  const { accessDenied } = useSearch({ strict: false }) as {
    accessDenied?: "admin";
  };

  return (
    <section className="solic-sacramento">
      {accessDenied === "admin" && (
        <div className="solic-sacramento__alert" role="alert">
          <strong>Acceso restringido.</strong> El panel administrativo solo está
          disponible para cuentas con rol de administrador. Si necesita acceso,
          contacte a la parroquia.
        </div>
      )}

      <div className="solic-sacramento__header">
        <div>
          <p className="solic-sacramento__eyebrow">
            Solicitudes de sacramentos
          </p>
          <h1>Registro de solicitud</h1>
          <p>Completa el formulario para gestionar una nueva solicitud</p>
        </div>

        <div className="solic-sacramento__badge">
          <span>SS</span>
          <div>
            <strong>Panel San Blas</strong>
            <p>Formulario de atención</p>
          </div>
        </div>
      </div>

      <FormSolic />
    </section>
  );
};

export default SolicSacramento;
