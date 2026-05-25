import React, { useRef } from "react";
import DonacionInfo from "../components/DonacionInfo";
import DonacionForm from "../components/DonacionForm";

function Donaciones() {
  // Creamos la referencia para el formulario
  const formRef = useRef<HTMLDivElement>(null);

  // Esta función ahora hace que la página baje suavemente
  const handleDonarInsumos = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="donaciones">
      <div className="donaciones__container">
        <div className="donaciones__header">
          {/* Tu cabecera actual */}
        </div>

        <div className="donaciones__content">
          {/* Parte informativa de arriba */}
          <DonacionInfo 
            sinpe="8888-1234" 
            cuentaBancaria="CR67015100012345678901" 
            banco="Banco Nacional" 
            onDonarInsumos={handleDonarInsumos} 
          />

          {/* Formulario abajo del todo, con el estilo del museo */}
          {/* Le añadimos scrollMarginTop por si tienes un menú fijo arriba, que no tape el título al bajar */}
          <div ref={formRef} style={{ marginTop: '50px', paddingBottom: '60px', scrollMarginTop: '80px' }}>
            <h3 style={{
                color: '#003366',
                textAlign: 'center',
                marginBottom: '24px',
                fontSize: '1.2rem',
                fontWeight: 'bold'
            }}>
                Donación de Insumos
            </h3>
            <DonacionForm />
          </div>

        </div>
      </div>
    </section>
  );
}

export default Donaciones;