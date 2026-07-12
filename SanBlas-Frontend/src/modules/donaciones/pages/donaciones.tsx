import { useRef } from "react";
import DonacionInfo from "../components/DonacionInfo";
import DonacionForm from "../components/DonacionForm";

function Donaciones() {
  const formRef = useRef<HTMLDivElement>(null);

  const handleDonarInsumos = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <DonacionInfo
          sinpe="8888-1234"
          cuentaBancaria="CR67015100012345678901"
          banco="Banco Nacional"
          onDonarInsumos={handleDonarInsumos}
        />

        <div ref={formRef} className="mt-16 sm:mt-20 lg:mt-24">
          <DonacionForm />
        </div>
      </div>
    </section>
  );
}

export default Donaciones;
