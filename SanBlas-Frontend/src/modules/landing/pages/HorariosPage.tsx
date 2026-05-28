import React from 'react';

function HorariosPage() {
  return (
    <div className="horarios-page" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Horarios Parroquiales</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '30px' }}>
        Consulte nuestros horarios de misas, confesiones y atención en la Oficina Parroquial San Blas.
      </p>
      
      <div style={{ textAlign: 'left', marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#2980b9' }}>Horario de Misas (Entre Semana)</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Lunes a Jueves:</strong> 6:00 p.m.</li>
          <li><strong>Viernes:</strong> 6:00 p.m.</li>
        </ul>

        <h2 style={{ color: '#2980b9', marginTop: '20px' }}>Horario de Misas (Fines de Semana)</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Sábados:</strong> 4:00 p.m. y 6:00 p.m.</li>
          <li><strong>Domingos:</strong> 7:00 a.m. - 9:00 a.m. - 4:00 p.m. - 6:00 p.m.</li>
        </ul>

        <h2 style={{ color: '#2980b9', marginTop: '20px' }}>Horarios de Confesiones</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Jueves:</strong> Durante la Hora Santa (Después de la misa de 6:00 p.m.).</li>
          <li><strong>Viernes:</strong> 4:00 p.m. a 5:30 p.m.</li>
        </ul>

        <h2 style={{ color: '#2980b9', marginTop: '20px' }}>Atención en Oficina Parroquial</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Lunes a Viernes:</strong> 8:00 a.m. a 12:00 m.d. y 1:30 p.m. a 5:00 p.m.</li>
          <li><strong>Sábados:</strong> 8:00 a.m. a 12:00 m.d. (Cerrado por la tarde). </li>
        </ul>
      </div>
    </div>
  );
}

export default HorariosPage;
