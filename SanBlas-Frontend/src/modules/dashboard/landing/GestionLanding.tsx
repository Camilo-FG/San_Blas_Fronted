import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
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
import { Button, ErrorMessage, PageLoader } from "../../../shared/ui";

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
    return <PageLoader className="text-text-muted" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-sm leading-relaxed text-text-muted">
        Seleccione una sección para editar textos e imágenes. Los cambios se
        reflejan en el sitio público.
      </p>

      {error && <ErrorMessage message={error} />}
      {mensaje && (
        <p
          className="m-0 rounded-xl bg-success-bg px-4 py-3 text-sm text-success"
          role="status"
        >
          {mensaje}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_SECTIONS.map((section) => {
          const stored = sections.find((item) => item.sectionKey === section.key);
          const updatedAt = stored?.updatedAt
            ? new Date(stored.updatedAt).toLocaleString("es-CR")
            : "Sin cambios";

          return (
            <article
              key={section.key}
              className="flex flex-col gap-3 rounded-2xl border border-border-strong bg-surface p-4 shadow-sm"
            >
              <div>
                <h3 className="mb-1 text-base font-bold text-royal-blue">
                  {section.label}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-text-muted">
                  {section.description}
                </p>
              </div>
              <p className="m-0 text-xs text-slate-400">
                Última actualización: {updatedAt}
              </p>
              <Button
                variant="ghost"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => abrirEditor(section.key)}
              >
                <Edit3 size={16} />
                Personalizar
              </Button>
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
