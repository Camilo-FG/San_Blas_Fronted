import React, { useRef } from "react";
import DonacionInfo from "../components/DonacionInfo";
import DonacionForm from "../components/DonacionForm";

function Donaciones() {
  const formRef = useRef<HTMLDivElement>(null);

  const handleDonarInsumos = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="donaciones__content">
          <DonacionInfo
            sinpe="8888-1234"
            cuentaBancaria="CR67015100012345678901"
            banco="Banco Nacional"
            onDonarInsumos={handleDonarInsumos}
          />

          <div
            ref={formRef}
            className="mt-12 scroll-mt-20 pb-16"
          >
            <h3 className="mb-6 text-center text-xl font-bold text-royal-blue">
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
