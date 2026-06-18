import { useEffect, useState } from "react";
import {
  actualizarSeccionLanding,
  obtenerSeccionesLanding,
  type LandingSectionKey,
  type LandingSectionResponse,
} from "../../../services/landingService";
import { ApiError } from "../../../services/apiClient";
import "./GestionLanding.css";

const SECTION_LABELS: Record<LandingSectionKey, string> = {
  hero: "Inicio — Hero",
  "sobre-nosotros": "Inicio — Sobre nosotros",
  contacto: "Página de contacto",
  horarios: "Página de horarios",
  bautizos: "Página de bautizos",
};

const SECTION_ORDER: LandingSectionKey[] = [
  "hero",
  "sobre-nosotros",
  "contacto",
  "horarios",
  "bautizos",
];

function GestionLanding() {
  const [sections, setSections] = useState<LandingSectionResponse[]>([]);
  const [activeKey, setActiveKey] = useState<LandingSectionKey>("hero");
  const [editorValue, setEditorValue] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

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

  useEffect(() => {
    const section = sections.find((item) => item.sectionKey === activeKey);
    setEditorValue(JSON.stringify(section?.data ?? {}, null, 2));
    setMensaje(null);
  }, [activeKey, sections]);

  const handleSave = async () => {
    try {
      setGuardando(true);
      setError(null);
      setMensaje(null);

      const parsed = JSON.parse(editorValue);
      const updated = await actualizarSeccionLanding(activeKey, parsed);

      setSections((current) =>
        current.map((section) =>
          section.sectionKey === activeKey ? updated : section,
        ),
      );
      setMensaje("Contenido guardado correctamente.");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("El JSON no es válido. Revise la sintaxis antes de guardar.");
        return;
      }

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
      <header className="landing-cms__header">
        <div>
          <h2>Gestión del landing</h2>
          <p>
            Edite el contenido público del sitio. Los cambios se reflejan de
            inmediato en las páginas del landing.
          </p>
        </div>
        <button
          type="button"
          className="landing-cms__save"
          onClick={handleSave}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar sección"}
        </button>
      </header>

      {error && <p className="landing-cms__error">{error}</p>}
      {mensaje && <p className="landing-cms__success">{mensaje}</p>}

      <div className="landing-cms__layout">
        <aside className="landing-cms__tabs">
          {SECTION_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`landing-cms__tab ${
                activeKey === key ? "landing-cms__tab--active" : ""
              }`}
              onClick={() => setActiveKey(key)}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </aside>

        <section className="landing-cms__editor">
          <h3>{SECTION_LABELS[activeKey]}</h3>
          <p className="landing-cms__hint">
            Edite el JSON de la sección. Mantenga la estructura de campos para
            que el frontend pueda renderizarla correctamente.
          </p>
          <textarea
            value={editorValue}
            onChange={(event) => setEditorValue(event.target.value)}
            spellCheck={false}
          />
        </section>
      </div>
    </div>
  );
}

export default GestionLanding;
