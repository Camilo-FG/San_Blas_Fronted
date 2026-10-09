import { useState } from "react";
import { ApiError } from "../../../services/apiClient";
import SeoHead from "../../../seo/SeoHead";
import Rutas from "../../../routes/Rutas";
import { Button, Card, ErrorMessage, FieldError, Input, Label, Textarea, Badge } from "../../../shared/ui";
import { consultarInscripcionCica, crearInscripcionCica } from "../cicaService";
import {
  getEstadoBadgeVariant,
  textoEstadoCica,
} from "../estadoCica";
import type { EstadoCivilCica } from "../types";
import { SACRAMENTOS_CICA } from "../sacramentosCica";
import {
  filtrarApellidoCica,
  filtrarNombreCica,
  filtrarTelefonoCica,
  MAX_APELLIDO_CICA,
  MAX_DIRECCION_CICA,
  MAX_NOMBRE_CICA,
  MAX_TEXTO_CICA,
  validarFormularioCica,
  type FormularioCica,
} from "../validarCica";

const campo =
  "min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-slate-900";

const vacio: FormularioCica = {
  nombre: "",
  apellido1: "",
  apellido2: "",
  fechaNacimiento: "",
  cedula: "",
  nacionalidad: "",
  telefono: "",
  correo: "",
  estadoCivil: "",
  conyugeNombre: "",
  conyugeApellido1: "",
  conyugeApellido2: "",
  necesitaBautizo: false,
  necesitaPrimeraComunion: false,
  necesitaConfirmacion: false,
  padreNombre: "",
  padreApellido1: "",
  padreApellido2: "",
  madreNombre: "",
  madreApellido1: "",
  madreApellido2: "",
  direccionHogar: "",
  esCatolico: "",
  otraIglesia: "",
  observacion: "",
};

