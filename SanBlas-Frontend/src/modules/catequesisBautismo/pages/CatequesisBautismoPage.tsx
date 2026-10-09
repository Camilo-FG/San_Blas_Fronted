import { useState } from "react";
import { ApiError } from "../../../services/apiClient";
import SeoHead from "../../../seo/SeoHead";
import Rutas from "../../../routes/Rutas";
import { Button, Badge, Card, ErrorMessage, FieldError, Input, Label } from "../../../shared/ui";
import {
  consultarInscripcionCatequesisBautismo,
  crearInscripcionCatequesisBautismo,
} from "../catequesisBautismoService";
import {
  getEstadoBadgeVariant,
  textoEstadoCica,
} from "../../cica/estadoCica";
import {
  ETIQUETA_CONDICION,
  ETIQUETA_ESTADO_CIVIL,
  PROVINCIAS_COSTA_RICA,
  type CondicionBautismo,
  type EstadoCivilBautismo,
} from "../types";
import {
  filtrarApellidoBautismo,
  filtrarNombreBautismo,
  filtrarTelefonoBautismo,
  MAX_APELLIDO_BAUTISMO,
  MAX_NOMBRE_BAUTISMO,
  validarFormularioCatequesisBautismo,
  type FormularioCatequesisBautismo,
} from "../validarCatequesisBautismo";

const campo =
  "min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-slate-900";

const vacio: FormularioCatequesisBautismo = {
  nombre: "",
  apellido1: "",
  apellido2: "",
  fechaNacimiento: "",
  cedula: "",
  telefono: "",
  estadoCivil: "",
  parroquiaOrigen: "",
  provincia: "",
  canton: "",
  distrito: "",
  barrio: "",
  condicion: "",
};

function Campo({
  etiqueta,
  valor,
  onChange,
  error,
  placeholder,
  obligatorio = false,
  type = "text",
  maxLength,
  className,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
  placeholder: string;
  obligatorio?: boolean;
  type?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <Label required={obligatorio}>{etiqueta}</Label>
      <Input
        className={campo}
        type={type}
        value={valor}
        placeholder={placeholder}
        maxLength={maxLength}
        hasError={Boolean(error)}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError message={error} />
    </div>
  );
}

