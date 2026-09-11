import { useState } from "react";
import {
  Button,
  cn,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
} from "../../../shared/ui";
import { FILIALES_CATEQUESIS } from "../constants/filialesCatequesis";
import { NIVELES_CATEQUESIS } from "../constants/nivelesCatequesis";
import { MONTO_INSCRIPCION_CATEQUESIS } from "../constants/catequesisInformacion";
import { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";
import { soloLetras } from "../../../shared/utils/formValidation";

interface CatequesisFormProps {
  onSubmit: (data: CatequesisEnrollmentData) => void;
  loading: boolean;
}

const getInitialFormState = (): CatequesisEnrollmentData => ({
  catequesis: {
    centroCatequesis: null,
    nivelAInscribirse: null,
    feBautismoArchivo: null,
  },

  catequizando: {
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    fechaNacimiento: null,
    direccion: {
      direccionExacta: null,
    },
    bautismo: {
      parroquia: null,
      fecha: null,
      tomo: null,
      folio: null,
      asiento: null,
    },
    adecuacion: {
      requiereAdecuacionCentroEducativo: null,
      descripcionAdecuacion: null,
    },
    condicionSalud: {
      portadorEnfermedadCronica: null,
      descripcionEnfermedad: null,
    },
  },

  madreCatequizando: {
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    direccion: {
      direccionExacta: null,
      ciudad: null,
      provincia: null,
    },
    telefono: "",
  },

  padreCatequizando: {
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
  },

  inscripcion: {
    personaQueInscribe: {
      nombre: null,
      primerApellido: null,
      segundoApellido: null,
      correo: null,
      telefono: null,
    },
    parentesco: null,
    pago: {
      numeroComprobanteSINPE: "",
      archivoComprobante: null,
      fechaPago: null,
    },
  },
});

const infoBoxClass =
  "mb-4 rounded-2xl border border-royal-gold/40 bg-royal-gold/10 p-3.5 text-sm leading-relaxed text-gray-600 sm:p-4";
const MAX_CHARACTERS = 50;

const limitarCaracteres = (valor: string): string =>
  valor.slice(0, MAX_CHARACTERS);
const limitarPalabras = limitarCaracteres;
const limitarNombre = (valor: string): string =>
  limitarPalabras(soloLetras(valor));

const calcularEdad = (fecha: string): number | null => {
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }
  return edad;
};

const mensajeFechaNacimientoCatequizando = (
  fecha: string | null,
): string | null => {
  if (!fecha) return "Digite la fecha de nacimiento.";

  const edad = calcularEdad(fecha);
  if (edad === null || edad < 5 || edad > 15) {
    return "La edad del catequizando no aplica. Debe tener entre 5 y 15 años.";
  }

  return null;
};
const limitarTelefono = (valor: string): string =>
  valor.replace(/\D/g, "").slice(0, 8);

const contarCaracteres = (valor: string): number => valor.length;

const WordCounter = ({ value }: { value: string }) => (
  <span className="text-right text-[0.72rem] font-medium text-text-muted">
    {contarCaracteres(value)}/{MAX_CHARACTERS} caracteres
  </span>
);

function CampoApellido({
  label,
  required = false,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-black text-royal-blue">
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(limitarNombre(e.target.value))}
      />
      <WordCounter value={value} />
      {error && (
        <p className="m-0 text-xs font-extrabold text-red-600">{error}</p>
      )}
    </div>
  );
}

const fileInputClass = cn(
  "cursor-pointer p-2.5",
  "file:mr-3 file:cursor-pointer file:rounded-[10px] file:border-0 file:bg-royal-blue file:px-3.5 file:py-2 file:text-xs file:font-extrabold file:text-white",
  "hover:file:bg-royal-gold hover:file:text-royal-blue",
);

