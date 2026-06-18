import { useEffect, useState } from "react";
import { Edit3, LayoutTemplate } from "lucide-react";
import {
  actualizarSeccionLanding,
  obtenerSeccionesLanding,
  type LandingSectionKey,
  type LandingSectionResponse,
} from "../../../services/landingService";
import { ApiError } from "../../../services/apiClient";
import LandingSectionModal from "./LandingSectionModal";
import {
  formToSectionData,
  LANDING_SECTIONS,
  sectionDataToForm,
} from "./landingSectionConfig";
import "./GestionLanding.css";

function GestionLanding() {
  const [sections, setSections] = useState<LandingSectionResponse[]>([]);
  const [editingKey, setEditingKey] = useState<LandingSectionKey | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const activeConfig = LANDING_SECTIONS.find((item) => item.key === editingKey);

  const cargarSecciones = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerSeccionesLanding();
      setSections(data);
    } catch (err) {
      const texto =
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar el contenido del landing.";
      setError(texto);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  const abrirEditor = (key: LandingSectionKey) => {
    const section = sections.find((item) => item.sectionKey === key);
    const data = (section?.data ?? {}) as Record<string, unknown>;
    setFormValues(sectionDataToForm(key, data));
    setEditingKey(key);
    setMensaje(null);
    setError(null);
  };

  const cerrarEditor = () => {
    if (guardando) return;
    setEditingKey(null);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async () => {
    if (!editingKey) return;

    try {
      setGuardando(true);
      setError(null);
      setMensaje(null);

      const payload = formToSectionData(editingKey, formValues);
      const updated = await actualizarSeccionLanding(editingKey, payload);

      setSections((current) =>
        current.map((section) =>
          section.sectionKey === editingKey ? updated : section,
        ),
      );
      setMensaje("Contenido guardado correctamente.");
      setEditingKey(null);
    } catch (err) {
      const texto =
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar la sección.";
      setError(texto);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className="landing-cms__status">Cargando contenido del landing...</p>;
  }

  return (
    <div className="landing-cms">
      <header className="landing-cms__intro">
        <div className="landing-cms__intro-icon" aria-hidden="true">
          <LayoutTemplate size={22} />
        </div>
        <div>
          <h2>Gestión del landing</h2>
          <p>
            Seleccione una sección para editar textos e imágenes con un formulario
            sencillo. Los cambios se reflejan en el sitio público.
          </p>
        </div>
      </header>

      {error && (
        <p className="landing-cms__error" role="alert">
          {error}
        </p>
      )}
      {mensaje && (
        <p className="landing-cms__success" role="status">
          {mensaje}
        </p>
      )}

      <div className="landing-cms__grid">
        {LANDING_SECTIONS.map((section) => {
          const stored = sections.find((item) => item.sectionKey === section.key);
          const updatedAt = stored?.updatedAt
            ? new Date(stored.updatedAt).toLocaleString("es-CR")
            : "Sin cambios";

          return (
            <article key={section.key} className="landing-cms__card">
              <div className="landing-cms__card-head">
                <h3>{section.label}</h3>
                <p>{section.description}</p>
              </div>
              <p className="landing-cms__card-meta">Última actualización: {updatedAt}</p>
              <button
                type="button"
                className="landing-cms__card-btn"
                onClick={() => abrirEditor(section.key)}
              >
                <Edit3 size={16} />
                Personalizar
              </button>
            </article>
          );
        })}
      </div>

      {activeConfig && editingKey && (
        <LandingSectionModal
          title={activeConfig.label}
          fields={activeConfig.fields}
          values={formValues}
          guardando={guardando}
          onChange={handleFieldChange}
          onClose={cerrarEditor}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default GestionLanding;