const CatequesisBautismoPage = () => {
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<{ mensaje: string; estado: string } | null>(null);
  const [seccion, setSeccion] = useState<"inscribirse" | "consultar">("inscribirse");
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);
  const [consultas, setConsultas] = useState<
    Awaited<ReturnType<typeof consultarInscripcionCatequesisBautismo>>
  >([]);

  const set = (clave: keyof FormularioCatequesisBautismo, valor: string) => {
    setForm((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actual) => {
      const siguiente = { ...actual };
      delete siguiente[clave];
      return siguiente;
    });
  };
  const alNombre = (clave: keyof FormularioCatequesisBautismo) => (valor: string) =>
    set(clave, filtrarNombreBautismo(valor));
  const alApellido = (clave: keyof FormularioCatequesisBautismo) => (valor: string) =>
    set(clave, filtrarApellidoBautismo(valor));

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorEnvio(null);
    const encontrados = validarFormularioCatequesisBautismo(form);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await crearInscripcionCatequesisBautismo({
        nombre: form.nombre.trim(),
        apellido1: form.apellido1.trim(),
        apellido2: form.apellido2.trim() || null,
        fechaNacimiento: form.fechaNacimiento,
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        estadoCivil: form.estadoCivil as EstadoCivilBautismo,
        parroquiaOrigen: form.parroquiaOrigen.trim(),
        provincia: form.provincia as (typeof PROVINCIAS_COSTA_RICA)[number],
        canton: form.canton.trim(),
        distrito: form.distrito.trim(),
        barrio: form.barrio.trim(),
        condicion: form.condicion as CondicionBautismo,
      });
      setListo({
        mensaje:
          respuesta?.mensaje ??
          "La solicitud quedó pendiente. Cuando termine la catequesis, la parroquia certificará que ya puede seguir con el bautismo.",
        estado: respuesta?.estado ?? "Pendiente",
      });
    } catch (err) {
      setErrorEnvio(
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar la solicitud. Intente nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const consultar = async () => {
    const cedula = cedulaConsulta.trim();
    if (!/^\d{9}$/.test(cedula)) {
      setErrorConsulta("La cédula debe tener 9 dígitos.");
      setConsultas([]);
      return;
    }
    setConsultando(true);
    setErrorConsulta(null);
    try {
      const data = await consultarInscripcionCatequesisBautismo(cedula);
      setConsultas(data ?? []);
      if (!data?.length) {
        setErrorConsulta("No hay solicitudes con esa cédula.");
      }
    } catch (err) {
      setConsultas([]);
      setErrorConsulta(
        err instanceof ApiError
          ? err.message
          : "No se pudo consultar la solicitud.",
      );
    } finally {
      setConsultando(false);
    }
  };

  return (
    <>
      <SeoHead page={Rutas.FormsolicitudesCatequesisBautismo} />
      <main className="px-3.5 pb-10 sm:px-5">
        <section className="mx-auto mt-6 max-w-[860px] rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:mt-10 sm:p-7">
          <p className="m-0 text-xs font-black tracking-[2px] text-royal-gold-muted uppercase">
            Parroquia San Blas de Nicoya
          </p>
          <h1 className="m-0 mt-2 font-heading text-2xl font-extrabold text-royal-blue sm:text-[30px]">
            Catequesis para el bautismo
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Si va a bautizar a su hijo o hija, primero debe completar esta
            catequesis. La inscripción queda pendiente hasta que la parroquia
            certifique que el curso se llevó.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {(
              [
                ["inscribirse", "Inscribirse"],
                ["consultar", "Consultar estado"],
              ] as const
            ).map(([id, etiqueta]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSeccion(id)}
                aria-pressed={seccion === id}
                className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-royal-gold/40 ${
                  seccion === id
                    ? "bg-royal-blue text-white shadow-md"
                    : "border border-royal-blue/20 bg-royal-blue/5 text-royal-blue hover:bg-royal-blue hover:text-white"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          {seccion === "inscribirse" && (listo ? (
            <Card className="mt-6 w-full" accent>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-text-muted">Su solicitud</span>
                  <Badge variant={getEstadoBadgeVariant(listo.estado)}>
                    {textoEstadoCica(listo.estado)}
                  </Badge>
                </div>
                <p className="m-0 text-sm text-text-secondary" role="status">
                  {listo.mensaje}
                </p>
              </div>
            </Card>
          ) : (
            <form className="mt-6 flex flex-col gap-5" onSubmit={enviar} noValidate>
              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue">
                  Identificación
                </legend>
                <Campo
                  etiqueta="Cédula"
                  obligatorio
                  className="sm:col-span-3"
                  placeholder="Ej: 102340567"
                  valor={form.cedula}
                  error={errores.cedula}
                  onChange={(valor) => set("cedula", valor)}
                />
                <Campo
                  etiqueta="Nombre"
                  obligatorio
                  maxLength={MAX_NOMBRE_BAUTISMO}
                  placeholder="Ej: José"
                  valor={form.nombre}
                  error={errores.nombre}
                  onChange={alNombre("nombre")}
                />
                <Campo
                  etiqueta="Primer apellido"
                  obligatorio
                  maxLength={MAX_APELLIDO_BAUTISMO}
                  placeholder="Ej: Pérez"
                  valor={form.apellido1}
                  error={errores.apellido1}
                  onChange={alApellido("apellido1")}
                />
                <Campo
                  etiqueta="Segundo apellido"
                  maxLength={MAX_APELLIDO_BAUTISMO}
                  placeholder="Ej: Gómez"
                  valor={form.apellido2}
                  error={errores.apellido2}
                  onChange={alApellido("apellido2")}
                />
                <Campo
                  etiqueta="Fecha de nacimiento"
                  obligatorio
                  type="date"
                  placeholder=""
                  valor={form.fechaNacimiento}
                  error={errores.fechaNacimiento}
                  onChange={(valor) => set("fechaNacimiento", valor)}
                />
                <Campo
                  etiqueta="Teléfono"
                  obligatorio
                  maxLength={9}
                  placeholder="Ej: 8888-8888"
                  valor={form.telefono}
                  error={errores.telefono}
                  onChange={(valor) => set("telefono", filtrarTelefonoBautismo(valor))}
                />
              </fieldset>

              <fieldset>
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue">
                  Estado civil
                </legend>
                <div className="flex flex-wrap gap-4 text-sm">
                  {(
                    Object.entries(ETIQUETA_ESTADO_CIVIL) as [
                      EstadoCivilBautismo,
                      string,
                    ][]
                  ).map(([valor, etiqueta]) => (
                    <label key={valor} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="estadoCivil"
                        checked={form.estadoCivil === valor}
                        onChange={() => set("estadoCivil", valor)}
                      />
                      {etiqueta}
                    </label>
                  ))}
                </div>
                <FieldError message={errores.estadoCivil} />
              </fieldset>

              <fieldset>
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue">
                  Condición
                </legend>
                <div className="flex flex-wrap gap-4 text-sm">
                  {(
                    Object.entries(ETIQUETA_CONDICION) as [CondicionBautismo, string][]
                  ).map(([valor, etiqueta]) => (
                    <label key={valor} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="condicion"
                        checked={form.condicion === valor}
                        onChange={() => set("condicion", valor)}
                      />
                      {etiqueta}
                    </label>
                  ))}
                </div>
                <FieldError message={errores.condicion} />
              </fieldset>

              <fieldset className="grid gap-3 sm:grid-cols-2">
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue sm:col-span-2">
                  Procedencia
                </legend>
                <Campo
                  etiqueta="Parroquia de origen"
                  obligatorio
                  maxLength={MAX_NOMBRE_BAUTISMO}
                  placeholder="Ej: San Blas de Nicoya"
                  valor={form.parroquiaOrigen}
                  error={errores.parroquiaOrigen}
                  onChange={alNombre("parroquiaOrigen")}
                />
                <div className="flex flex-col gap-1 text-sm">
                  <Label required>Provincia</Label>
                  <select
                    className={campo}
                    value={form.provincia}
                    aria-invalid={Boolean(errores.provincia)}
                    onChange={(event) => set("provincia", event.target.value)}
                  >
                    <option value="">Seleccione la provincia</option>
                    {PROVINCIAS_COSTA_RICA.map((provincia) => (
                      <option key={provincia} value={provincia}>
                        {provincia}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errores.provincia} />
                </div>
                <Campo
                  etiqueta="Cantón"
                  obligatorio
                  maxLength={MAX_NOMBRE_BAUTISMO}
                  placeholder="Ej: Nicoya"
                  valor={form.canton}
                  error={errores.canton}
                  onChange={alNombre("canton")}
                />
                <Campo
                  etiqueta="Distrito"
                  obligatorio
                  maxLength={MAX_NOMBRE_BAUTISMO}
                  placeholder="Ej: Nicoya"
                  valor={form.distrito}
                  error={errores.distrito}
                  onChange={alNombre("distrito")}
                />
                <Campo
                  etiqueta="Barrio"
                  obligatorio
                  maxLength={MAX_NOMBRE_BAUTISMO}
                  placeholder="Ej: San Martín"
                  valor={form.barrio}
                  error={errores.barrio}
                  onChange={alNombre("barrio")}
                />
              </fieldset>

              {errorEnvio && (
                <p className="m-0 text-sm text-red-700" role="alert">
                  {errorEnvio}
                </p>
              )}

              <Button type="submit" variant="royal" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar inscripción"}
              </Button>
            </form>
          ))}
        </section>

        {seccion === "consultar" && (
        <section className="mx-auto mt-6 max-w-[860px] rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:p-7">
          <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue">
            Consultar estado
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Escriba la cédula con la que se inscribió para ver el estado de su solicitud.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label required>Cédula</Label>
              <Input
                value={cedulaConsulta}
                placeholder="Ej: 102340567"
                onChange={(event) => setCedulaConsulta(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="royal"
              disabled={consultando}
              onClick={() => void consultar()}
            >
              {consultando ? "Consultando..." : "Consultar"}
            </Button>
          </div>
          {errorConsulta && (
            <div className="mt-4">
              <ErrorMessage message={errorConsulta} />
            </div>
          )}
          {consultas && consultas.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              {consultas.map((solicitud) => (
                <Card key={solicitud.id} className="w-full" accent>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-text">
                      {solicitud.nombre} {solicitud.apellido1} {solicitud.apellido2 ?? ""}
                    </span>
                    <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
                      {textoEstadoCica(solicitud.estado)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
        )}
      </main>
    </>
  );
};

export default CatequesisBautismoPage;
