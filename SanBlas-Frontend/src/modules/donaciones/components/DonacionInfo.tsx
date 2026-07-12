import { useState } from "react";
import { Smartphone, Landmark, Copy, Check, Heart, Package } from "lucide-react";

type Method = {
  id: string;
  label: string;
  icon: typeof Smartphone;
  note: string;
  value: string;
  copyValue: string;
  compactValue?: boolean;
};

interface Props {
  sinpe: string;
  cuentaBancaria: string;
  banco: string;
  onDonarInsumos: () => void;
}

function PaymentCard({ method }: { method: Method }) {
  const [copied, setCopied] = useState(false);
  const Icon = method.icon;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(method.copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group flex h-full flex-col rounded-[1.35rem] border border-royal-gold/30 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(15,23,42,0.1)] sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-royal-blue text-royal-gold sm:size-[3.25rem]">
          <Icon className="size-5 sm:size-[1.35rem]" aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="font-heading text-[1.15rem] font-bold leading-tight text-royal-blue sm:text-xl">
            {method.label}
          </h3>
          <p className="mt-1 text-[0.9rem] leading-relaxed text-text-muted">
            {method.note}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
        <span
          className={
            method.compactValue
              ? "break-all font-mono text-[0.95rem] font-bold leading-snug tracking-tight text-royal-blue sm:text-base"
              : "font-mono text-xl font-bold tracking-tight text-royal-blue sm:text-2xl"
          }
        >
          {method.value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-royal-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal-blue/90 sm:w-auto"
          aria-label={`Copiar ${method.label}`}
        >
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden="true" />
              Copiar
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DonacionInfo({
  sinpe,
  cuentaBancaria,
  banco,
  onDonarInsumos,
}: Props) {
  const methods: Method[] = [
    {
      id: "sinpe",
      label: "SINPE Móvil",
      icon: Smartphone,
      note: "Ideal para montos pequeños",
      value: sinpe,
      copyValue: sinpe.replace(/\D/g, ""),
    },
    {
      id: "banco",
      label: "Cuenta Bancaria",
      icon: Landmark,
      note: `Para montos mayores — ${banco}`,
      value: cuentaBancaria,
      copyValue: cuentaBancaria,
      compactValue: true,
    },
  ];

  return (
    <section>
      <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
        <div
          className="relative w-full overflow-hidden rounded-[1.75rem] bg-royal-blue px-7 py-9 sm:px-12 sm:py-11"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-royal-gold/50 bg-royal-blue text-royal-gold sm:mb-6 sm:size-16">
            <Heart className="size-7 fill-royal-gold sm:size-8" aria-hidden="true" />
          </span>

          <h2 className="font-heading text-[clamp(1.75rem,4vw,2.35rem)] font-bold leading-tight text-royal-gold">
            Apoya a Nuestra Parroquia
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-[1.75] text-white/90 sm:text-base">
            Tu generosidad nos permite continuar con nuestra misión. Puedes
            realizar tu donación económica mediante los siguientes medios.
          </p>
        </div>
      </div>

      <h3 className="mb-7 text-center font-heading text-[clamp(1.35rem,3vw,1.65rem)] font-bold text-royal-blue sm:mb-8">
        Donación económica
      </h3>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7">
        {methods.map((method) => (
          <PaymentCard key={method.id} method={method} />
        ))}
      </div>

      <div className="mt-10 flex justify-center sm:mt-12">
        <button
          type="button"
          onClick={onDonarInsumos}
          className="inline-flex items-center gap-2.5 rounded-full border border-royal-gold/50 bg-white px-7 py-3.5 text-[0.95rem] font-semibold text-royal-blue transition-all hover:border-royal-gold hover:bg-surface-muted/40"
        >
          <Package className="size-[1.1rem] text-royal-gold" aria-hidden="true" />
          ¿Prefieres donar Insumos?
        </button>
      </div>
    </section>
  );
}
