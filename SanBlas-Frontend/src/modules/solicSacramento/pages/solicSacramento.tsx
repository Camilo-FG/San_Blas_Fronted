import { useSearch } from "@tanstack/react-router";
import FormSolic from "../components/FormSolic";

const SolicSacramento = () => {
  const { accessDenied } = useSearch({ strict: false }) as {
    accessDenied?: "admin";
  };

  return (
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

      <div className="mb-4 flex w-full max-w-full min-w-0 flex-col items-stretch justify-between gap-4 rounded-[16px] border border-border bg-surface p-4 shadow-sm sm:mb-7 sm:flex-row sm:items-center sm:gap-6 sm:rounded-[22px] sm:p-7">
        <div>
          <p className="m-0 mb-2.5 text-xs font-black tracking-[2px] text-royal-gold uppercase">
            Solicitudes de sacramentos
          </p>
          <h1 className="m-0 mb-2.5 font-heading text-[26px] font-extrabold text-royal-blue sm:text-[34px]">
            Registro de solicitud
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-text-secondary sm:text-base">
            Completa el formulario para gestionar una nueva solicitud
          </p>
        </div>

        <div className="box-border flex w-full min-w-0 max-w-full items-center gap-3.5 rounded-[18px] border border-border bg-surface-muted p-3.5 sm:min-w-[240px] sm:w-auto sm:max-w-none sm:p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-royal-blue text-base font-black text-white">
            SS
          </span>
          <div>
            <strong className="mb-0.5 block text-[15px] text-royal-blue">
              Panel San Blas
            </strong>
            <p className="m-0 text-[13px] text-text-secondary">
              Formulario de atención
            </p>
          </div>
        </div>
      </div>

      <FormSolic />
    </section>
  );
};

export default SolicSacramento;
