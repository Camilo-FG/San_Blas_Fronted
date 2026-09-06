import DonacionInfo from "../components/DonacionInfo";
import DonacionForm from "../components/DonacionForm";

function Donaciones() {
  const handleDonarInsumos = () => {
    document.getElementById("insumos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full bg-white pb-12 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-14">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <DonacionInfo
          sinpe="8888-1234"
          cuentaBancaria="CR67015100012345678901"
          banco="Banco Nacional"
          onDonarInsumos={handleDonarInsumos}
        />

        <div className="mt-16 sm:mt-20 lg:mt-24">
          <DonacionForm />
        </div>
      </div>
    </section>
  );
}

export default Donaciones;
