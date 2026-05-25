import "./Dashboard.css";

function DashboardHome() {
  return (
    <div className="dashboard__cards">
      <article className="dashboard__card">
        <span className="dashboard__card-icon">SC</span>
        <p>Solicitudes de catequesis</p>
        <h3>0</h3>
      </article>

      <article className="dashboard__card">
        <span className="dashboard__card-icon">SS</span>
        <p>Solicitudes de constancia de sacramento</p>
        <h3>0</h3>
      </article>

      <article className="dashboard__card">
        <span className="dashboard__card-icon">RS</span>
        <p>Registros de sacramentos</p>
        <h3>0</h3>
      </article>

      <article className="dashboard__card">
        <span className="dashboard__card-icon">DO</span>
        <p>Donaciones registradas</p>
        <h3>0</h3>
      </article>

      <article className="dashboard__card">
        <span className="dashboard__card-icon">EV</span>
        <p>Eventos registrados</p>
        <h3>0</h3>
      </article>

      <article className="dashboard__card">
        <span className="dashboard__card-icon">GU</span>
        <p>Usuarios registrados</p>
        <h3>0</h3>
      </article>
    </div>
  );
}

export default DashboardHome;
