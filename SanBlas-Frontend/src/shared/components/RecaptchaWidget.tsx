import { useEffect, useRef, useState } from "react";
import type ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaWidgetProps {
  sitekey: string;
  captchaRef: { current: ReCAPTCHA | null };
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
}

type Grc = {
  render: (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => number;
  reset: (widgetId?: number) => void;
  execute: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
};

const TIEMPO_ESPERA_MS = 4000;
const TIEMPO_ESPERA_EMULADO_MS = 2500;
const TOKEN_FALLOBACK_DEV = "fallback-recaptcha-modo-desarrollo";

let scriptPromise: Promise<void> | null = null;

const getGrc = (): Grc | null =>
  (window as unknown as { grecaptcha?: Grc }).grecaptcha ?? null;

const cargarScriptReCaptcha = (): Promise<void> => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve) => {
    if (getGrc()?.render) {
      resolve();
      return;
    }

    const callbackName = `__recaptcha_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      scriptPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
};

const emulandoMovil = () =>
  /(Mobile|Android|iPhone|iPad|iPod)/i.test(navigator.userAgent);

export function RecaptchaWidget({
  sitekey,
  captchaRef,
  onChange,
  onExpired,
}: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({ onChange, onExpired });
  callbacksRef.current = { onChange, onExpired };
  const rendereadoRef = useRef(false);
  const widgetIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [mostrarFallo, setMostrarFallo] = useState(false);

  const vigilarCarga = (contenedor: HTMLElement | null) => {
    if (!contenedor || !import.meta.env.DEV) return;
    if (timerRef.current) window.clearInterval(timerRef.current);

    const limite = emulandoMovil()
      ? TIEMPO_ESPERA_EMULADO_MS
      : TIEMPO_ESPERA_MS;
    const inicio = Date.now();

    timerRef.current = window.setInterval(() => {
      const cont = containerRef.current;
      if (!cont) return;

      if (cont.querySelector("iframe, .g-recaptcha-response")) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        return;
      }

      if (Date.now() - inicio > limite) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setMostrarFallo(true);
      }
    }, 300);
  };

  useEffect(() => {
    let cancelado = false;

    if (rendereadoRef.current) return;
    setMostrarFallo(false);

    cargarScriptReCaptcha()
      .then(() => {
        if (cancelado || rendereadoRef.current) return;
        const g = getGrc();
        const container = containerRef.current;
        if (!g?.render || !container) return;

        const widgetId = g.render(container, {
          sitekey,
          callback: (token: string | null) => {
            callbacksRef.current.onChange?.(token);
          },
          "expired-callback": () => {
            callbacksRef.current.onExpired?.();
          },
          "error-callback": () => {
            if (import.meta.env.DEV) {
              setMostrarFallo(
                () =>
                  !container.querySelector("iframe, .g-recaptcha-response"),
              );
            }
          },
        });

        widgetIdRef.current = widgetId;
        rendereadoRef.current = true;
        captchaRef.current = {
          reset: () => g.reset(widgetId),
          execute: () => g.execute(widgetId),
          executeAsync: () => Promise.resolve(g.getResponse(widgetId) || null),
          getValue: () => g.getResponse(widgetId) || null,
          getWidgetId: () => widgetId,
        } as unknown as ReCAPTCHA;

        vigilarCarga(container);
      })
      .catch(() => undefined);

    return () => {
      cancelado = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitekey, captchaRef]);

  const reintentar = () => {
    setMostrarFallo(false);
    const g = getGrc();
    if (g?.reset && widgetIdRef.current !== null) {
      g.reset(widgetIdRef.current);
    }
    vigilarCarga(containerRef.current);
  };

  return (
    <div className="flex w-full max-w-[304px] flex-col items-center gap-2 max-[368px]:origin-top max-[368px]:scale-[0.75]">
      <div ref={containerRef} className="min-h-[78px] min-w-0" />

      {mostrarFallo && (
        <label className="flex w-full max-w-[304px] cursor-pointer items-start gap-2 rounded-xl border border-dashed border-slate-400 bg-slate-50 px-3 py-2 text-left text-[0.78rem] leading-snug text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-slate-600"
            onChange={(e) => {
              callbacksRef.current.onChange?.(
                e.target.checked ? TOKEN_FALLOBACK_DEV : null,
              );
            }}
          />
          <span>
            El captcha de Google no cargó en esta vista de dispositivo. Marcá
            esta casilla para continuar.
          </span>
        </label>
      )}

      {mostrarFallo && (
        <button
          type="button"
          onClick={reintentar}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.78rem] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Reintentar captcha
        </button>
      )}
    </div>
  );
}