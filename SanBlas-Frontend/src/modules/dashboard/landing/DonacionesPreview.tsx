import { Copy, Heart, Landmark, Package, Smartphone } from "lucide-react";
import { claseResaltePreview } from "./previewResalte";

interface DonacionesPreviewProps {
  title: string;
  intro: string;
  sinpe: string;
  cuentaBancaria: string;
  banco: string;
  ampliadas?: boolean;
  campoResaltado?: string | null;
}

// miniatura de la página de donaciones pa la vista previa del editor
export function DonacionesPreview({
  title,
  intro,
  sinpe,
  cuentaBancaria,
  banco,
  ampliadas = false,
  campoResaltado = null,
}: DonacionesPreviewProps) {
  const metodos = [
    {
      id: "sinpe",
      campoValor: "sinpe",
      campoNota: null as string | null,
      label: "SINPE Móvil",
      icon: Smartphone,
      note: "Ideal para montos pequeños",
      value: sinpe || "SINPE",
    },
    {
      id: "banco",
      campoValor: "cuentaBancaria",
      campoNota: "banco",
      label: "Cuenta Bancaria",
      icon: Landmark,
      note: `Para montos mayores${banco ? ` — ${banco}` : ""}`,
      value: cuentaBancaria || "Cuenta bancaria",
    },
  ];

  return (
    <div
      data-preview-scroll
      className={`flex h-full flex-col overflow-y-auto bg-white ${
        ampliadas ? "p-8" : "p-5"
      }`}
    >
      <div
        className="relative mb-6 overflow-hidden rounded-[1.5rem] bg-royal-blue px-6 py-6 text-center"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-royal-gold/50 text-royal-gold">
          <Heart className="size-5 fill-royal-gold" aria-hidden="true" />
        </span>
        <h2
          data-campo-preview="title"
          className={`m-0 font-heading text-xl font-bold text-royal-gold ${claseResaltePreview(campoResaltado === "title", "oscuro")}`}
        >
          {title || "Título"}
        </h2>
        <p
          data-campo-preview="intro"
          className={`mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/90 ${claseResaltePreview(campoResaltado === "intro", "oscuro")}`}
        >
          {intro || "La introducción aparecerá aquí."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {metodos.map((metodo) => {
          const Icon = metodo.icon;
          return (
            <div
              key={metodo.id}
              className="flex flex-col gap-4 rounded-[1.25rem] border border-royal-gold/30 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-royal-blue text-royal-gold">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="m-0 font-heading text-base font-bold text-royal-blue">
                    {metodo.label}
                  </h3>
                  <p
                    data-campo-preview={metodo.campoNota ?? undefined}
                    className={`m-0 mt-0.5 text-xs text-text-muted ${claseResaltePreview(Boolean(metodo.campoNota) && campoResaltado === metodo.campoNota)}`}
                  >
                    {metodo.note}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted/80 px-4 py-3">
                <span
                  data-campo-preview={metodo.campoValor}
                  className={`min-w-0 flex-1 truncate font-mono text-sm font-bold text-royal-blue ${claseResaltePreview(campoResaltado === metodo.campoValor)}`}
                >
                  {metodo.value}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-royal-blue px-3 py-1.5 text-xs font-semibold text-white">
                  <Copy className="size-3.5" aria-hidden="true" />
                  Copiar
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-royal-gold/50 bg-white px-6 py-3 text-sm font-semibold text-royal-blue">
          <Package className="size-4 text-royal-gold" aria-hidden="true" />
          ¿Prefieres donar Insumos?
        </span>
      </div>
    </div>
  );
}

export default DonacionesPreview;
