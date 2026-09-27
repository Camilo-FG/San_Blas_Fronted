import { dividirFilaHorario } from "./landingSectionConfig";
import { claseResaltePreview } from "./previewResalte";

interface HorariosPreviewProps {
  title: string;
  subtitle: string;
  titleHighlight: string;
  intro: string;
  imageUrl: string;
  bloques: Array<{ titulo: string; filas: string }>;
  ampliadas?: boolean;
  campoResaltado?: string | null;
}

// miniatura del volante pa la vista previa del editor (lee los mismos campos del formulario)
export function HorariosPreview({
  title,
  subtitle,
  titleHighlight,
  intro,
  imageUrl,
  bloques,
  ampliadas = false,
  campoResaltado = null,
}: HorariosPreviewProps) {
  const lista = bloques
    .map((bloque, index) => {
      const n = index + 1;
      return {
        n,
        titulo: bloque.titulo.trim(),
        filas: bloque.filas
          .split("\n")
          .map((linea) => linea.trim())
          .filter(Boolean)
          .map((linea) => dividirFilaHorario(linea))
          .filter((fila) => fila !== null),
      };
    })
    .filter((bloque) => {
      const marcado =
        campoResaltado === `bloque${bloque.n}Titulo` ||
        campoResaltado === `bloque${bloque.n}Filas`;
      return marcado || bloque.titulo || bloque.filas.length > 0;
    })
    .slice(0, 4);
  // misma imagen que la página (la del formulario o la por defecto)
  const fondo = imageUrl.trim() || "/horarios-fondo.jpg";

  return (
    <div
      data-preview-scroll
      className={`flex h-full flex-col overflow-y-auto bg-[#f7f1e3] ${
        ampliadas ? "p-6" : "p-4"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-[#e7dcc3] bg-[#fffdf7] shadow-sm">
        <div
          className="relative px-4 pt-6 pb-5 text-center"
          style={{
            backgroundImage: `url(${fondo})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-[#fffdf7]/75" />
          <div className="relative">
            <p
              data-campo-preview="title"
              className={`m-0 font-heading text-3xl font-extrabold text-royal-blue ${claseResaltePreview(campoResaltado === "title")}`}
            >
              {title || "Horarios"}
            </p>
            <p className="m-0 mt-0.5 font-heading text-lg font-bold text-royal-blue">
              <span
                data-campo-preview="subtitle"
                className={claseResaltePreview(campoResaltado === "subtitle")}
              >
                {subtitle || "Subtítulo"}
              </span>{" "}
              <span
                data-campo-preview="titleHighlight"
                className={`text-2xl text-royal-gold italic ${claseResaltePreview(campoResaltado === "titleHighlight")}`}
              >
                {titleHighlight || "Misa"}
              </span>
            </p>
            {intro || campoResaltado === "intro" ? (
              <p
                data-campo-preview="intro"
                className={`mx-auto mt-2 max-w-sm text-xs leading-relaxed text-text-muted ${claseResaltePreview(campoResaltado === "intro")}`}
              >
                {intro || "La introducción aparecerá aquí."}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-4 px-4 pb-5">
          {lista.map((bloque) => (
            <section key={`bloque-${bloque.n}`}>
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-px flex-1 bg-royal-gold/50" />
                <h4
                  data-campo-preview={`bloque${bloque.n}Titulo`}
                  className={`m-0 text-[11px] font-extrabold tracking-[0.18em] text-royal-gold uppercase ${claseResaltePreview(campoResaltado === `bloque${bloque.n}Titulo`)}`}
                >
                  {bloque.titulo || "Título del bloque"}
                </h4>
                <span aria-hidden="true" className="h-px flex-1 bg-royal-gold/50" />
              </div>
              <ul
                data-campo-preview={`bloque${bloque.n}Filas`}
                className={`m-0 mt-2 flex list-none flex-col gap-2 p-0 ${claseResaltePreview(campoResaltado === `bloque${bloque.n}Filas`)}`}
              >
                {bloque.filas.length === 0 &&
                campoResaltado === `bloque${bloque.n}Filas` ? (
                  <li className="text-center text-xs text-text-muted">
                    El horario aparecerá aquí.
                  </li>
                ) : null}
                {bloque.filas.map((fila) => (
                  <li
                    key={`${fila.dia}-${fila.horas.join("|")}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="inline-flex w-fit items-center rounded-full bg-[#f0e7d2] px-3 py-1 text-xs font-bold text-royal-blue">
                      {fila.dia}
                    </span>
                    <span className="flex flex-col text-right text-xs font-bold text-royal-blue">
                      {fila.horas.map((hora) => (
                        <span key={hora}>{hora}</span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
