import { ImageOff } from "lucide-react";

interface ServiciosPreviewProps {
  eyebrow: string;
  title: string;
  intro: string;
  items: Array<{
    titulo: string;
    descripcion: string;
    categoria: string;
    boton: string;
    imagen: string;
  }>;
  ampliadas?: boolean;
}

// miniatura del carrusel de servicios pa la vista previa del editor
export function ServiciosPreview({
  eyebrow,
  title,
  intro,
  items,
  ampliadas = false,
}: ServiciosPreviewProps) {
  const visibles = items.filter((item) => item.titulo.trim());

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto bg-surface ${
        ampliadas ? "p-8" : "p-5"
      }`}
    >
      <div className="mx-auto mb-6 max-w-[620px] text-center">
        <span className="mb-2 block text-[10px] font-extrabold tracking-[0.25em] text-[#b7832f] uppercase">
          {eyebrow || "Etiqueta"}
        </span>
        <h2 className="m-0 font-heading text-2xl leading-tight text-royal-blue">
          {title || "Título"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {intro || "La introducción aparecerá aquí."}
        </p>
      </div>

      {visibles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-text-muted">
          <ImageOff size={28} aria-hidden="true" />
          <p className="m-0 text-sm">Agregue al menos un servicio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((item, index) => (
            <article
              key={`${item.titulo}-${index}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-[rgba(120,82,30,0.08)] bg-[#fcfbf7]"
            >
              <div className="relative h-32 overflow-hidden bg-slate-100">
                {item.imagen.trim() ? (
                  <img
                    src={item.imagen}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-text-muted">
                    <ImageOff size={22} aria-hidden="true" />
                  </div>
                )}
                {item.categoria.trim() && (
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.08em] text-[#73522f] uppercase">
                    {item.categoria}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="m-0 font-serif text-sm leading-tight text-gray-900">
                  {item.titulo}
                </h3>
                <p className="m-0 text-xs leading-relaxed text-text-secondary">
                  {item.descripcion || "La descripción aparecerá aquí."}
                </p>
                <span className="mt-auto inline-flex items-center justify-center rounded-[10px] bg-[rgba(23,37,84,0.08)] px-3 py-2 text-[10px] font-extrabold tracking-[0.12em] text-[#172554] uppercase">
                  {item.boton || "Ver más"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiciosPreview;
