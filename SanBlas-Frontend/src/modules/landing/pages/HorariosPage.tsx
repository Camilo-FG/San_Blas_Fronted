import SeoHead from "../../../seo/SeoHead";
import { useLandingSection } from "../../../hooks/useLandingSection";
import {
  HORARIOS_DEFAULT,
  type HorarioBloque,
  type HorarioFila,
} from "../horariosContent";

// acepta la forma nueva (filas) y la vieja (items "Día: horas") pa no romper con datos guardados antes
function normalizarBloques(origen: unknown): HorarioBloque[] {
  if (!Array.isArray(origen)) return HORARIOS_DEFAULT.bloques;
  const bloques: HorarioBloque[] = [];
  for (const bloque of origen) {
    if (!bloque || typeof bloque !== "object") continue;
    const titulo = String(
      (bloque as { titulo?: unknown }).titulo ?? "",
    ).trim();
    const registro = bloque as {
      filas?: unknown;
      items?: unknown;
    };
    let filas: HorarioFila[] = [];
    if (Array.isArray(registro.filas)) {
      filas = registro.filas
        .filter(
          (fila): fila is { dia?: unknown; horas?: unknown } =>
            !!fila && typeof fila === "object",
        )
        .map((fila) => ({
          dia: String(fila.dia ?? "").trim(),
          horas: Array.isArray(fila.horas)
            ? fila.horas
                .map((hora) => String(hora ?? "").trim())
                .filter(Boolean)
            : [],
        }))
        .filter((fila) => fila.dia || fila.horas.length > 0);
    } else if (Array.isArray(registro.items)) {
      filas = registro.items
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
        .map((item) => {
          const corte = item.indexOf(":");
          if (corte <= 0) return { dia: item, horas: [] as string[] };
          return {
            dia: item.slice(0, corte).trim(),
            horas: [item.slice(corte + 1).trim()].filter(Boolean),
          };
        });
    }
    if (titulo || filas.length > 0) bloques.push({ titulo, filas });
  }
  return bloques.length > 0 ? bloques : HORARIOS_DEFAULT.bloques;
}

function HorariosPage() {
  const { data } = useLandingSection("horarios", HORARIOS_DEFAULT);
  const bloques = normalizarBloques(
    (data as { bloques?: unknown }).bloques,
  );
  // la imagen de fondo se edita en Gestión de landing (si no hay, se usa la por defecto)
  const fondo = data.imageUrl || "/horarios-fondo.jpg";

  return (
    <>
      <SeoHead page="/horarios" />
      <main className="bg-[#f7f1e3] px-4 py-10 sm:px-6 sm:py-14">
        <div
          className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e7dcc3] shadow-[0_24px_50px_rgba(30,58,110,0.14)]"
          style={{
            backgroundImage: `url(${fondo})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#fffdf7]/75"
          />
          <div className="relative px-6 pt-10 pb-8 text-center sm:px-10">
              <h1 className="m-0 font-heading text-5xl font-extrabold text-royal-blue sm:text-6xl">
                {data.title}
              </h1>
              <p className="m-0 mt-1 font-heading text-2xl font-bold text-royal-blue sm:text-3xl">
                {data.subtitle}{" "}
                <span className="text-4xl text-royal-gold italic sm:text-5xl">
                  {data.titleHighlight}
                </span>
              </p>
              {data.intro ? (
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-muted">
                  {data.intro}
                </p>
              ) : null}
          </div>

          <div className="relative flex flex-col gap-8 px-6 pb-10 sm:px-10">
            {bloques.map((bloque) => (
              <section key={bloque.titulo || "bloque"}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-royal-gold/50"
                  />
                  <h2 className="m-0 text-sm font-extrabold tracking-[0.18em] text-royal-gold uppercase">
                    {bloque.titulo}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-royal-gold/50"
                  />
                </div>
                <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
                  {bloque.filas.map((fila) => (
                    <li
                      key={`${fila.dia}-${fila.horas.join("|")}`}
                      className="flex flex-col gap-1.5 rounded-2xl px-1 py-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="inline-flex w-fit items-center rounded-full bg-[#f0e7d2] px-4 py-2 text-sm font-bold text-royal-blue">
                        {fila.dia}
                      </span>
                      <span className="flex flex-col text-left text-base font-bold text-royal-blue sm:text-right">
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
      </main>
    </>
  );
}

export default HorariosPage;
