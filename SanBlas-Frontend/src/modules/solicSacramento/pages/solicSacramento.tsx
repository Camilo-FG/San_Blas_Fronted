import FormSolic from "../components/FormSolic";
import "./solicSacramento.css";

const SolicSacramento = () => {
  return (
    <section className="solic-sacramento">
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

      <div className="solic-sacramento__layout">
        <main className="solic-sacramento__content">
          <div className="solic-sacramento__panel">
            <div className="solic-sacramento__panel-header">
              <div>
                <p className="solic-sacramento__card-label">Formulario</p>
                <h2>Solicitud de sacramento</h2>
              </div>
            </div>

            <FormSolic />
          </div>
        </main>
      </div>
    </section>
  );
};

export default SolicSacramento;
