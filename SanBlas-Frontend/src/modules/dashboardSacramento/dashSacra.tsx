import { useState } from 'react';
import './dashSacra.css';
import '../dashboard/pages/Dashboard.css';
import TableSacramentos from './TableSacramentos';

const dashSacra = () => {
  const [activeModule] = useState('solicitudes-sacramentos');

  return (
    <section className="dashboard">
     

      <main className="dashboard__content">
        <div className="dashboard__header">
          <div>
            <h1>Solicitudes de sacramentos</h1>
            <p>Administra las solicitudes recibidas desde el formulario público.</p>
          </div>
        </div>
       
        <div className="dashboard__panel">
          <TableSacramentos />
        </div>
      </main>
    </section>
  )
}

export default dashSacra
