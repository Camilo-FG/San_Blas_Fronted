import { ImageOff } from "lucide-react";
import { claseResaltePreview } from "./previewResalte";

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
  campoResaltado?: string | null;
}

// miniatura del carrusel de servicios pa la vista previa del editor
export function ServiciosPreview({
  eyebrow,
  title,
  intro,
  items,
  ampliadas = false,
  campoResaltado = null,
}: ServiciosPreviewProps) {
  const visibles = items
    .map((item, index) => ({ ...item, n: index + 1 }))
    .filter((item) => {
      const marcado = campoResaltado
        ? new RegExp(`^servicio${item.n}(?!\\d)`).test(campoResaltado)
        : false;
      return marcado || item.titulo.trim();
    });

  return (
    <div
      data-preview-scroll
      className={`flex h-full flex-col overflow-y-auto bg-surface ${
        ampliadas ? "p-8" : "p-5"
      }`}
    >
      <div className="mx-auto mb-6 max-w-[620px] text-center">
        <span
          data-campo-preview="eyebrow"
          className={`mb-2 block text-[10px] font-extrabold tracking-[0.25em] text-[#b7832f] uppercase ${claseResaltePreview(campoResaltado === "eyebrow")}`}
        >
          {eyebrow || "Etiqueta"}
        </span>
        <h2
          data-campo-preview="title"
          className={`m-0 font-heading text-2xl leading-tight text-royal-blue ${claseResaltePreview(campoResaltado === "title")}`}
        >
          {title || "Título"}
        </h2>
        <p
          data-campo-preview="intro"
          className={`mt-2 text-sm leading-relaxed text-text-secondary ${claseResaltePreview(campoResaltado === "intro")}`}
        >
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
          {visibles.map((item) => {
            const titulo = `servicio${item.n}Titulo`;
            const descripcion = `servicio${item.n}Descripcion`;
            const categoria = `servicio${item.n}Categoria`;
            const boton = `servicio${item.n}Boton`;
            const enlace = `servicio${item.n}Enlace`;
            return (
            <article
              key={`${item.titulo}-${item.n}`}
              data-campo-preview={enlace}
              className={`flex flex-col rounded-2xl border border-[rgba(120,82,30,0.08)] bg-[#fcfbf7] ${claseResaltePreview(campoResaltado === enlace)}`}
            >
              <div className="relative h-32 overflow-hidden rounded-t-2xl bg-slate-100">
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
                {(item.categoria.trim() || campoResaltado === categoria) && (
                  <span
                    data-campo-preview={categoria}
                    className={`absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.08em] text-[#73522f] uppercase ${claseResaltePreview(campoResaltado === categoria)}`}
                  >
                    {item.categoria || "Categoría"}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3
                  data-campo-preview={titulo}
                  className={`m-0 font-serif text-sm leading-tight text-gray-900 ${claseResaltePreview(campoResaltado === titulo)}`}
                >
                  {item.titulo || "Título del servicio"}
                </h3>
                <p
                  data-campo-preview={descripcion}
                  className={`m-0 text-xs leading-relaxed text-text-secondary ${claseResaltePreview(campoResaltado === descripcion)}`}
                >
                  {item.descripcion || "La descripción aparecerá aquí."}
                </p>
                <span
                  data-campo-preview={boton}
                  className={`mt-auto inline-flex items-center justify-center rounded-[10px] bg-[rgba(23,37,84,0.08)] px-3 py-2 text-[10px] font-extrabold tracking-[0.12em] text-[#172554] uppercase ${claseResaltePreview(campoResaltado === boton)}`}
                >
                  {item.boton || "Ver más"}
                </span>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ServiciosPreview;
