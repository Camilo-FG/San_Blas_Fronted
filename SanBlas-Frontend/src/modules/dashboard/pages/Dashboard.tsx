import { useState } from "react";
import "./Dashboard.css";

const modules = [
  {
    id: "principal",
    label: "Dashboard principal",
    short: "DP",
  },
  {
    id: "gestion-sacramentos",
    label: "Gestión de sacramentos",
    short: "GS",
  },
  {
    id: "solicitudes-sacramentos",
    label: "Solicitudes de sacramentos",
    short: "SS",
  },
  {
    id: "solicitudes-catequesis",
    label: "Solicitudes de catequesis",
    short: "SC",
  },
  {
    id: "donaciones",
    label: "Donaciones",
    short: "DO",
  },
  {
    id: "eventos",
    label: "Eventos",
    short: "EV",
  },
  {
    id: "usuarios",
    label: "Gestión de usuarios",
    short: "GU",
  },
];

function Dashboard() {
  const [activeModule, setActiveModule] = useState("principal");

  const currentModule = modules.find((module) => module.id === activeModule);

  return (
    <section className="dashboard">
      <aside className="dashboard__sidebar">
        <div className="dashboard__brand">
          <h2>Panel Administrativo</h2>
          <p>Parroquia San Blas</p>
        </div>

        <nav className="dashboard__menu">
          {modules.map((module) => (
            <button
              key={module.id}
              className={`dashboard__menu-item ${activeModule === module.id ? "dashboard__menu-item--active" : ""
                }`}
              onClick={() => setActiveModule(module.id)}
            >
              <span className="dashboard__menu-icon">{module.short}</span>
              <span>{module.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard__content">
        <div className="dashboard__header">
          <div>
            <h1>{currentModule?.label}</h1>
            <p>
              Administra la información correspondiente a este módulo de la
              Parroquia San Blas.
            </p>
          </div>
        </div>

        {activeModule === "principal" ? (
          <div className="dashboard__cards">
            <article className="dashboard__card">
              <span className="dashboard__card-icon">SC</span>
              <p>Solicitudes de catequesis</p>
              <h3>0</h3>
            </article>

            <article className="dashboard__card">
              <span className="dashboard__card-icon">SS</span>
              <p>Solicitudes de sacramentos</p>
              <h3>0</h3>
            </article>

            <article className="dashboard__card">
              <span className="dashboard__card-icon">DO</span>
              <p>Donaciones registradas</p>
              <h3>0</h3>
            </article>

            <article className="dashboard__card">
              <span className="dashboard__card-icon">GU</span>
              <p>Usuarios registrados</p>
              <h3>0 XD JAJAJ</h3>
            </article>
          </div>
        ) : (
          <div className="dashboard__placeholder">
            <h2>Módulo en preparación</h2>
            <p>
              Aquí se mostrará la información de{" "}
              <strong>{currentModule?.label}</strong>. Más adelante puedes
              agregar tablas, formularios y operaciones CRUD.
            </p>
          </div>
        )}
      </main>
    </section>
  );
}

export default Dashboard;