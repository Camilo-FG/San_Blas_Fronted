import { useEffect, useRef, useState } from "react";
import type { CaptchaControl } from "../hooks/useCaptcha";

interface RecaptchaWidgetProps {
  sitekey: string;
  captchaRef: { current: CaptchaControl | null };
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
}

interface GoogleRecaptcha {
  render: (element: HTMLElement, options: Record<string, unknown>) => number;
  reset: (widgetId: number) => void;
}

interface VentanaRecaptcha extends Window {
  grecaptcha?: GoogleRecaptcha;
  __sanblasRecaptchaReady?: () => void;
  __SANBLAS_PRERENDER__?: boolean;
}

let cargaScript: Promise<GoogleRecaptcha> | null = null;

// Comparte una sola carga entre formularios y usa únicamente el dominio autorizado en CSP.
function cargarRecaptcha(): Promise<GoogleRecaptcha> {
  const ventana = window as VentanaRecaptcha;
  if (ventana.grecaptcha?.render) return Promise.resolve(ventana.grecaptcha);
  if (cargaScript) return cargaScript;

  cargaScript = new Promise<GoogleRecaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => fallar(), 15_000);

    // Libera el callback aunque Google falle; así el botón puede intentar una carga nueva.
    function fallar() {
      window.clearTimeout(timer);
      delete ventana.__sanblasRecaptchaReady;
      script.remove();
      reject(new Error("No se pudo cargar la verificación"));
    }

    ventana.__sanblasRecaptchaReady = () => {
      if (!ventana.grecaptcha?.render) {
        fallar();
        return;
      }
      window.clearTimeout(timer);
      delete ventana.__sanblasRecaptchaReady;
      resolve(ventana.grecaptcha);
    };
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=__sanblasRecaptchaReady&render=explicit&hl=es";
    script.async = true;
    script.defer = true;
    script.onerror = fallar;
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    cargaScript = null;
    throw error;
  });
  return cargaScript;
}

// Monta una verificación real; un fallo jamás genera un token alternativo.
export function RecaptchaWidget({
  sitekey,
  captchaRef,
  onChange,
  onExpired,
}: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbacks = useRef({ onChange, onExpired });
  callbacks.current = { onChange, onExpired };
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [intento, setIntento] = useState(0);
  const clave = sitekey.trim();

  useEffect(() => {
    // No serializamos scripts, iframes ni desafíos de localhost en el HTML público.
    if ((window as VentanaRecaptcha).__SANBLAS_PRERENDER__) return;
    const container = containerRef.current;
    callbacks.current.onChange?.(null);
    if (!clave || !container) return;

    let cancelado = false;
    let google: GoogleRecaptcha | null = null;
    let widgetId: number | null = null;

    cargarRecaptcha()
      .then((cliente) => {
        if (cancelado) return;
        google = cliente;
        const contenido = document.createElement("div");
        container.replaceChildren(contenido);
        widgetId = cliente.render(contenido, {
          sitekey: clave,
          hl: "es",
          callback: (token: string | null) => {
            if (!cancelado) callbacks.current.onChange?.(token);
          },
          "expired-callback": () => {
            if (cancelado) return;
            callbacks.current.onChange?.(null);
            callbacks.current.onExpired?.();
          },
          "error-callback": () => {
            if (cancelado) return;
            callbacks.current.onChange?.(null);
            setEstado("error");
          },
        });
        captchaRef.current = {
          reset: () => {
            if (widgetId !== null) cliente.reset(widgetId);
          },
        };
        setEstado("listo");
      })
      .catch(() => {
        if (cancelado) return;
        callbacks.current.onChange?.(null);
        setEstado("error");
      });

    // Descarta callbacks anteriores al desmontar o reintentar, también en StrictMode.
    return () => {
      cancelado = true;
      captchaRef.current = null;
      if (google && widgetId !== null) {
        try {
          google.reset(widgetId);
        } catch {
          // El iframe puede haber desaparecido durante la navegación.
        }
      }
      container.replaceChildren();
    };
  }, [clave, captchaRef, intento]);

  // Reinicia la carga sin permitir enviar hasta resolver otro desafío.
  const reintentar = () => {
    callbacks.current.onChange?.(null);
    setEstado("cargando");
    setIntento((actual) => actual + 1);
  };

  return (
    <div className="flex w-full max-w-[304px] flex-col items-center gap-2 max-[368px]:origin-top max-[368px]:scale-[0.75]">
      <div ref={containerRef} className="min-h-[78px] min-w-0" />
      {!clave ? (
        <p role="alert" className="text-center text-sm text-danger">
          La verificación de seguridad no está configurada. Intente más tarde.
        </p>
      ) : estado === "error" ? (
        <>
          <p role="alert" className="text-center text-sm text-danger">
            No se pudo cargar el reCAPTCHA. Revisá tu conexión y reintentá.
          </p>
          <button
            type="button"
            onClick={reintentar}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600"
          >
            Reintentar captcha
          </button>
        </>
      ) : estado === "cargando" ? (
        <p role="status" className="text-center text-sm text-text-muted">
          Cargando verificación de seguridad…
        </p>
      ) : null}
    </div>
  );
}
