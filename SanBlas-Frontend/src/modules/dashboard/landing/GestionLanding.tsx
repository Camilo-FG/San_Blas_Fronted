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
import {
  mapearErroresLanding,
  validarFormularioLanding,
} from "./landingValidation";
import { Button, ErrorMessage, PageLoader, useToast } from "../../../shared/ui";
import type { ArchivoImagen } from "../../solicSacramento/components/SubidaImagen";

function GestionLanding() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<LandingSectionResponse[]>([]);
  const [editingKey, setEditingKey] = useState<LandingSectionKey | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [archivosImagen, setArchivosImagen] = useState<
    Record<string, ArchivoImagen | null>
  >({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});

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
    setArchivosImagen({});
    setEditingKey(key);
    setError(null);
    setErroresCampo({});
  };

  const cerrarEditor = () => {
    if (guardando) return;
    Object.values(archivosImagen).forEach((archivo) => {
      if (archivo?.preview) URL.revokeObjectURL(archivo.preview);
    });
    setArchivosImagen({});
    setEditingKey(null);
  };

  const handleArchivoChange = (name: string, archivo: ArchivoImagen | null) => {
    setArchivosImagen((current) => {
      const anterior = current[name];
      if (anterior?.preview && anterior !== archivo) {
        URL.revokeObjectURL(anterior.preview);
      }
      return { ...current, [name]: archivo };
    });
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((current) => ({ ...current, [name]: value }));
    setErroresCampo((current) => {
      if (!current[name]) return current;
      const siguiente = { ...current };
      delete siguiente[name];
      return siguiente;
    });
  };

  const handleSave = async () => {
    if (!editingKey) return;

    try {
      setGuardando(true);
      setError(null);

      const erroresLocales = validarFormularioLanding(editingKey, formValues);
      if (Object.keys(erroresLocales).length > 0) {
        setErroresCampo(erroresLocales);
        setError(Object.values(erroresLocales)[0] ?? null);
        return;
      }
      setErroresCampo({});
      const payload = formToSectionData(editingKey, formValues);
      const archivos: Record<string, File | undefined> = {};
      for (const [nombre, archivo] of Object.entries(archivosImagen)) {
        if (archivo?.file) archivos[nombre] = archivo.file;
      }
      const updated = await actualizarSeccionLanding(
        editingKey,
        payload,
        archivos.imageUrl,
        archivos,
      );

      setSections((current) => {
        const exists = current.some(
          (section) => section.sectionKey === editingKey,
        );
        if (exists) {
          return current.map((section) =>
            section.sectionKey === editingKey ? updated : section,
          );
        }
        return [...current, updated];
      });
      Object.values(archivosImagen).forEach((archivo) => {
        if (archivo?.preview) URL.revokeObjectURL(archivo.preview);
      });
      setArchivosImagen({});
      showToast(
        `${activeConfig?.label ?? "La sección"} se actualizó correctamente`,
        "success",
      );
      setEditingKey(null);
    } catch (err) {
      const texto =
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar la sección.";
      setError(texto);
      if (err instanceof ApiError && err.errores) {
        setErroresCampo(mapearErroresLanding(err.errores));
      }
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

      {error && !editingKey && <ErrorMessage message={error} />}

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
                variant="royal"
                className="w-full"
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
          sectionKey={editingKey}
          fields={activeConfig.fields}
          values={formValues}
          errores={erroresCampo}
          errorMensaje={error}
          guardando={guardando}
          archivosImagen={archivosImagen}
          onArchivoChange={handleArchivoChange}
          onChange={handleFieldChange}
          onClose={cerrarEditor}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default GestionLanding;
