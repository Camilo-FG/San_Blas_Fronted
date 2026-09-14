import { useEffect, useState } from "react";
import CatequesisForm from "../components/CatequesisForm";
import CatequesisInfoSection from "../components/CatequesisInfoSection";
import { crearSolicitudCatequesis } from "../../../services/catequesis/catequesisService";
import { ApiError } from "../../../services/apiClient";
import type { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";
import SeoHead from "../../../seo/SeoHead";
import { Badge, Button, Card, ErrorMessage } from "../../../shared/ui";
import { formatearFechaCalendario } from "../../../shared/utils/fechas";

// solo lo no sensible pa la tarjeta (nombre, centro, nivel, estado y fechas, nada de direcciones ni teléfonos)
interface ResumenSolicitudEnviada {
  nombreAlumno: string;
  centro: string;
  nivel: string;
  estado: string;
  fechaEnvio: string;
}

const CatequesisPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"info" | "matricula">(
    "info",
  );
  const [submitted, setSubmitted] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null); // pa mostrar el error sin usar alert
  // vive solo en memoria (se limpia con "Hacer otra inscripción", no se guarda ni se muestra en consola)
  const [resumen, setResumen] = useState<ResumenSolicitudEnviada | null>(null);

  useEffect(() => {
    const syncSectionWithHash = () => {
      setActiveSection(
        window.location.hash === "#matricula" ? "matricula" : "info",
      );
    };

    syncSectionWithHash();
    window.addEventListener("hashchange", syncSectionWithHash);
    return () => window.removeEventListener("hashchange", syncSectionWithHash);
  }, []);

  // manda la solicitud al backend (con archivos usa FormData en el service)
  const handleSubmit = async (data: CatequesisEnrollmentData) => {
    setLoading(true);
    setErrorEnvio(null);

    try {
      const respuesta = await crearSolicitudCatequesis(data);
      // arma el resumen solo con lo del POST (sin id y sin datos privados como dirección o teléfonos)
      const nombreAlumno =
        `${data.catequizando.nombre ?? ""} ${data.catequizando.primerApellido ?? ""} ${data.catequizando.segundoApellido ?? ""}`
          .replace(/\s+/g, " ")
          .trim() || "—";
      setResumen({
        nombreAlumno,
        centro: data.catequesis.centroCatequesis ?? "—",
        nivel: data.catequesis.nivelAInscribirse ?? "—",
        estado: respuesta?.estado ?? "Pendiente",
        fechaEnvio:
          respuesta?.fechaSolicitud ?? new Date().toISOString(),
      });
      setSubmitted(true); // el backend la guarda en Pendiente, el form se limpia al desmontarse
    } catch (error) {
      // traduce el error con ApiError en vez de alert pelado
      if (error instanceof ApiError) {
        setErrorEnvio(error.message);
      } else {
        setErrorEnvio("Ocurrió un error al enviar la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead page="/solicitudes-catequesis" />
      <main className="px-3.5 pb-8 sm:px-5 sm:pb-10">
        <div className="mx-auto mt-6 flex max-w-[1100px] flex-col gap-5 sm:mt-10">
          <header className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
            <p className="m-0 text-xs font-black tracking-[2px] text-royal-gold-muted uppercase">
              Catequesis parroquial
            </p>
            <h1 className="m-0 mt-2 font-heading text-2xl font-extrabold text-royal-blue sm:text-[30px]">
              Matrícula a Catequesis
            </h1>
            <div
              className="mt-5 grid grid-cols-1 gap-2 rounded-2xl bg-surface-muted p-1.5 sm:grid-cols-2"
              role="tablist"
              aria-label="Secciones de catequesis"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeSection === "info"}
                onClick={() => {
                  setActiveSection("info");
                  window.history.replaceState(null, "", "#informacion");
                }}
                className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-royal-gold/40 ${
                  activeSection === "info"
                    ? "bg-royal-blue text-white shadow-sm"
                    : "text-text-secondary hover:bg-surface hover:text-royal-blue"
                }`}
              >
                Información sobre catequesis
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSection === "matricula"}
                onClick={() => {
                  setActiveSection("matricula");
                  window.history.replaceState(null, "", "#matricula");
                }}
                className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-royal-gold/40 ${
                  activeSection === "matricula"
                    ? "bg-royal-blue text-white shadow-sm"
                    : "text-text-secondary hover:bg-surface hover:text-royal-blue"
                }`}
              >
                Matricular catequesis
              </button>
            </div>
          </header>

          {submitted ? (
            <section className="flex min-h-[380px] flex-col items-center justify-center rounded-[22px] border border-border bg-surface px-5 py-10 text-center shadow-sm sm:min-h-[430px] sm:px-8">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-400 shadow-[0_10px_24px_rgba(34,197,94,0.24)]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="m-0 mt-6 font-heading text-2xl font-extrabold text-royal-blue sm:text-[30px]">
                ¡Inscripción enviada con éxito!
              </h2>
              <Badge variant="warning" className="mt-4 text-sm">
                Estado: {resumen?.estado ?? "Pendiente"}
              </Badge>
              <p className="m-0 mt-3 max-w-[560px] text-base leading-relaxed text-text-secondary">
                Recibimos la inscripción a catequesis. Pronto revisaremos la
                información y nos pondremos en contacto contigo.
              </p>
              {resumen ? ( // tarjeta centrada con lo del POST (sin datos privados)
                <Card className="mt-6 w-full max-w-[560px] text-left" accent>
                  <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold tracking-wide text-text-muted uppercase">
                        Alumno
                      </dt>
                      <dd className="m-0 mt-1 text-base font-semibold text-royal-blue">
                        {resumen.nombreAlumno}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold tracking-wide text-text-muted uppercase">
                        Nivel
                      </dt>
                      <dd className="m-0 mt-1 text-base font-semibold text-royal-blue">
                        {resumen.nivel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold tracking-wide text-text-muted uppercase">
                        Centro
                      </dt>
                      <dd className="m-0 mt-1 text-base text-text-secondary">
                        {resumen.centro}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold tracking-wide text-text-muted uppercase">
                        Fecha de envío
                      </dt>
                      <dd className="m-0 mt-1 text-base text-text-secondary">
                        {resumen.fechaEnvio
                          ? formatearFechaCalendario(resumen.fechaEnvio)
                          : "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-bold tracking-wide text-text-muted uppercase">
                        Revisión
                      </dt>
                      <dd className="m-0 mt-1 text-sm text-text-secondary">
                        Pendiente de revisión por el catequista.
                      </dd>
                    </div>
                  </dl>
                </Card>
              ) : null}
              <Button
                type="button"
                variant="royal"
                className="mt-6 min-h-12 px-5 shadow-[0_8px_18px_rgba(0,51,102,0.18)]"
                onClick={() => {
                  setSubmitted(false);
                  setResumen(null); // borra el resumen de memoria pa no dejar datos en pantalla
                  setErrorEnvio(null); // limpia todo pa empezar de cero
                  setActiveSection("matricula");
                }}
              >
                Hacer otra inscripción
              </Button>
            </section>
          ) : activeSection === "info" ? (
            <CatequesisInfoSection />
          ) : (
            <>
              {errorEnvio ? ( // error visible sin recargar, con opción de reintentar enviando de nuevo
                <ErrorMessage message={errorEnvio} />
              ) : null}
              <CatequesisForm loading={loading} onSubmit={handleSubmit} />
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default CatequesisPage;