const CatequesisForm = ({ onSubmit, loading }: CatequesisFormProps) => {
  const [form, setForm] = useState<CatequesisEnrollmentData>(
    getInitialFormState(),
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aceptaLineamientos, setAceptaLineamientos] = useState(false);
  const [tienePadre, setTienePadre] = useState<boolean | null>(null);
  const [tieneMadre, setTieneMadre] = useState<boolean | null>(null);

  const updateForm = (path: string, value: unknown) => {
    setForm((prev) => {
      const copy = structuredClone(prev) as any;
      const keys = path.split(".");
      let current = copy;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.catequesis.centroCatequesis) {
      newErrors.centroCatequesis = "Seleccione el centro de catequesis.";
    }

    if (!form.catequesis.nivelAInscribirse) {
      newErrors.nivelAInscribirse = "Seleccione el nivel a inscribirse.";
    }

    if (!form.catequesis.feBautismoArchivo) {
      newErrors.feBautismoArchivo = "Debe adjuntar la fe de bautismo.";
    }

    if (!form.catequizando.nombre.trim()) {
      newErrors.nombreCatequizando = "Digite el nombre del catequizando.";
    }

    if (!form.catequizando.primerApellido.trim()) {
      newErrors.primerApellidoCatequizando =
        "Digite el primer apellido del catequizando.";
    }

    const errorFechaNacimiento = mensajeFechaNacimientoCatequizando(
      form.catequizando.fechaNacimiento,
    );
    if (errorFechaNacimiento) {
      newErrors.fechaNacimiento = errorFechaNacimiento;
    }

    if (!form.catequizando.direccion.direccionExacta?.trim()) {
      newErrors.direccionExacta = "Digite la dirección exacta.";
    }

    if (!form.catequizando.bautismo.parroquia?.trim()) {
      newErrors.parroquiaBautismo = "Digite la parroquia de bautismo.";
    }

    if (
      form.catequizando.adecuacion.requiereAdecuacionCentroEducativo === null
    ) {
      newErrors.requiereAdecuacion = "Indique si requiere adecuación.";
    }

    if (
      form.catequizando.adecuacion.requiereAdecuacionCentroEducativo === true &&
      !form.catequizando.adecuacion.descripcionAdecuacion?.trim()
    ) {
      newErrors.descripcionAdecuacion = "Describa la adecuación requerida.";
    }

    if (form.catequizando.condicionSalud.portadorEnfermedadCronica === null) {
      newErrors.portadorEnfermedad = "Indique si tiene enfermedad crónica.";
    }

    if (
      form.catequizando.condicionSalud.portadorEnfermedadCronica === true &&
      !form.catequizando.condicionSalud.descripcionEnfermedad?.trim()
    ) {
      newErrors.descripcionEnfermedad = "Describa la enfermedad crónica.";
    }

    if (!form.inscripcion.personaQueInscribe.nombre?.trim()) {
      newErrors.nombrePersonaInscribe =
        "Digite el nombre de la persona que inscribe.";
    }

    if (!form.inscripcion.personaQueInscribe.primerApellido?.trim()) {
      newErrors.primerApellidoPersonaInscribe =
        "Digite el primer apellido de la persona que inscribe.";
    }

    if (!form.inscripcion.parentesco) {
      newErrors.parentesco = "Seleccione el parentesco.";
    }

    const correo = form.inscripcion.personaQueInscribe.correo?.trim() ?? "";
    if (!correo) {
      newErrors.correoPersonaInscribe =
        "Digite el correo de la persona que inscribe.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correoPersonaInscribe = "Digite un correo válido.";
    }

    if (
      !/^\d{8}$/.test(form.inscripcion.personaQueInscribe.telefono ?? "")
    ) {
      newErrors.telefonoPersonaInscribe =
        "El teléfono debe contener 8 dígitos.";
    }

    if (!form.inscripcion.pago.numeroComprobanteSINPE.trim()) {
      newErrors.numeroComprobanteSINPE =
        "Digite el número de comprobante SINPE.";
    }

    if (!form.inscripcion.pago.archivoComprobante) {
      newErrors.archivoComprobante = "Debe adjuntar el comprobante de pago.";
    }

    if (tieneMadre) {
      if (!form.madreCatequizando.nombre.trim()) {
        newErrors.nombreMadre = "Digite el nombre de la madre o encargada.";
      }

      if (!form.madreCatequizando.primerApellido.trim()) {
        newErrors.primerApellidoMadre =
          "Digite el primer apellido de la madre o encargada.";
      }

      if (!form.madreCatequizando.direccion.direccionExacta?.trim()) {
        newErrors.direccionMadre = "Digite la dirección exacta.";
      }

      if (!form.madreCatequizando.direccion.ciudad?.trim()) {
        newErrors.ciudadMadre = "Digite la ciudad.";
      }

      if (!form.madreCatequizando.direccion.provincia?.trim()) {
        newErrors.provinciaMadre = "Digite la provincia.";
      }

      if (!/^\d{8}$/.test(form.madreCatequizando.telefono)) {
        newErrors.telefonoMadre = "El teléfono debe contener 8 dígitos.";
      }
    }

    if (!aceptaLineamientos) {
      newErrors.lineamientos = "Debe aceptar los lineamientos de catequesis.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.catequizando.nombre.trim()) {
        stepErrors.nombreCatequizando = "Digite el nombre del catequizando.";
      }
      if (!form.catequizando.primerApellido.trim()) {
        stepErrors.primerApellidoCatequizando =
          "Digite el primer apellido del catequizando.";
      }
      const errorFechaNacimiento = mensajeFechaNacimientoCatequizando(
        form.catequizando.fechaNacimiento,
      );
      if (errorFechaNacimiento) {
        stepErrors.fechaNacimiento = errorFechaNacimiento;
      }
      if (!form.catequizando.direccion.direccionExacta?.trim()) {
        stepErrors.direccionExacta = "Digite la dirección exacta.";
      }
    }

    if (step === 2) {
      if (!form.catequesis.centroCatequesis) {
        stepErrors.centroCatequesis = "Seleccione el centro de catequesis.";
      }
      if (!form.catequesis.nivelAInscribirse) {
        stepErrors.nivelAInscribirse = "Seleccione el nivel a inscribirse.";
      }
      if (!form.catequesis.feBautismoArchivo) {
        stepErrors.feBautismoArchivo = "Debe adjuntar la fe de bautismo.";
      }
    }

    if (step === 3 && !form.catequizando.bautismo.parroquia?.trim()) {
      stepErrors.parroquiaBautismo = "Digite la parroquia de bautismo.";
    }

    if (step === 4) {
      if (
        form.catequizando.adecuacion.requiereAdecuacionCentroEducativo === null
      ) {
        stepErrors.requiereAdecuacion = "Indique si requiere adecuación.";
      } else if (
        form.catequizando.adecuacion.requiereAdecuacionCentroEducativo &&
        !form.catequizando.adecuacion.descripcionAdecuacion?.trim()
      ) {
        stepErrors.descripcionAdecuacion = "Describa la adecuación requerida.";
      }
      if (form.catequizando.condicionSalud.portadorEnfermedadCronica === null) {
        stepErrors.portadorEnfermedad = "Indique si tiene enfermedad crónica.";
      } else if (
        form.catequizando.condicionSalud.portadorEnfermedadCronica &&
        !form.catequizando.condicionSalud.descripcionEnfermedad?.trim()
      ) {
        stepErrors.descripcionEnfermedad = "Describa la enfermedad crónica.";
      }
    }

    if (step === 5) {
      if (!form.inscripcion.personaQueInscribe.nombre?.trim())
        stepErrors.nombrePersonaInscribe =
          "Digite el nombre de la persona que inscribe.";
      if (!form.inscripcion.personaQueInscribe.primerApellido?.trim())
        stepErrors.primerApellidoPersonaInscribe =
          "Digite el primer apellido de la persona que inscribe.";
      if (!form.inscripcion.parentesco)
        stepErrors.parentesco = "Seleccione el parentesco.";
      const correo = form.inscripcion.personaQueInscribe.correo?.trim() ?? "";
      if (!correo)
        stepErrors.correoPersonaInscribe =
          "Digite el correo de la persona que inscribe.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
        stepErrors.correoPersonaInscribe = "Digite un correo válido.";
      if (
        !/^\d{8}$/.test(form.inscripcion.personaQueInscribe.telefono ?? "")
      ) {
        stepErrors.telefonoPersonaInscribe =
          "El teléfono debe contener 8 dígitos.";
      }
    }

    if (step === 6) {
      if (tieneMadre === null) {
        stepErrors.tieneMadre =
          "Indique si la madre es parte del núcleo familiar.";
      } else if (tieneMadre) {
        if (!form.madreCatequizando.nombre.trim())
          stepErrors.nombreMadre = "Digite el nombre de la madre o encargada.";
        if (!form.madreCatequizando.primerApellido.trim())
          stepErrors.primerApellidoMadre =
            "Digite el primer apellido de la madre o encargada.";
        if (!form.madreCatequizando.direccion.direccionExacta?.trim())
          stepErrors.direccionMadre = "Digite la dirección exacta.";
        if (!form.madreCatequizando.direccion.ciudad?.trim())
          stepErrors.ciudadMadre = "Digite la ciudad.";
        if (!form.madreCatequizando.direccion.provincia?.trim())
          stepErrors.provinciaMadre = "Digite la provincia.";
        if (!/^\d{8}$/.test(form.madreCatequizando.telefono)) {
          stepErrors.telefonoMadre = "El teléfono debe contener 8 dígitos.";
        }
      }

      if (tienePadre === null) {
        stepErrors.tienePadre =
          "Indique si el padre es parte del núcleo familiar.";
      } else if (tienePadre) {
        if (!form.padreCatequizando.nombre.trim()) {
          stepErrors.nombrePadre = "Digite el nombre del padre.";
        }
        if (!form.padreCatequizando.primerApellido.trim()) {
          stepErrors.primerApellidoPadre =
            "Digite el primer apellido del padre.";
        }
        if (
          form.padreCatequizando.telefono &&
          !/^\d{8}$/.test(form.padreCatequizando.telefono)
        ) {
          stepErrors.telefonoPadre = "El teléfono debe contener 8 dígitos.";
        }
      }
    }

    if (step === 7) {
      if (!form.inscripcion.pago.numeroComprobanteSINPE.trim())
        stepErrors.numeroComprobanteSINPE =
          "Digite el número de comprobante SINPE.";
      if (!form.inscripcion.pago.archivoComprobante)
        stepErrors.archivoComprobante = "Debe adjuntar el comprobante de pago.";
    }

    if (step === 8 && !aceptaLineamientos) {
      stepErrors.lineamientos = "Debe aceptar los lineamientos de catequesis.";
    }

    setErrors((previous) => ({ ...previous, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((step) => Math.min(step + 1, 8));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const stepTitles = [
    "Datos del catequizando",
    "Datos de catequesis",
    "Datos de bautismo",
    "Adecuación y salud",
    "Datos del encargado",
    "Datos de los padres (opcional)",
    "Inscripción y pago",
    "Lineamientos",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    for (let step = 1; step <= 8; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setShowSubmitConfirmation(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirmation(false);
    onSubmit(form);
  };

  return (
    <form
      className="mx-auto mt-6 flex w-full max-w-[1100px] flex-col gap-5 px-3.5 sm:mt-10 sm:gap-7 sm:px-5"
      onSubmit={handleSubmit}
    >
      {currentStep === 2 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Datos de Catequesis
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Seleccione el centro y el nivel al que desea inscribir.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 2
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Centro de catequesis *
              </Label>
              <Select
                value={form.catequesis.centroCatequesis || ""}
                onChange={(e) =>
                  updateForm("catequesis.centroCatequesis", e.target.value)
                }
              >
                <option value="">Seleccione</option>
                {FILIALES_CATEQUESIS.map((filial) => (
                  <option
                    key={filial}
                    value={filial}
                  >
                    {filial}
                  </option>
                ))}
              </Select>
              {errors.centroCatequesis && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.centroCatequesis}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Nivel a inscribirse *
              </Label>
              <Select
                value={form.catequesis.nivelAInscribirse || ""}
                onChange={(e) =>
                  updateForm("catequesis.nivelAInscribirse", e.target.value)
                }
              >
                <option value="">Seleccione</option>
                {NIVELES_CATEQUESIS.map((nivel) => (
                  <option
                    key={nivel.value}
                    value={nivel.value}
                  >
                    {nivel.label}
                  </option>
                ))}
              </Select>
              {errors.nivelAInscribirse && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.nivelAInscribirse}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-black text-royal-blue">
                Adjuntar fe de bautismo *
              </Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={fileInputClass}
                onChange={(e) =>
                  updateForm(
                    "catequesis.feBautismoArchivo",
                    e.target.files?.[0] || null,
                  )
                }
              />
              {errors.feBautismoArchivo && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.feBautismoArchivo}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {currentStep === 1 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Datos del Catequizando
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Información personal del niño o joven que será inscrito.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 1
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Nombre *
              </Label>
              <Input
                type="text"
                placeholder="Ej: Carlos Emanuel"
                value={form.catequizando.nombre}
                onChange={(e) =>
                  updateForm(
                    "catequizando.nombre",
                    limitarNombre(e.target.value),
                  )
                }
              />
              <WordCounter value={form.catequizando.nombre} />
              {errors.nombreCatequizando && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.nombreCatequizando}
                </p>
              )}
            </div>

            <CampoApellido
              label="Primer apellido"
              required
              placeholder="Ej: Pérez"
              value={form.catequizando.primerApellido}
              error={errors.primerApellidoCatequizando}
              onChange={(valor) =>
                updateForm("catequizando.primerApellido", valor)
              }
            />
            <CampoApellido
              label="Segundo apellido"
              placeholder="Ej: Gómez"
              value={form.catequizando.segundoApellido}
              onChange={(valor) =>
                updateForm("catequizando.segundoApellido", valor)
              }
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Fecha de nacimiento *
              </Label>
              <Input
                type="date"
                value={form.catequizando.fechaNacimiento || ""}
                onChange={(e) => {
                  const valor = e.target.value;
                  updateForm("catequizando.fechaNacimiento", valor);
                  const mensaje = mensajeFechaNacimientoCatequizando(
                    valor || null,
                  );
                  setErrors((prev) => {
                    const siguiente = { ...prev };
                    if (mensaje) siguiente.fechaNacimiento = mensaje;
                    else delete siguiente.fechaNacimiento;
                    return siguiente;
                  });
                }}
              />
              {errors.fechaNacimiento && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.fechaNacimiento}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Dirección exacta *
              </Label>
              <Input
                type="text"
                placeholder="Ej: 200 m norte de la iglesia, casa azul"
                value={form.catequizando.direccion.direccionExacta || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.direccion.direccionExacta",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.catequizando.direccion.direccionExacta || ""}
              />
              {errors.direccionExacta && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.direccionExacta}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {currentStep === 3 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Datos de Bautismo
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Complete la información del registro de bautismo.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 3
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Parroquia *
              </Label>
              <Input
                type="text"
                placeholder="Ej: Parroquia San Blas"
                value={form.catequizando.bautismo.parroquia || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.bautismo.parroquia",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter value={form.catequizando.bautismo.parroquia || ""} />
              {errors.parroquiaBautismo && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.parroquiaBautismo}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Fecha de bautismo
              </Label>
              <Input
                type="date"
                value={form.catequizando.bautismo.fecha || ""}
                onChange={(e) =>
                  updateForm("catequizando.bautismo.fecha", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">Tomo</Label>
              <Input
                type="text"
                placeholder="Ej: 12"
                value={form.catequizando.bautismo.tomo || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.bautismo.tomo",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter value={form.catequizando.bautismo.tomo || ""} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Folio
              </Label>
              <Input
                type="text"
                placeholder="Ej: 45"
                value={form.catequizando.bautismo.folio || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.bautismo.folio",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter value={form.catequizando.bautismo.folio || ""} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Asiento
              </Label>
              <Input
                type="text"
                placeholder="Ej: 123"
                value={form.catequizando.bautismo.asiento || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.bautismo.asiento",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter value={form.catequizando.bautismo.asiento || ""} />
            </div>
          </div>
        </section>
      )}

      {currentStep === 4 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Adecuación y Salud del Catequizando
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Información educativa y de salud relevante para catequesis.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 4
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                ¿Requiere adecuación en el centro educativo? *
              </Label>
              <Select
                value={
                  form.catequizando.adecuacion
                    .requiereAdecuacionCentroEducativo === null
                    ? ""
                    : form.catequizando.adecuacion
                          .requiereAdecuacionCentroEducativo
                      ? "si"
                      : "no"
                }
                onChange={(e) =>
                  updateForm(
                    "catequizando.adecuacion.requiereAdecuacionCentroEducativo",
                    e.target.value === "si",
                  )
                }
              >
                <option value="">Seleccione</option>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </Select>
              {errors.requiereAdecuacion && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.requiereAdecuacion}
                </p>
              )}
            </div>

            {form.catequizando.adecuacion.requiereAdecuacionCentroEducativo && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-black text-royal-blue">
                  Descripción de la adecuación *
                </Label>
                <Textarea
                  placeholder="Ej: Requiere apoyo adicional para actividades de lectura."
                  value={
                    form.catequizando.adecuacion.descripcionAdecuacion || ""
                  }
                  onChange={(e) =>
                    updateForm(
                      "catequizando.adecuacion.descripcionAdecuacion",
                      limitarPalabras(e.target.value),
                    )
                  }
                />
                <WordCounter
                  value={
                    form.catequizando.adecuacion.descripcionAdecuacion || ""
                  }
                />
                {errors.descripcionAdecuacion && (
                  <p className="m-0 text-xs font-extrabold text-red-600">
                    {errors.descripcionAdecuacion}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                ¿Es portador de enfermedad crónica? *
              </Label>
              <Select
                value={
                  form.catequizando.condicionSalud.portadorEnfermedadCronica ===
                  null
                    ? ""
                    : form.catequizando.condicionSalud.portadorEnfermedadCronica
                      ? "si"
                      : "no"
                }
                onChange={(e) =>
                  updateForm(
                    "catequizando.condicionSalud.portadorEnfermedadCronica",
                    e.target.value === "si",
                  )
                }
              >
                <option value="">Seleccione</option>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </Select>
              {errors.portadorEnfermedad && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.portadorEnfermedad}
                </p>
              )}
            </div>

            {form.catequizando.condicionSalud.portadorEnfermedadCronica && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-black text-royal-blue">
                  Descripción de enfermedad *
                </Label>
                <Textarea
                  placeholder="Ej: Alergia a la penicilina."
                  value={
                    form.catequizando.condicionSalud.descripcionEnfermedad || ""
                  }
                  onChange={(e) =>
                    updateForm(
                      "catequizando.condicionSalud.descripcionEnfermedad",
                      limitarPalabras(e.target.value),
                    )
                  }
                />
                <WordCounter
                  value={
                    form.catequizando.condicionSalud.descripcionEnfermedad || ""
                  }
                />
                {errors.descripcionEnfermedad && (
                  <p className="m-0 text-xs font-extrabold text-red-600">
                    {errors.descripcionEnfermedad}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {currentStep === 5 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Datos del Encargado
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Información de la persona que inscribe al catequizando.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 5
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Nombre *
              </Label>
              <Input
                type="text"
                placeholder="Ej: Ana María"
                value={form.inscripcion.personaQueInscribe.nombre || ""}
                onChange={(e) =>
                  updateForm(
                    "inscripcion.personaQueInscribe.nombre",
                    limitarNombre(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.inscripcion.personaQueInscribe.nombre || ""}
              />
              {errors.nombrePersonaInscribe && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.nombrePersonaInscribe}
                </p>
              )}
            </div>

            <CampoApellido
              label="Primer apellido"
              required
              placeholder="Ej: Rodríguez"
              value={form.inscripcion.personaQueInscribe.primerApellido || ""}
              error={errors.primerApellidoPersonaInscribe}
              onChange={(valor) =>
                updateForm(
                  "inscripcion.personaQueInscribe.primerApellido",
                  valor,
                )
              }
            />
            <CampoApellido
              label="Segundo apellido"
              placeholder="Ej: Vargas"
              value={form.inscripcion.personaQueInscribe.segundoApellido || ""}
              onChange={(valor) =>
                updateForm(
                  "inscripcion.personaQueInscribe.segundoApellido",
                  valor,
                )
              }
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Correo electrónico *
              </Label>
              <Input
                type="email"
                placeholder="Ej: ana.rodriguez@correo.com"
                value={form.inscripcion.personaQueInscribe.correo || ""}
                onChange={(e) =>
                  updateForm(
                    "inscripcion.personaQueInscribe.correo",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.inscripcion.personaQueInscribe.correo || ""}
              />
              {errors.correoPersonaInscribe && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.correoPersonaInscribe}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Teléfono *
              </Label>
              <Input
                type="text"
                placeholder="Ej: 8888-8888"
                inputMode="numeric"
                maxLength={8}
                value={form.inscripcion.personaQueInscribe.telefono || ""}
                onChange={(e) =>
                  updateForm(
                    "inscripcion.personaQueInscribe.telefono",
                    limitarTelefono(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.inscripcion.personaQueInscribe.telefono || ""}
              />
              {errors.telefonoPersonaInscribe && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.telefonoPersonaInscribe}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Parentesco *
              </Label>
              <Select
                value={form.inscripcion.parentesco || ""}
                onChange={(e) =>
                  updateForm("inscripcion.parentesco", e.target.value)
                }
              >
                <option value="">Seleccione</option>
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Abuelo(a)">Abuelo(a)</option>
                <option value="Tutor Legal">Tutor Legal</option>
                <option value="Otro">Otro</option>
              </Select>
              {errors.parentesco && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.parentesco}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {currentStep === 6 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Datos de los Padres (opcional)
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Indique si la madre y el padre forman parte del núcleo familiar.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 6
            </span>
          </div>

          <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border-strong bg-surface-muted/40 p-4 sm:p-5">
          <h3 className="m-0 mb-4 font-heading text-lg font-extrabold text-royal-blue">
            Datos de la madre
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-black text-royal-blue">
                ¿La madre es parte del núcleo familiar? *
              </Label>
              <Select
                value={
                  tieneMadre === null ? "" : tieneMadre ? "si" : "no"
                }
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor === "") {
                    setTieneMadre(null);
                    return;
                  }

                  const seleccionaSi = valor === "si";
                  setTieneMadre(seleccionaSi);
                  setErrors((prev) => {
                    const siguiente = { ...prev };
                    delete siguiente.tieneMadre;
                    delete siguiente.nombreMadre;
                    delete siguiente.primerApellidoMadre;
                    delete siguiente.direccionMadre;
                    delete siguiente.ciudadMadre;
                    delete siguiente.provinciaMadre;
                    delete siguiente.telefonoMadre;
                    return siguiente;
                  });

                  if (!seleccionaSi) {
                    setForm((prev) => ({
                      ...prev,
                      madreCatequizando: {
                        nombre: "",
                        primerApellido: "",
                        segundoApellido: "",
                        direccion: {
                          direccionExacta: null,
                          ciudad: null,
                          provincia: null,
                        },
                        telefono: "",
                      },
                    }));
                  }
                }}
              >
                <option value="">Seleccione</option>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </Select>
              {errors.tieneMadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.tieneMadre}
                </p>
              )}
            </div>

            {tieneMadre && (
              <>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Nombre *
              </Label>
              <Input
                type="text"
                placeholder="Ej: María Elena"
                value={form.madreCatequizando.nombre}
                onChange={(e) =>
                  updateForm(
                    "madreCatequizando.nombre",
                    limitarNombre(e.target.value),
                  )
                }
              />
              <WordCounter value={form.madreCatequizando.nombre} />
              {errors.nombreMadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.nombreMadre}
                </p>
              )}
            </div>

            <CampoApellido
              label="Primer apellido"
              required
              placeholder="Ej: Rodríguez"
              value={form.madreCatequizando.primerApellido}
              error={errors.primerApellidoMadre}
              onChange={(valor) =>
                updateForm("madreCatequizando.primerApellido", valor)
              }
            />
            <CampoApellido
              label="Segundo apellido"
              placeholder="Ej: Vargas"
              value={form.madreCatequizando.segundoApellido}
              onChange={(valor) =>
                updateForm("madreCatequizando.segundoApellido", valor)
              }
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Dirección exacta *
              </Label>
              <Input
                type="text"
                placeholder="Ej: 200 m norte de la iglesia, casa azul"
                value={form.madreCatequizando.direccion.direccionExacta || ""}
                onChange={(e) =>
                  updateForm(
                    "madreCatequizando.direccion.direccionExacta",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.madreCatequizando.direccion.direccionExacta || ""}
              />
              {errors.direccionMadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.direccionMadre}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Ciudad *
              </Label>
              <Input
                type="text"
                placeholder="Ej: Nicoya"
                value={form.madreCatequizando.direccion.ciudad || ""}
                onChange={(e) =>
                  updateForm(
                    "madreCatequizando.direccion.ciudad",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.madreCatequizando.direccion.ciudad || ""}
              />
              {errors.ciudadMadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.ciudadMadre}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Provincia *
              </Label>
              <Input
                type="text"
                placeholder="Ej: Guanacaste"
                value={form.madreCatequizando.direccion.provincia || ""}
                onChange={(e) =>
                  updateForm(
                    "madreCatequizando.direccion.provincia",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.madreCatequizando.direccion.provincia || ""}
              />
              {errors.provinciaMadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.provinciaMadre}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Teléfono *
              </Label>
              <Input
                type="text"
                placeholder="Ej: 8888-8888"
                inputMode="numeric"
                maxLength={8}
                value={form.madreCatequizando.telefono}
                onChange={(e) =>
                  updateForm(
                    "madreCatequizando.telefono",
                    limitarTelefono(e.target.value),
                  )
                }
              />
              <WordCounter value={form.madreCatequizando.telefono} />
              {errors.telefonoMadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.telefonoMadre}
                </p>
              )}
            </div>
              </>
            )}
          </div>
          </div>

          <div className="rounded-2xl border border-border-strong bg-surface-muted/40 p-4 sm:p-5">
          <h3 className="m-0 mb-4 font-heading text-lg font-extrabold text-royal-blue">
            Datos del padre
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-black text-royal-blue">
                ¿El padre es parte del núcleo familiar? *
              </Label>
              <Select
                value={
                  tienePadre === null ? "" : tienePadre ? "si" : "no"
                }
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor === "") {
                    setTienePadre(null);
                    return;
                  }

                  const seleccionaSi = valor === "si";
                  setTienePadre(seleccionaSi);
                  setErrors((prev) => {
                    const siguiente = { ...prev };
                    delete siguiente.tienePadre;
                    delete siguiente.nombrePadre;
                    delete siguiente.primerApellidoPadre;
                    delete siguiente.telefonoPadre;
                    return siguiente;
                  });

                  if (!seleccionaSi) {
                    setForm((prev) => ({
                      ...prev,
                      padreCatequizando: {
                        nombre: "",
                        primerApellido: "",
                        segundoApellido: "",
                        telefono: "",
                      },
                    }));
                  }
                }}
              >
                <option value="">Seleccione</option>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </Select>
              {errors.tienePadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.tienePadre}
                </p>
              )}
            </div>

            {tienePadre && (
              <>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Nombre *
              </Label>
              <Input
                type="text"
                placeholder="Ej: Juan Carlos"
                value={form.padreCatequizando.nombre}
                onChange={(e) =>
                  updateForm(
                    "padreCatequizando.nombre",
                    limitarNombre(e.target.value),
                  )
                }
              />
              <WordCounter value={form.padreCatequizando.nombre} />
              {errors.nombrePadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.nombrePadre}
                </p>
              )}
            </div>

            <CampoApellido
              label="Primer apellido"
              required
              placeholder="Ej: Rodríguez"
              value={form.padreCatequizando.primerApellido}
              error={errors.primerApellidoPadre}
              onChange={(valor) =>
                updateForm("padreCatequizando.primerApellido", valor)
              }
            />
            <CampoApellido
              label="Segundo apellido"
              placeholder="Ej: Vargas"
              value={form.padreCatequizando.segundoApellido}
              onChange={(valor) =>
                updateForm("padreCatequizando.segundoApellido", valor)
              }
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Teléfono
              </Label>
              <Input
                type="text"
                placeholder="Ej: 8888-8888"
                inputMode="numeric"
                maxLength={8}
                value={form.padreCatequizando.telefono}
                onChange={(e) =>
                  updateForm(
                    "padreCatequizando.telefono",
                    limitarTelefono(e.target.value),
                  )
                }
              />
              <WordCounter value={form.padreCatequizando.telefono} />
              {errors.telefonoPadre && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.telefonoPadre}
                </p>
              )}
            </div>
              </>
            )}
          </div>
          </div>
          </div>
        </section>
      )}

      {currentStep === 7 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Inscripción y Pago
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Datos del comprobante SINPE.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 7
            </span>
          </div>

          <div className={infoBoxClass}>
            <p>
              El pago de inscripción es de{" "}
              <strong>{MONTO_INSCRIPCION_CATEQUESIS}</strong>.
            </p>
            <p>
              <strong>SINPE Parroquia:</strong> 8878-3025
            </p>
            <p>
              <strong>Enviar comprobante al:</strong> 6416-7863
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">
                Número de comprobante SINPE *
              </Label>
              <Input
                type="text"
                placeholder="Ej: SINPE-123456"
                value={form.inscripcion.pago.numeroComprobanteSINPE}
                onChange={(e) =>
                  updateForm(
                    "inscripcion.pago.numeroComprobanteSINPE",
                    limitarPalabras(e.target.value),
                  )
                }
              />
              <WordCounter
                value={form.inscripcion.pago.numeroComprobanteSINPE}
              />
              {errors.numeroComprobanteSINPE && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.numeroComprobanteSINPE}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-black text-royal-blue">
                Archivo del comprobante *
              </Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={fileInputClass}
                onChange={(e) =>
                  updateForm(
                    "inscripcion.pago.archivoComprobante",
                    e.target.files?.[0] || null,
                  )
                }
              />
              {errors.archivoComprobante && (
                <p className="m-0 text-xs font-extrabold text-red-600">
                  {errors.archivoComprobante}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {currentStep === 8 && (
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">
                Lineamientos de Catequesis
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Lea el documento de lineamientos antes de enviar la inscripción.
              </p>
            </div>
            <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">
              Paso 8
            </span>
          </div>

          <div className={infoBoxClass}>
            <p>
              Antes de enviar la solicitud, debe leer y aceptar los lineamientos
              de catequesis.
            </p>

            <a
              href="/lineamientos-catequesis-24-25.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex font-bold text-royal-blue underline underline-offset-[3px] hover:text-royal-gold-muted"
            >
              Descargar lineamientos de catequesis
            </a>

            <label className="mt-3 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-royal-blue"
                checked={aceptaLineamientos}
                onChange={(e) => setAceptaLineamientos(e.target.checked)}
              />
              <span className="text-sm text-gray-600">
                Confirmo que he leído y acepto los lineamientos de catequesis.
              </span>
            </label>

            {errors.lineamientos && (
              <p className="m-0 text-xs font-extrabold text-red-600">
                {errors.lineamientos}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="order-first rounded-[18px] border border-border bg-surface p-4 shadow-sm sm:rounded-[22px] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-black tracking-wider text-royal-blue uppercase">
            Paso {currentStep} de {stepTitles.length}
          </span>
          <span className="text-right text-xs font-semibold text-text-muted">
            {stepTitles[currentStep - 1]}
          </span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-royal-blue transition-[width] duration-300"
            style={{ width: `${(currentStep / stepTitles.length) * 100}%` }}
          />
        </div>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8"
          role="tablist"
          aria-label="Ir a un paso del formulario"
        >
          {stepTitles.map((title, index) => {
            const step = index + 1;
            const isActive = currentStep === step;

            return (
              <button
                key={title}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Ir al paso ${step}: ${title}`}
                onClick={() => setCurrentStep(step)}
                disabled={loading}
                className={cn(
                  "min-h-9 rounded-lg border px-2 py-1.5 text-[0.68rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-royal-gold/40 disabled:cursor-not-allowed disabled:opacity-60",
                  isActive
                    ? "border-royal-blue bg-royal-blue text-white"
                    : "border-border-strong bg-surface-muted text-text-secondary hover:border-royal-blue hover:text-royal-blue",
                )}
              >
                <span className="block">Paso {step}</span>
                <span className="block truncate font-medium">{title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={handlePrevious}
          disabled={currentStep === 1 || loading}
        >
          Anterior
        </Button>
        {currentStep < stepTitles.length ? (
          <Button
            type="button"
            variant="royal"
            className="w-full sm:w-auto"
            onClick={handleNext}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="submit"
            variant="royal"
            className="w-full uppercase tracking-widest shadow-[0_14px_28px_rgba(0,51,102,0.18)] hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue hover:shadow-[0_16px_30px_rgba(212,175,55,0.25)] sm:w-auto"
            disabled={loading}
          >
            {loading ? "Enviando inscripción..." : "Enviar inscripción"}
          </Button>
        )}
      </div>

      {showSubmitConfirmation && (
        <Modal
          title="Confirmar inscripción"
          onClose={() => setShowSubmitConfirmation(false)}
        >
          <div className="flex flex-col gap-5 pr-8">
            <div>
              <h2 className="m-0 font-heading text-2xl font-extrabold text-royal-blue">
                ¿Todo listo?
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-text-secondary">
                Verifica que todos los datos sean correctos antes de enviar la
                inscripción. La información completa y precisa ayudará a que
                el trámite sea más rápido y <strong>evitará que sea devuelto.</strong>
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSubmitConfirmation(false)}
                disabled={loading}
              >
                Revisar datos
              </Button>
              <Button
                type="button"
                variant="royal"
                onClick={confirmSubmit}
                disabled={loading}
              >
                Confirmar y enviar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </form>
  );
};

export default CatequesisForm;
