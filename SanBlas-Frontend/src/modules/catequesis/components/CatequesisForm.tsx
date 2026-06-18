import { useState } from "react";
import "./CatequesisForm.css";
import { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";

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

  inscripcion: {
    personaQueInscribe: {
      nombre: null,
      apellido: null,
    },
    parentesco: null,
    pago: {
      numeroComprobanteSINPE: "",
      archivoComprobante: null,
      fechaPago: null,
    },
  },
});

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

    if (!form.madreCatequizando.nombre.trim()) {
      newErrors.nombreMadre = "Digite el nombre de la madre o encargada.";
    }

    if (!form.madreCatequizando.apellidos.trim()) {
      newErrors.apellidosMadre =
        "Digite los apellidos de la madre o encargada.";
    }

    if (!form.madreCatequizando.telefono.trim()) {
      newErrors.telefonoMadre = "Digite el teléfono de la madre o encargada.";
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

    if (!form.inscripcion.pago.numeroComprobanteSINPE.trim()) {
      newErrors.numeroComprobanteSINPE =
        "Digite el número de comprobante SINPE.";
    }

    if (!form.inscripcion.pago.archivoComprobante) {
      newErrors.archivoComprobante = "Debe adjuntar el comprobante de pago.";
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
      className="catequesis-form"
      onSubmit={handleSubmit}
    >
      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Datos de Catequesis</h2>
            <p>Seleccione el centro y el nivel al que desea inscribir.</p>
          </div>
          <span>Sección 1</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Centro de catequesis *</label>
            <select
              value={form.catequesis.centroCatequesis || ""}
              onChange={(e) =>
                updateForm("catequesis.centroCatequesis", e.target.value)
              }
            >
              <option value="">Seleccione</option>
              <option value="Santuario Histórico San Blas">
                Santuario Histórico San Blas
              </option>
              <option value="Curime">Curime</option>
              <option value="San Martín">San Martín</option>
              <option value="Pedregal">Pedregal</option>
              <option value="Nambí">Nambí</option>
            </select>
            {errors.centroCatequesis && (
              <p className="error-text">{errors.centroCatequesis}</p>
            )}
          </div>

          <div className="form-field">
            <label>Nivel a inscribirse *</label>
            <select
              value={form.catequesis.nivelAInscribirse || ""}
              onChange={(e) =>
                updateForm("catequesis.nivelAInscribirse", e.target.value)
              }
            >
              <option value="">Seleccione</option>
              <option value="Primero (Primera Comunión)">
                Primero (Primera Comunión)
              </option>
              <option value="Sétimo (Confirmación)">
                Sétimo (Confirmación)
              </option>
            </select>
            {errors.nivelAInscribirse && (
              <p className="error-text">{errors.nivelAInscribirse}</p>
            )}
          </div>

          <div className="form-field full-width">
            <label>Adjuntar fe de bautismo *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                updateForm(
                  "catequesis.feBautismoArchivo",
                  e.target.files?.[0] || null,
                )
              }
            />
            {errors.feBautismoArchivo && (
              <p className="error-text">{errors.feBautismoArchivo}</p>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Datos del Catequizando</h2>
            <p>Información personal del niño o joven que será inscrito.</p>
          </div>
          <span>Sección 2</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Nombre *</label>
            <input
              type="text"
              placeholder="Ej: Carlos Emanuel"
              value={form.catequizando.nombre}
              onChange={(e) =>
                updateForm("catequizando.nombre", e.target.value)
              }
            />
            {errors.nombreCatequizando && (
              <p className="error-text">{errors.nombreCatequizando}</p>
            )}
          </div>

          <div className="form-field">
            <label>Apellidos *</label>
            <input
              type="text"
              placeholder="Ej: Pérez Gómez"
              value={form.catequizando.apellidos}
              onChange={(e) =>
                updateForm("catequizando.apellidos", e.target.value)
              }
            />
            {errors.apellidosCatequizando && (
              <p className="error-text">{errors.apellidosCatequizando}</p>
            )}
          </div>

          <div className="form-field">
            <label>Fecha de nacimiento *</label>
            <input
              type="date"
              value={form.catequizando.fechaNacimiento || ""}
              onChange={(e) =>
                updateForm("catequizando.fechaNacimiento", e.target.value)
              }
            />
            {errors.fechaNacimiento && (
              <p className="error-text">{errors.fechaNacimiento}</p>
            )}
          </div>

          <div className="form-field">
            <label>Dirección exacta *</label>
            <input
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
              <p className="error-text">{errors.direccionExacta}</p>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Datos de Bautismo</h2>
            <p>Complete la información del registro de bautismo.</p>
          </div>
          <span>Sección 3</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Parroquia</label>
            <input
              type="text"
              value={form.catequizando.bautismo.parroquia || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.parroquia", e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Fecha de bautismo</label>
            <input
              type="date"
              value={form.catequizando.bautismo.fecha || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.fecha", e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Tomo</label>
            <input
              type="text"
              value={form.catequizando.bautismo.tomo || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.tomo", e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Folio</label>
            <input
              type="text"
              value={form.catequizando.bautismo.folio || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.folio", e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Asiento</label>
            <input
              type="text"
              value={form.catequizando.bautismo.asiento || ""}
              onChange={(e) =>
                updateForm("catequizando.bautismo.asiento", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Adecuación y Salud del Catequizando</h2>
            <p>Información educativa y de salud relevante para catequesis.</p>
          </div>
          <span>Sección 4</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>¿Requiere adecuación en el centro educativo? *</label>
            <select
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
            </select>
            {errors.requiereAdecuacion && (
              <p className="error-text">{errors.requiereAdecuacion}</p>
            )}
          </div>

          {form.catequizando.adecuacion.requiereAdecuacionCentroEducativo && (
            <div className="form-field">
              <label>Descripción de la adecuación *</label>
              <textarea
                value={form.catequizando.adecuacion.descripcionAdecuacion || ""}
                onChange={(e) =>
                  updateForm(
                    "catequizando.adecuacion.descripcionAdecuacion",
                    e.target.value,
                  )
                }
              />
              {errors.descripcionAdecuacion && (
                <p className="error-text">{errors.descripcionAdecuacion}</p>
              )}
            </div>
          )}

          <div className="form-field">
            <label>¿Es portador de enfermedad crónica? *</label>
            <select
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
            </select>
            {errors.portadorEnfermedad && (
              <p className="error-text">{errors.portadorEnfermedad}</p>
            )}
          </div>

          {form.catequizando.condicionSalud.portadorEnfermedadCronica && (
            <div className="form-field">
              <label>Descripción de enfermedad *</label>
              <textarea
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
                <p className="error-text">{errors.descripcionEnfermedad}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Datos de la Madre o Encargada</h2>
            <p>Información de contacto de la persona responsable.</p>
          </div>
          <span>Sección 5</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Nombre *</label>
            <input
              type="text"
              value={form.madreCatequizando.nombre}
              onChange={(e) =>
                updateForm("madreCatequizando.nombre", e.target.value)
              }
            />
            {errors.nombreMadre && (
              <p className="error-text">{errors.nombreMadre}</p>
            )}
          </div>

          <div className="form-field">
            <label>Apellidos *</label>
            <input
              type="text"
              value={form.madreCatequizando.apellidos}
              onChange={(e) =>
                updateForm("madreCatequizando.apellidos", e.target.value)
              }
            />
            {errors.apellidosMadre && (
              <p className="error-text">{errors.apellidosMadre}</p>
            )}
          </div>

          <div className="form-field">
            <label>Dirección exacta</label>
            <input
              type="text"
              value={form.madreCatequizando.direccion.direccionExacta || ""}
              onChange={(e) =>
                updateForm(
                  "madreCatequizando.direccion.direccionExacta",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="form-field">
            <label>Ciudad</label>
            <input
              type="text"
              value={form.madreCatequizando.direccion.ciudad || ""}
              onChange={(e) =>
                updateForm("madreCatequizando.direccion.ciudad", e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Provincia</label>
            <input
              type="text"
              value={form.madreCatequizando.direccion.provincia || ""}
              onChange={(e) =>
                updateForm(
                  "madreCatequizando.direccion.provincia",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="form-field">
            <label>Teléfono *</label>
            <input
              type="text"
              placeholder="0000-0000"
              value={form.madreCatequizando.telefono}
              onChange={(e) =>
                updateForm("madreCatequizando.telefono", e.target.value)
              }
            />
            {errors.telefonoMadre && (
              <p className="error-text">{errors.telefonoMadre}</p>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Inscripción y Pago</h2>
            <p>Datos de la persona que inscribe y comprobante SINPE.</p>
          </div>
          <span>Sección 6</span>
        </div>

        <div className="payment-info">
          <p>
            <strong>SINPE Parroquia:</strong> 8878-3025
          </p>
          <p>
            <strong>Enviar comprobante al:</strong> 6416-7863
          </p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Nombre de quien inscribe *</label>
            <input
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
              <p className="error-text">{errors.nombrePersonaInscribe}</p>
            )}
          </div>

          <div className="form-field">
            <label>Apellido de quien inscribe *</label>
            <input
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
              <p className="error-text">{errors.apellidoPersonaInscribe}</p>
            )}
          </div>

          <div className="form-field">
            <label>Parentesco *</label>
            <select
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
            </select>
            {errors.parentesco && (
              <p className="error-text">{errors.parentesco}</p>
            )}
          </div>

          <div className="form-field">
            <label>Número de comprobante SINPE *</label>
            <input
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
              <p className="error-text">{errors.numeroComprobanteSINPE}</p>
            )}
          </div>

          <div className="form-field full-width">
            <label>Archivo del comprobante *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                updateForm(
                  "inscripcion.pago.archivoComprobante",
                  e.target.files?.[0] || null,
                )
              }
            />
            {errors.archivoComprobante && (
              <p className="error-text">{errors.archivoComprobante}</p>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Lineamientos de Catequesis</h2>
            <p>
              Lea el documento de lineamientos antes de enviar la inscripción.
            </p>
          </div>
          <span>Sección 7</span>
        </div>

        <div className="lineamientos-box">
          <p>
            Antes de enviar la solicitud, debe leer y aceptar los lineamientos
            de catequesis.
          </p>

          <a
            href="/lineamientos-catequesis.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="lineamientos-link"
          >
            Ver documento de lineamientos
          </a>

          <label className="lineamientos-check">
            <input
              type="checkbox"
              checked={aceptaLineamientos}
              onChange={(e) => setAceptaLineamientos(e.target.checked)}
            />
            <span>
              Confirmo que he leído y acepto los lineamientos de catequesis.
            </span>
          </label>

          {errors.lineamientos && (
            <p className="error-text">{errors.lineamientos}</p>
          )}
        </div>
      </section>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? "Enviando inscripción..." : "Enviar inscripción"}
        </button>
      </div>
    </form>
  );
};

export default CatequesisForm;
