import { Link } from "@tanstack/react-router";
import SeoHead from "../../../seo/SeoHead";
import Rutas from "../../../routes/Rutas";

export default function NotFoundPage() {
  return (
    <>
      <SeoHead page="/404" />
      <main className="flex flex-1 flex-col items-center justify-center bg-surface px-[8%] py-20 text-center max-[900px]:px-8 max-sm:px-[18px] max-sm:py-16">
        <p className="m-0 mb-3 text-[11px] font-black tracking-[0.32em] text-royal-gold uppercase">
          Error 404
        </p>
        <h1 className="m-0 mb-4 font-heading text-[clamp(2rem,4vw,2.75rem)] leading-tight text-royal-blue">
          Página no encontrada
        </h1>
        <p className="m-0 mb-10 max-w-[520px] text-base leading-relaxed text-text-muted">
          La dirección que buscó no existe o fue movida. Puede volver al inicio o
          consultar horarios y contacto de la Parroquia San Blas de Nicoya.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={Rutas.home}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-royal-blue px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-royal-blue-dark"
          >
            Ir al inicio
          </Link>
          <Link
            to={Rutas.horarios}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-royal-blue/20 bg-surface px-5 text-sm font-bold text-royal-blue no-underline transition-colors hover:border-royal-gold hover:text-royal-gold"
          >
            Ver horarios
          </Link>
          <Link
            to={Rutas.contacto}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-royal-blue/20 bg-surface px-5 text-sm font-bold text-royal-blue no-underline transition-colors hover:border-royal-gold hover:text-royal-gold"
          >
            Contacto
          </Link>
        </div>
      </main>
    </>
  );
}