function Campo({
  etiqueta,
  valor,
  onChange,
  error,
  placeholder,
  obligatorio = false,
  type = "text",
  className,
  maxLength,
  mostrarContador = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
  placeholder: string;
  obligatorio?: boolean;
  type?: string;
  className?: string;
  maxLength?: number;
  mostrarContador?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <Label required={obligatorio} className={mostrarContador ? "mb-0" : undefined}>
          {etiqueta}
        </Label>
        {mostrarContador && maxLength ? (
          <span className="text-xs text-text-muted">
            {valor.length}/{maxLength}
          </span>
        ) : null}
      </div>
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

const CicaPage = () => {
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
    Awaited<ReturnType<typeof consultarInscripcionCica>>
  >([]);

  const set = (clave: keyof FormularioCica, valor: string | boolean) => {
    setForm((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actual) => {
      const siguiente = { ...actual };
      delete siguiente[clave];
      if (SACRAMENTOS_CICA.some((sacramento) => sacramento.clave === clave)) {
        delete siguiente.sacramentos;
      }
      return siguiente;
    });
  };
  const alNombre = (clave: keyof FormularioCica) => (valor: string) =>
    set(clave, filtrarNombreCica(valor));
  const alApellido = (clave: keyof FormularioCica) => (valor: string) =>
    set(clave, filtrarApellidoCica(valor));

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorEnvio(null);
    const encontrados = validarFormularioCica(form);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await crearInscripcionCica({
        nombre: form.nombre.trim(),
        apellido1: form.apellido1.trim(),
        apellido2: form.apellido2.trim() || null,
        fechaNacimiento: form.fechaNacimiento,
        cedula: form.cedula.trim(),
        nacionalidad: form.nacionalidad.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        estadoCivil: form.estadoCivil as EstadoCivilCica,
        conyugeNombre:
          form.estadoCivil === "soltero" ? null : form.conyugeNombre.trim(),
        conyugeApellido1:
          form.estadoCivil === "soltero" ? null : form.conyugeApellido1.trim(),
        conyugeApellido2:
          form.estadoCivil === "soltero"
            ? null
            : form.conyugeApellido2.trim() || null,
        necesitaBautizo: form.necesitaBautizo,
        necesitaPrimeraComunion: form.necesitaPrimeraComunion,
        necesitaConfirmacion: form.necesitaConfirmacion,
        padreNombre: form.padreNombre.trim(),
        padreApellido1: form.padreApellido1.trim(),
        padreApellido2: form.padreApellido2.trim() || null,
        madreNombre: form.madreNombre.trim(),
        madreApellido1: form.madreApellido1.trim(),
        madreApellido2: form.madreApellido2.trim() || null,
        direccionHogar: form.direccionHogar.trim(),
        esCatolico: form.esCatolico === "si",
        otraIglesia: form.esCatolico === "no" ? form.otraIglesia.trim() : null,
        observacion: form.observacion.trim() || null,
      });
      setListo({
        mensaje:
          respuesta?.mensaje ??
          "La solicitud quedó pendiente. La parroquia la revisará y luego la aprobará o la rechazará.",
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
      const data = await consultarInscripcionCica(cedula);
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
      <SeoHead page={Rutas.solicitudesCica} />
      <main className="px-3.5 pb-10 sm:px-5">
        <section className="mx-auto mt-6 max-w-[860px] rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:mt-10 sm:p-7">
          <p className="m-0 text-xs font-black tracking-[2px] text-royal-gold-muted uppercase">
            Parroquia San Blas de Nicoya
          </p>
          <h1 className="m-0 mt-2 font-heading text-2xl font-extrabold text-royal-blue sm:text-[30px]">
            Catequesis de Iniciación Cristiana de Adultos (CICA)
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Complete la inscripción. La solicitud queda pendiente hasta que la
            parroquia la revise.
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
                <Campo etiqueta="Cédula" obligatorio className="sm:col-span-3" placeholder="Ej: 102340567" valor={form.cedula} error={errores.cedula} onChange={(valor) => set("cedula", valor)} />
                <Campo etiqueta="Nombre" obligatorio maxLength={MAX_NOMBRE_CICA} placeholder="Ej: Ana María" valor={form.nombre} error={errores.nombre} onChange={alNombre("nombre")} />
                <Campo etiqueta="Primer apellido" obligatorio maxLength={MAX_APELLIDO_CICA} placeholder="Ej: Pérez" valor={form.apellido1} error={errores.apellido1} onChange={alApellido("apellido1")} />
                <Campo etiqueta="Segundo apellido" maxLength={MAX_APELLIDO_CICA} placeholder="Ej: Gómez" valor={form.apellido2} error={errores.apellido2} onChange={alApellido("apellido2")} />
                <Campo etiqueta="Fecha de nacimiento" obligatorio type="date" placeholder="" valor={form.fechaNacimiento} error={errores.fechaNacimiento} onChange={(valor) => set("fechaNacimiento", valor)} />
                <Campo etiqueta="Nacionalidad" obligatorio maxLength={MAX_NOMBRE_CICA} placeholder="Ej: Costarricense" valor={form.nacionalidad} error={errores.nacionalidad} onChange={alNombre("nacionalidad")} />
                <Campo etiqueta="Teléfono" obligatorio maxLength={9} placeholder="Ej: 8888-8888" valor={form.telefono} error={errores.telefono} onChange={(valor) => set("telefono", filtrarTelefonoCica(valor))} />
                <Campo etiqueta="Correo" obligatorio type="email" placeholder="Ej: ana.solis@correo.com" valor={form.correo} error={errores.correo} onChange={(valor) => set("correo", valor)} className="sm:col-span-2" />
              </fieldset>

              <fieldset>
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue">
                  Estado civil
                </legend>
                <div className="flex flex-wrap gap-4 text-sm">
                  {(
                    [
                      ["soltero", "Soltero(a)"],
                      ["matrimonio_civil", "Matrimonio civil"],
                      ["union_libre", "Unión libre"],
                    ] as const
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
                {form.estadoCivil && form.estadoCivil !== "soltero" && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Campo
                      etiqueta="Nombre"
                      obligatorio
                      maxLength={MAX_NOMBRE_CICA}
                      placeholder="Ej: Luis"
                      valor={form.conyugeNombre}
                      error={errores.conyugeNombre}
                      onChange={alNombre("conyugeNombre")}
                    />
                    <Campo
                      etiqueta="Primer apellido"
                      obligatorio
                      maxLength={MAX_APELLIDO_CICA}
                      placeholder="Ej: Pérez"
                      valor={form.conyugeApellido1}
                      error={errores.conyugeApellido1}
                      onChange={alApellido("conyugeApellido1")}
                    />
                    <Campo
                      etiqueta="Segundo apellido"
                      maxLength={MAX_APELLIDO_CICA}
                      placeholder="Ej: Gómez"
                      valor={form.conyugeApellido2}
                      error={errores.conyugeApellido2}
                      onChange={alApellido("conyugeApellido2")}
                    />
                  </div>
                )}
              </fieldset>

              <fieldset
                className={
                  errores.sacramentos
                    ? "rounded-xl border border-red-400 bg-danger-bg p-3"
                    : undefined
                }
                aria-invalid={Boolean(errores.sacramentos)}
              >
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue">
                  Sacramentos que necesita
                </legend>
                <div className="flex flex-wrap gap-4 text-sm">
                  {SACRAMENTOS_CICA.map((sacramento) => (
                    <label key={sacramento.clave} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form[sacramento.clave]}
                        aria-invalid={Boolean(errores.sacramentos)}
                        onChange={(event) =>
                          set(sacramento.clave, event.target.checked)
                        }
                      />
                      {sacramento.etiqueta}
                    </label>
                  ))}
                </div>
                <FieldError message={errores.sacramentos} />
              </fieldset>

              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue sm:col-span-3">
                  Padres y hogar
                </legend>
                <Campo etiqueta="Nombre del padre" obligatorio maxLength={MAX_NOMBRE_CICA} placeholder="Ej: José" valor={form.padreNombre} error={errores.padreNombre} onChange={alNombre("padreNombre")} />
                <Campo etiqueta="Primer apellido del padre" obligatorio maxLength={MAX_APELLIDO_CICA} placeholder="Ej: Pérez" valor={form.padreApellido1} error={errores.padreApellido1} onChange={alApellido("padreApellido1")} />
                <Campo etiqueta="Segundo apellido del padre" maxLength={MAX_APELLIDO_CICA} placeholder="Ej: Gómez" valor={form.padreApellido2} error={errores.padreApellido2} onChange={alApellido("padreApellido2")} />
                <Campo etiqueta="Nombre de la madre" obligatorio maxLength={MAX_NOMBRE_CICA} placeholder="Ej: María" valor={form.madreNombre} error={errores.madreNombre} onChange={alNombre("madreNombre")} />
                <Campo etiqueta="Primer apellido de la madre" obligatorio maxLength={MAX_APELLIDO_CICA} placeholder="Ej: López" valor={form.madreApellido1} error={errores.madreApellido1} onChange={alApellido("madreApellido1")} />
                <Campo etiqueta="Segundo apellido de la madre" maxLength={MAX_APELLIDO_CICA} placeholder="Ej: Vargas" valor={form.madreApellido2} error={errores.madreApellido2} onChange={alApellido("madreApellido2")} />
                <Campo etiqueta="Dirección del hogar" obligatorio maxLength={MAX_DIRECCION_CICA} mostrarContador placeholder="Ej: 200 m norte de la iglesia, Nicoya" valor={form.direccionHogar} error={errores.direccionHogar} onChange={(valor) => set("direccionHogar", valor.slice(0, MAX_DIRECCION_CICA))} className="sm:col-span-3" />
              </fieldset>

              <fieldset
                className={
                  errores.esCatolico
                    ? "rounded-xl border border-red-400 bg-danger-bg p-3"
                    : undefined
                }
                aria-invalid={Boolean(errores.esCatolico)}
              >
                <legend className="mb-2 font-heading text-lg font-extrabold text-royal-blue">
                  ¿Usted es?
                </legend>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="religion"
                      checked={form.esCatolico === "si"}
                      aria-invalid={Boolean(errores.esCatolico)}
                      onChange={() => set("esCatolico", "si")}
                    />
                    Católico
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="religion"
                      checked={form.esCatolico === "no"}
                      aria-invalid={Boolean(errores.esCatolico)}
                      onChange={() => set("esCatolico", "no")}
                    />
                    Otra iglesia
                  </label>
                </div>
                <FieldError message={errores.esCatolico} />
                {form.esCatolico === "no" && (
                  <Campo
                    etiqueta="¿Cuál?"
                    obligatorio
                    maxLength={MAX_NOMBRE_CICA}
                    placeholder="Ej: Iglesia evangélica"
                    valor={form.otraIglesia}
                    error={errores.otraIglesia}
                    onChange={alNombre("otraIglesia")}
                    className="mt-3"
                  />
                )}
              </fieldset>

              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <Label className="mb-0">Alguna observación</Label>
                  <span className="text-xs text-text-muted">
                    {form.observacion.length}/{MAX_TEXTO_CICA}
                  </span>
                </div>
                <Textarea
                  rows={3}
                  maxLength={MAX_TEXTO_CICA}
                  placeholder="Ej: Prefiere el grupo de los sábados."
                  value={form.observacion}
                  hasError={Boolean(errores.observacion)}
                  onChange={(event) =>
                    set("observacion", event.target.value.slice(0, MAX_TEXTO_CICA))
                  }
                />
                <FieldError message={errores.observacion} />
              </div>

              <FieldError message={errorEnvio} />
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

export default CicaPage;
