import { useEffect, useState } from "react";
import CatequesisForm from "../components/CatequesisForm";
import CatequesisInfoSection from "../components/CatequesisInfoSection";
import {
  crearSolicitudCatequesis,
  consultarSolicitudesPorCorreo,
} from "../../../services/catequesis/catequesisService";
import { ApiError } from "../../../services/apiClient";
import type { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";
import type { CatequesisEnrollmentRecord } from "../../dashboard/catequesis/Types/catequesis";
import SeoHead from "../../../seo/SeoHead";
import {
  Badge,
  Button,
  Card,
  ErrorMessage,
  Input,
  Label,
} from "../../../shared/ui";
import { formatearFechaEnvio } from "../../../shared/utils/fechas";
import { soloCorreo, correoValido } from "../../../shared/utils/formValidation";

interface ResumenSolicitudEnviada {
  nombreAlumno: string;
  centro: string;
  nivel: string;
  estado: string;
  fechaEnvio: string;
}

const normalizarEstado = (estado?: string | null): string => {
  if (!estado) return "pendiente";
  const e = estado.trim().toLowerCase();
  if (e === "aprobado" || e === "aprobada") return "aprobado";
  if (e === "rechazado" || e === "rechazada") return "rechazado";
  return "pendiente";
};

const getEstadoBadgeVariant = (
  estado?: string | null,
): "success" | "danger" | "warning" => {
  switch (normalizarEstado(estado)) {
    case "aprobado":
      return "success";
    case "rechazado":
      return "danger";
    default:
      return "warning";
  }
};

const getEstadoMensaje = (estado?: string | null): string => {
  switch (normalizarEstado(estado)) {
    case "aprobado":
      return "Tu inscripción fue aprobada. Ya puedes asistir a catequesis.";
    case "rechazado":
      return "Tu inscripción fue rechazada. Revisa el motivo adjunto.";
    default:
      return "Tu inscripción está pendiente de revisión por el catequista.";
  }
};

type Section = "info" | "matricula" | "consultar";

const CatequesisPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("info");
  const [submitted, setSubmitted] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenSolicitudEnviada | null>(null);

  const [correoConsulta, setCorreoConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);
  const [resultadosConsulta, setResultadosConsulta] = useState<
    CatequesisEnrollmentRecord[]
  >([]);

  useEffect(() => {
    const syncSectionWithHash = () => {
      const hash = window.location.hash;
      if (hash === "#matricula") setActiveSection("matricula");
      else if (hash === "#consultar") setActiveSection("consultar");
      else setActiveSection("info");
    };

    syncSectionWithHash();
    window.addEventListener("hashchange", syncSectionWithHash);
    return () => window.removeEventListener("hashchange", syncSectionWithHash);
  }, []);

  const handleSubmit = async (data: CatequesisEnrollmentData) => {
    setLoading(true);
    setErrorEnvio(null);

    try {
      const respuesta = await crearSolicitudCatequesis(data);
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
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorEnvio(error.message);
      } else {
        setErrorEnvio("Ocurrió un error al enviar la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConsultar = async () => {
    if (!correoConsulta.trim()) return;
    if (!correoValido(correoConsulta)) {
      setErrorConsulta("Digite un correo válido.");
      return;
    }
    setConsultando(true);
    setErrorConsulta(null);
    setResultadosConsulta([]);

    try {
      const resultados = await consultarSolicitudesPorCorreo(
        correoConsulta.trim(),
      );
      setResultadosConsulta(resultados);
      if (resultados.length === 0) {
        setErrorConsulta(
          "No se encontraron solicitudes asociadas a ese correo.",
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorConsulta(error.message);
      } else {
        setErrorConsulta("Ocurrió un error al consultar las solicitudes.");
      }
    } finally {
      setConsultando(false);
    }
  };

  const cambiarSeccion = (seccion: Section) => {
    setActiveSection(seccion);
    setCorreoConsulta("");
    setErrorConsulta(null);
    setResultadosConsulta([]);
    const hashes: Record<Section, string> = {
      info: "#informacion",
      matricula: "#matricula",
      consultar: "#consultar",
    };
    window.history.replaceState(null, "", hashes[seccion]);
  };

  const tabs: { id: Section; label: string }[] = [
    { id: "info", label: "Información" },
    { id: "matricula", label: "Inscribirse" },
    { id: "consultar", label: "Consultar estado" },
  ];

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
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => cambiarSeccion(tab.id)}
                  aria-pressed={activeSection === tab.id}
                  className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-royal-gold/40 ${
                    activeSection === tab.id
                      ? "bg-royal-blue text-white shadow-md"
                      : "border border-royal-blue/20 bg-royal-blue/5 text-royal-blue hover:bg-royal-blue hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
              {resumen ? (
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
                        {formatearFechaEnvio(resumen.fechaEnvio)}
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
                  setResumen(null);
                  setErrorEnvio(null);
                  setActiveSection("matricula");
                }}
              >
                Hacer otra inscripción
              </Button>
            </section>
          ) : activeSection === "info" ? (
            <CatequesisInfoSection />
          ) : activeSection === "matricula" ? (
            <>
              {errorEnvio ? (
                <ErrorMessage message={errorEnvio} />
              ) : null}
              <CatequesisForm loading={loading} onSubmit={handleSubmit} />
            </>
          ) : (
            <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
              <h2 className="m-0 mb-2 font-heading text-xl font-extrabold text-royal-blue sm:text-2xl">
                Consultar estado de inscripción
              </h2>
              <p className="m-0 mb-6 text-sm text-text-secondary">
                Ingresá el correo electrónico con el que se realizó la
                inscripción para ver el estado de tu solicitud.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="correo-consulta">
                    Correo electrónico<span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    id="correo-consulta"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={correoConsulta}
                    onChange={(e) => {
                      const valor = soloCorreo(e.target.value);
                      setCorreoConsulta(valor);
                      if (!valor || correoValido(valor)) setErrorConsulta(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConsultar();
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="royal"
                  className="min-h-11 px-6"
                  disabled={consultando || !correoConsulta.trim()}
                  onClick={handleConsultar}
                >
                  {consultando ? "Consultando..." : "Consultar"}
                </Button>
              </div>

              {errorConsulta && (
                <div className="mt-4">
                  <ErrorMessage message={errorConsulta} />
                </div>
              )}

              {resultadosConsulta.length > 0 && (
                <div className="mt-6 flex flex-col gap-4">
                  {resultadosConsulta.map((solicitud) => (
                    <Card
                      key={solicitud.id}
                      className="w-full"
                      accent
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-text-muted">
                              Solicitud #{solicitud.id}
                            </span>
                            <Badge
                              variant={getEstadoBadgeVariant(
                                solicitud.estado,
                              )}
                            >
                              {solicitud.estado}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                            <div>
                              <span className="font-semibold text-text-muted">
                                Alumno:{" "}
                              </span>
                              <span className="text-text">
                                {solicitud.catequizando?.nombre ?? "—"}{" "}
                                {solicitud.catequizando?.apellidos ?? ""}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-text-muted">
                                Centro:{" "}
                              </span>
                              <span className="text-text">
                                {solicitud.catequesis?.centroCatequesis ?? "—"}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-text-muted">
                                Nivel:{" "}
                              </span>
                              <span className="text-text">
                                {solicitud.catequesis?.nivelAInscribirse ?? "—"}
                              </span>
                            </div>
<div>
  <span className="font-semibold text-text-muted">
    Fecha de envío:{" "}
  </span>
  <span className="text-text">
    {formatearFechaEnvio(
      solicitud.fechaSolicitud,
    )}
  </span>
</div>
<div>
  <span className="font-semibold text-text-muted">
    Fecha de revisión:{" "}
  </span>
  <span className="text-text">
    {solicitud.fechaActualizacionEstado
      ? formatearFechaEnvio(solicitud.fechaActualizacionEstado)
      : "—"}
  </span>
</div>
                          </div>
                          <p className="m-0 mt-1 text-sm text-text-secondary">
                            {getEstadoMensaje(solicitud.estado)}
                          </p>
                          {normalizarEstado(solicitud.estado) === "rechazado" &&
                            solicitud.observacionAdministrativa && (
                              <div className="mt-1 rounded-lg border border-border bg-surface-muted p-3 text-sm text-text-secondary">
                                <span className="font-semibold text-text-muted">
                                  Observación:{" "}
                                </span>
                                {solicitud.observacionAdministrativa}
                              </div>
                            )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default CatequesisPage;
