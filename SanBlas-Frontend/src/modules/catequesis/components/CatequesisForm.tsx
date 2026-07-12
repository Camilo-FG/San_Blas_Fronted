import { useState } from "react";
import { Button, cn, Input, Label, Select, Textarea } from "../../../shared/ui";
import { FILIALES_CATEQUESIS } from "../constants/filialesCatequesis";
import { NIVELES_CATEQUESIS } from "../constants/nivelesCatequesis";
import { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";

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
    apellidos: "",
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
    apellidos: "",
    direccion: {
      direccionExacta: null,
      ciudad: null,
      provincia: null,
    },
    telefono: "",
  },

  padreCatequizando: {
    nombre: "",
    apellidos: "",
    telefono: "",
  },

  inscripcion: {
    personaQueInscribe: {
      nombre: null,
      apellido: null,
      correo: null,
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

const fileInputClass = cn(
  "cursor-pointer p-2.5",
  "file:mr-3 file:cursor-pointer file:rounded-[10px] file:border-0 file:bg-royal-blue file:px-3.5 file:py-2 file:text-xs file:font-extrabold file:text-white",
  "hover:file:bg-royal-gold hover:file:text-royal-blue",
);

const CatequesisForm = ({ onSubmit, loading }: CatequesisFormProps) => {
  const [form, setForm] = useState<CatequesisEnrollmentData>(
    getInitialFormState(),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aceptaLineamientos, setAceptaLineamientos] = useState(false);

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

    if (!form.catequizando.apellidos.trim()) {
      newErrors.apellidosCatequizando =
        "Digite los apellidos del catequizando.";
    }

    if (!form.catequizando.fechaNacimiento) {
      newErrors.fechaNacimiento = "Digite la fecha de nacimiento.";
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

    if (!form.inscripcion.personaQueInscribe.apellido?.trim()) {
      newErrors.apellidoPersonaInscribe =
        "Digite el apellido de la persona que inscribe.";
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

    if (!form.inscripcion.pago.numeroComprobanteSINPE.trim()) {
      newErrors.numeroComprobanteSINPE =
        "Digite el número de comprobante SINPE.";
    }

    if (!form.inscripcion.pago.archivoComprobante) {
      newErrors.archivoComprobante = "Debe adjuntar el comprobante de pago.";
    }

    // Datos de la madre/encargada — son obligatorios en el backend
    if (!form.madreCatequizando.nombre.trim()) {
      newErrors.nombreMadre = "Digite el nombre de la madre o encargada.";
    }

    if (!form.madreCatequizando.apellidos.trim()) {
      newErrors.apellidosMadre = "Digite los apellidos de la madre o encargada.";
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

    if (!form.madreCatequizando.telefono.trim()) {
      newErrors.telefonoMadre = "Digite el teléfono.";
    }

    if (!aceptaLineamientos) {
      newErrors.lineamientos = "Debe aceptar los lineamientos de catequesis.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(form);
  };

  return (
    <form
      className="mx-auto mt-6 flex max-w-[1100px] flex-col gap-5 px-3.5 sm:mt-10 sm:gap-7 sm:px-5"
      onSubmit={handleSubmit}
    >
      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Datos de Catequesis</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Seleccione el centro y el nivel al que desea inscribir.</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 1</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Centro de catequesis *</Label>
            <Select
              value={form.catequesis.centroCatequesis || ""}
              onChange={(e) =>
                updateForm("catequesis.centroCatequesis", e.target.value)
              }
            >
              <option value="">Seleccione</option>
              {FILIALES_CATEQUESIS.map((filial) => (
                <option key={filial} value={filial}>
                  {filial}
                </option>
              ))}
            </Select>
            {errors.centroCatequesis && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.centroCatequesis}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Nivel a inscribirse *</Label>
            <Select
              value={form.catequesis.nivelAInscribirse || ""}
              onChange={(e) =>
                updateForm("catequesis.nivelAInscribirse", e.target.value)
              }
            >
              <option value="">Seleccione</option>
              {NIVELES_CATEQUESIS.map((nivel) => (
                <option key={nivel.value} value={nivel.value}>
                  {nivel.label}
                </option>
              ))}
            </Select>
            {errors.nivelAInscribirse && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.nivelAInscribirse}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label className="text-xs font-black text-royal-blue">Adjuntar fe de bautismo *</Label>
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
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.feBautismoArchivo}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Datos del Catequizando</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Información personal del niño o joven que será inscrito.</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 2</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Nombre *</Label>
            <Input
              type="text"
              placeholder="Ej: Carlos Emanuel"
              value={form.catequizando.nombre}
              onChange={(e) =>
                updateForm("catequizando.nombre", e.target.value)
              }
            />
            {errors.nombreCatequizando && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.nombreCatequizando}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Apellidos *</Label>
            <Input
              type="text"
              placeholder="Ej: Pérez Gómez"
              value={form.catequizando.apellidos}
              onChange={(e) =>
                updateForm("catequizando.apellidos", e.target.value)
              }
            />
            {errors.apellidosCatequizando && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.apellidosCatequizando}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Fecha de nacimiento *</Label>
            <Input
              type="date"
              value={form.catequizando.fechaNacimiento || ""}
              onChange={(e) =>
                updateForm("catequizando.fechaNacimiento", e.target.value)
              }
            />
            {errors.fechaNacimiento && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.fechaNacimiento}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Dirección exacta *</Label>
            <Input
              type="text"
              placeholder="Dirección exacta"
              value={form.catequizando.direccion.direccionExacta || ""}
              onChange={(e) =>
                updateForm(
                  "catequizando.direccion.direccionExacta",
                  e.target.value,
                )
              }
            />
            {errors.direccionExacta && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.direccionExacta}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Datos de Bautismo</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Complete la información del registro de bautismo.</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 3</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Parroquia *</Label>
            <Input
              type="text"
              value={form.catequizando.bautismo.parroquia || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.parroquia", e.target.value)
              }
            />
            {errors.parroquiaBautismo && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.parroquiaBautismo}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Fecha de bautismo</Label>
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
              value={form.catequizando.bautismo.tomo || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.tomo", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Folio</Label>
            <Input
              type="text"
              value={form.catequizando.bautismo.folio || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.folio", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Asiento</Label>
            <Input
              type="text"
              value={form.catequizando.bautismo.asiento || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.asiento", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Adecuación y Salud del Catequizando</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Información educativa y de salud relevante para catequesis.</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 4</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">¿Requiere adecuación en el centro educativo? *</Label>
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
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.requiereAdecuacion}</p>
            )}
          </div>

          {form.catequizando.adecuacion.requiereAdecuacionCentroEducativo && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">Descripción de la adecuación *</Label>
              <Textarea
                value={form.catequizando.adecuacion.descripcionAdecuacion || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.adecuacion.descripcionAdecuacion",
                    e.target.value,
                  )
                }
              />
              {errors.descripcionAdecuacion && (
                <p className="m-0 text-xs font-extrabold text-red-600">{errors.descripcionAdecuacion}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">¿Es portador de enfermedad crónica? *</Label>
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
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.portadorEnfermedad}</p>
            )}
          </div>

          {form.catequizando.condicionSalud.portadorEnfermedadCronica && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-black text-royal-blue">Descripción de enfermedad *</Label>
              <Textarea
                value={
                  form.catequizando.condicionSalud.descripcionEnfermedad || ""
                }
                onChange={(e) =>
                  updateForm(
                    "catequizando.condicionSalud.descripcionEnfermedad",
                    e.target.value,
                  )
                }
              />
              {errors.descripcionEnfermedad && (
                <p className="m-0 text-xs font-extrabold text-red-600">{errors.descripcionEnfermedad}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Datos de la Madre o Encargada</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Información de contacto de la persona responsable.</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 5</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Nombre *</Label>
            <Input
              type="text"
              value={form.madreCatequizando.nombre}
              onChange={(e) =>
                updateForm("madreCatequizando.nombre", e.target.value)
              }
            />
            {errors.nombreMadre && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.nombreMadre}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Apellidos *</Label>
            <Input
              type="text"
              value={form.madreCatequizando.apellidos}
              onChange={(e) =>
                updateForm("madreCatequizando.apellidos", e.target.value)
              }
            />
            {errors.apellidosMadre && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.apellidosMadre}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Dirección exacta *</Label>
            <Input
              type="text"
              value={form.madreCatequizando.direccion.direccionExacta || ""}
              onChange={(e) =>
                updateForm(
                  "madreCatequizando.direccion.direccionExacta",
                  e.target.value,
                )
              }
            />
            {errors.direccionMadre && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.direccionMadre}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Ciudad *</Label>
            <Input
              type="text"
              value={form.madreCatequizando.direccion.ciudad || ""}
              onChange={(e) =>
                updateForm("madreCatequizando.direccion.ciudad", e.target.value)
              }
            />
            {errors.ciudadMadre && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.ciudadMadre}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Provincia *</Label>
            <Input
              type="text"
              value={form.madreCatequizando.direccion.provincia || ""}
              onChange={(e) =>
                updateForm(
                  "madreCatequizando.direccion.provincia",
                  e.target.value,
                )
              }
            />
            {errors.provinciaMadre && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.provinciaMadre}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Teléfono *</Label>
            <Input
              type="text"
              placeholder="0000-0000"
              value={form.madreCatequizando.telefono}
              onChange={(e) =>
                updateForm("madreCatequizando.telefono", e.target.value)
              }
            />
            {errors.telefonoMadre && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.telefonoMadre}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Datos del Padre</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Información de contacto del padre del catequizando (opcional).</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 6</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Nombre</Label>
            <Input
              type="text"
              value={form.padreCatequizando.nombre}
              onChange={(e) =>
                updateForm("padreCatequizando.nombre", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Apellidos</Label>
            <Input
              type="text"
              value={form.padreCatequizando.apellidos}
              onChange={(e) =>
                updateForm("padreCatequizando.apellidos", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Teléfono</Label>
            <Input
              type="text"
              placeholder="0000-0000"
              value={form.padreCatequizando.telefono}
              onChange={(e) =>
                updateForm("padreCatequizando.telefono", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Inscripción y Pago</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Datos de la persona que inscribe y comprobante SINPE.</p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 7</span>
        </div>

        <div className={infoBoxClass}>
          <p>
            <strong>SINPE Parroquia:</strong> 8878-3025
          </p>
          <p>
            <strong>Enviar comprobante al:</strong> 6416-7863
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Nombre de quien inscribe *</Label>
            <Input
              type="text"
              value={form.inscripcion.personaQueInscribe.nombre || ""}
              onChange={(e) =>
                updateForm(
                  "inscripcion.personaQueInscribe.nombre",
                  e.target.value,
                )
              }
            />
            {errors.nombrePersonaInscribe && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.nombrePersonaInscribe}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Apellido de quien inscribe *</Label>
            <Input
              type="text"
              value={form.inscripcion.personaQueInscribe.apellido || ""}
              onChange={(e) =>
                updateForm(
                  "inscripcion.personaQueInscribe.apellido",
                  e.target.value,
                )
              }
            />
            {errors.apellidoPersonaInscribe && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.apellidoPersonaInscribe}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Correo electrónico *</Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.inscripcion.personaQueInscribe.correo || ""}
              onChange={(e) =>
                updateForm(
                  "inscripcion.personaQueInscribe.correo",
                  e.target.value,
                )
              }
            />
            {errors.correoPersonaInscribe && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.correoPersonaInscribe}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Parentesco *</Label>
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
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.parentesco}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-black text-royal-blue">Número de comprobante SINPE *</Label>
            <Input
              type="text"
              value={form.inscripcion.pago.numeroComprobanteSINPE}
              onChange={(e) =>
                updateForm(
                  "inscripcion.pago.numeroComprobanteSINPE",
                  e.target.value,
                )
              }
            />
            {errors.numeroComprobanteSINPE && (
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.numeroComprobanteSINPE}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label className="text-xs font-black text-royal-blue">Archivo del comprobante *</Label>
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
              <p className="m-0 text-xs font-extrabold text-red-600">{errors.archivoComprobante}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-[22px] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-royal-gold/35 pb-3.5 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue sm:text-[23px]">Lineamientos de Catequesis</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              Lea el documento de lineamientos antes de enviar la inscripción.
            </p>
          </div>
          <span className="rounded-full border border-royal-gold/35 bg-royal-gold/15 px-3 py-1.5 text-xs font-black whitespace-nowrap text-royal-gold-muted">Sección 7</span>
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
            <p className="m-0 text-xs font-extrabold text-red-600">{errors.lineamientos}</p>
          )}
        </div>
      </section>

      <div className="flex justify-stretch pt-2.5 sm:justify-end">
        <Button
          type="submit"
          variant="royal"
          className="w-full uppercase tracking-widest shadow-[0_14px_28px_rgba(0,51,102,0.18)] hover:-translate-y-0.5 hover:bg-royal-gold hover:text-royal-blue hover:shadow-[0_16px_30px_rgba(212,175,55,0.25)] sm:w-auto"
          disabled={loading}
        >
          {loading ? "Enviando inscripción..." : "Enviar inscripción"}
        </Button>
      </div>
    </form>
  );
};

export default CatequesisForm;
