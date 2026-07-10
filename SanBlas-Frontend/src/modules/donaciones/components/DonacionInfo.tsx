import React from "react";
import { Button } from "../../../shared/ui";

interface Props {
  sinpe: string;
  cuentaBancaria: string;
  banco: string;
  onDonarInsumos: () => void;
}

export default function DonacionInfo({
  sinpe,
  cuentaBancaria,
  banco,
  onDonarInsumos,
}: Props): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[800px] px-4">
      <div className="mb-6 rounded-2xl bg-royal-blue px-5 py-7 text-center sm:px-10 sm:py-10">
        <h2 className="m-0 mb-3 text-[1.6rem] text-royal-gold sm:text-[2rem]">
          ✝ Apoya a Nuestra Parroquia.
        </h2>
        <p className="m-0 text-base leading-relaxed text-white/90">
          Tu generosidad nos permite continuar con nuestra misión. Puedes realizar
          tu donación económica mediante los siguientes medios en el siguiente apartado:
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <div className="rounded-[14px] border-2 border-royal-gold bg-surface p-5 shadow-[0_4px_12px_rgba(0,51,102,0.08)] sm:p-7">
          <div className="mb-4 inline-block rounded-lg bg-royal-blue px-3.5 py-2">
            <span className="text-sm font-bold text-royal-gold">SINPE MÓVIL</span>
          </div>
          <p className="m-0 mb-2 text-sm text-text">Para montos pequeños</p>
          <p className="m-0 text-[1.8rem] font-bold tracking-wide break-all text-royal-blue">
            {sinpe}
          </p>
        </div>

        <div className="rounded-[14px] border-2 border-royal-gold bg-surface p-5 shadow-[0_4px_12px_rgba(0,51,102,0.08)] sm:p-7">
          <div className="mb-4 inline-block rounded-lg bg-royal-blue px-3.5 py-2">
            <span className="text-sm font-bold text-royal-gold">CUENTA BANCARIA</span>
          </div>
          <p className="m-0 mb-2 text-sm text-text">
            Para montos mayores — {banco}
          </p>
          <p className="m-0 text-xl font-bold tracking-wide break-all text-royal-blue">
            {cuentaBancaria}
          </p>
        </div>
      </div>

      <Button
        onClick={onDonarInsumos}
        className="w-full bg-royal-gold px-10 py-4 text-base font-bold tracking-wide text-royal-blue shadow-[0_4px_12px_rgba(212,175,55,0.3)] hover:opacity-85"
      >
        Donar Insumos
      </Button>
    </div>
  );
}
