import { useEffect, useRef, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button, ConfirmacionAccionModal, useToast } from "../../../shared/ui";
import {
  restablecerSeccionesLanding,
  type LandingSectionKey,
} from "../../../services/landingService";
import { ApiError } from "../../../services/apiClient";
import { LANDING_SECTIONS } from "./landingSectionConfig";

interface RestablecerLandingMenuProps {
  onRestablecido: (secciones: LandingSectionKey[]) => void;
}

// Menú desplegable para restablecer una o varias secciones del landing a su
// configuración por defecto. "Restablecer todo" marca/desmarca los checkboxes.
export default function RestablecerLandingMenu({
  onRestablecido,
}: RestablecerLandingMenuProps) {
  const { showToast } = useToast();
  const [abierto, setAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<LandingSectionKey[]>([]);
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const todas = LANDING_SECTIONS.map((s) => s.key);
  const todoMarcado = seleccion.length === todas.length && todas.length > 0;

  // cierra el menú al hacer clic afuera o con Escape
  useEffect(() => {
    if (!abierto) return;

    const handleClick = (event: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto]);

  const alternar = (key: LandingSectionKey) => {
    setSeleccion((actual) =>
      actual.includes(key)
        ? actual.filter((item) => item !== key)
        : [...actual, key],
    );
  };

  const alternarTodo = () => {
    setSeleccion(todoMarcado ? [] : [...todas]);
  };

  const confirmarRestablecer = async () => {
    try {
      setProcesando(true);
      await restablecerSeccionesLanding(seleccion);
      onRestablecido(seleccion);
      showToast(
        seleccion.length === 1
          ? "Se restableció 1 sección correctamente"
          : `Se restablecieron ${seleccion.length} secciones correctamente`,
        "success",
      );
      setSeleccion([]);
      setAbierto(false);
      setConfirmando(false);
    } catch (err) {
      const texto =
        err instanceof ApiError
          ? err.message
          : "No se pudieron restablecer las secciones.";
      showToast(texto, "error");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="relative" ref={contenedorRef}>
        <Button
          variant="secondary"
          className="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
          onClick={() => setAbierto((prev) => !prev)}
          aria-expanded={abierto}
          aria-haspopup="true"
        >
          <RotateCcw size={16} />
          Restablecer
          <ChevronDown
            size={16}
            className={abierto ? "rotate-180 transition-transform" : "transition-transform"}
          />
        </Button>

        {abierto && (
          <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-border-strong bg-surface p-3 shadow-lg dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-muted dark:hover:bg-white/[0.035]">
              <input
                type="checkbox"
                className="size-4 accent-royal-blue"
                checked={todoMarcado}
                onChange={alternarTodo}
              />
              <span className="text-sm font-bold text-royal-blue dark:text-[#d9a928]">
                Restablecer todo
              </span>
            </label>

            <div className="my-1 h-px bg-border dark:bg-white/10" />

            <div className="flex max-h-64 flex-col overflow-y-auto">
              {LANDING_SECTIONS.map((section) => (
                <label
                  key={section.key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-muted dark:hover:bg-white/[0.035]"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-royal-blue"
                    checked={seleccion.includes(section.key)}
                    onChange={() => alternar(section.key)}
                  />
                  <span className="text-sm text-text-secondary dark:text-[#b7c3d4]">
                    {section.label}
                  </span>
                </label>
              ))}
            </div>

            <Button
              variant="danger"
              className="mt-2 w-full"
              disabled={seleccion.length === 0}
              onClick={() => setConfirmando(true)}
            >
              Restablecer seleccionadas
            </Button>
          </div>
        )}
      </div>

      <ConfirmacionAccionModal
        open={confirmando}
        title="Restablecer configuración"
        parteSubrayada="Restablecer"
        resto=" configuración"
        iconoAdvertencia
        confirmVariant="danger"
        confirmLabel="Restablecer"
        pendingLabel="Restableciendo..."
        isPending={procesando}
        mensaje={
          seleccion.length === todas.length
            ? "Se restablecerán TODAS las secciones del landing a su configuración original. Esta acción no se puede deshacer."
            : `Se restablecerán ${seleccion.length} sección(es) a su configuración original. Esta acción no se puede deshacer.`
        }
        onConfirm={confirmarRestablecer}
        onCancel={() => setConfirmando(false)}
        overlayClassName="fixed inset-0 z-[1350] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
        className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        cancelClassName="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
      />
    </div>
  );
}
