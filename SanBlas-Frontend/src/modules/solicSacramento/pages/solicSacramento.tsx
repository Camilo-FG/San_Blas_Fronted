import SeoHead from "../../../seo/SeoHead";
import { useSearch } from "@tanstack/react-router";
import FormSolic from "../components/FormSolic";

const SolicSacramento = () => {
  const { accessDenied } = useSearch({ strict: false }) as {
    accessDenied?: "admin";
  };

  return (
    <>
      <SeoHead page="/solicitudes-sacramentos" />
      <section className="box-border min-h-[calc(100vh-80px)] w-full max-w-full overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(0,51,102,0.08),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-4 sm:p-9">
      {accessDenied === "admin" && (
        <div
          className="mb-4 rounded-[14px] border border-red-200 bg-danger-bg px-5 py-4 leading-relaxed text-danger"
          role="alert"
        >
          <strong>Acceso restringido.</strong> El panel administrativo solo está
          disponible para cuentas con rol de administrador. Si necesita acceso,
          contacte a la parroquia.
        </div>
      )}

      <FormSolic />
    </section>
    </>
  );
};

export default SolicSacramento;
