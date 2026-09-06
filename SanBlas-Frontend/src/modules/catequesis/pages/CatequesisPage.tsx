import { useEffect, useState } from "react";
import CatequesisForm from "../components/CatequesisForm";
import CatequesisInfoSection from "../components/CatequesisInfoSection";
import { crearSolicitudCatequesis } from "../../../services/catequesis/catequesisService";
import { ApiError } from "../../../services/apiClient";
import type { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";
import SeoHead from "../../../seo/SeoHead";
import { Button } from "../../../shared/ui";

const CatequesisPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"info" | "matricula">(
    "info",
  );
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (data: CatequesisEnrollmentData) => {
    setLoading(true);

    try {
      await crearSolicitudCatequesis(data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);

      if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert("Ocurrió un error al enviar la solicitud.");
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
              <p className="m-0 mt-3 max-w-[560px] text-base leading-relaxed text-text-secondary">
                Recibimos la inscripción a catequesis. Pronto revisaremos la
                información y nos pondremos en contacto contigo.
              </p>
              <Button
                type="button"
                variant="royal"
                className="mt-6 min-h-12 px-5 shadow-[0_8px_18px_rgba(0,51,102,0.18)]"
                onClick={() => {
                  setSubmitted(false);
                  setActiveSection("matricula");
                }}
              >
                Hacer otra inscripción
              </Button>
            </section>
          ) : activeSection === "info" ? (
            <CatequesisInfoSection />
          ) : (
            <CatequesisForm
              loading={loading}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default CatequesisPage;
