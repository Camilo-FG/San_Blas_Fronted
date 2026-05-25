import React from "react";
import DonacionInfo from "../components/DonacionInfo";


function Donaciones() {
  // Función temporal para el botón de insumos (se programará en otra tarea)
  const handleDonarInsumos = () => {
    console.log("Click en donar insumos");
  };

  return (
    <section className="donaciones">
      <div className="donaciones__container">
        <div className="donaciones__header">
     </div>

        <div className="donaciones__content">
          <DonacionInfo 
            sinpe="8888-1234" 
            cuentaBancaria="CR67015100012345678901" 
            banco="Banco Nacional" 
            onDonarInsumos={handleDonarInsumos} 
          />
        </div>
      </div>
    </section>
  );
}

export default Donaciones;