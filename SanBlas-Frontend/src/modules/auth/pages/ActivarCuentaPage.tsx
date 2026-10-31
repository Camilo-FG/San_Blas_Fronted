import { useEffect, useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { ApiError } from "../../../services/apiClient";
import {
  activarCuenta,
  reenviarActivacion,
  validarEnlaceActivacion,
} from "../../../services/authService";
import Rutas from "../../../routes/Rutas";
import { Button, FieldError, Input, Label, cn } from "../../../shared/ui";
import SeoHead from "../../../seo/SeoHead";
import { mensajeErrorCorreo } from "../validarCorreo";
import {
  mensajeErrorConfirmacion,
  mensajeErrorContrasena,
} from "../validarContrasena";
import {
  esErrorDeRed,
  MENSAJE_SIN_INTERNET_ENLACE,
} from "../mensajesConexion";

const TOKEN_ACTIVACION = /^[A-Za-z0-9_-]{43,128}$/;
const MENSAJE_FORMATO =
  "El enlace no es válido. Solicita uno nuevo con tu correo.";
const MENSAJE_REENVIO =
  "Si existe una cuenta pendiente de activación con este correo, recibirás un nuevo enlace.";

type EstadoEnlace =
  | "comprobando"
  | "valido"
  | "rechazado"
  | "sin-conexion"
  | "activado";

interface ActivarCuentaPageProps {
  token: string;
}

export default function ActivarCuentaPage({ token }: ActivarCuentaPageProps) {
  const correoId = useId();
  const errorCorreoId = useId();
  const contrasenaId = useId();
  const confirmacionId = useId();
  const errorContrasenaId = useId();
  const errorConfirmacionId = useId();
  const [estadoEnlace, setEstadoEnlace] = useState<EstadoEnlace>(
    TOKEN_ACTIVACION.test(token) ? "comprobando" : "rechazado",
  );
  const [mensajeEnlace, setMensajeEnlace] = useState(
    TOKEN_ACTIVACION.test(token) ? "" : MENSAJE_FORMATO,
  );
  const [reintento, setReintento] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(
    null,
  );
  const [reenvioListo, setReenvioListo] = useState(false);
  const [enviandoReenvio, setEnviandoReenvio] = useState(false);
  const reducirMovimiento = useReducedMotion();
  const formatoValido = TOKEN_ACTIVACION.test(token);

  useEffect(() => {
    if (!formatoValido) return;
    let vigente = true;
    setEstadoEnlace("comprobando");

    validarEnlaceActivacion(token)
      .then(() => {
        if (vigente) setEstadoEnlace("valido");
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        if (err instanceof ApiError && err.status === 400) {
          setMensajeEnlace(err.message);
          setEstadoEnlace("rechazado");
          return;
        }
        if (err instanceof ApiError && err.status === 429) {
          setMensajeEnlace(
            "Demasiados intentos. Espere un minuto y pulse Reintentar.",
          );
          setEstadoEnlace("sin-conexion");
          return;
        }
        setMensajeEnlace(
          esErrorDeRed(err) || !navigator.onLine
            ? MENSAJE_SIN_INTERNET_ENLACE
            : err instanceof ApiError
              ? err.message
              : "No se pudo comprobar el enlace. Intente nuevamente.",
        );
        setEstadoEnlace("sin-conexion");
      });

    return () => {
      vigente = false;
    };
  }, [formatoValido, reintento, token]);

  const handleActivar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorEnvio(null);
    if (estadoEnlace !== "valido") return;

    const errorClave = mensajeErrorContrasena(password);
    const errorRepeticion = mensajeErrorConfirmacion(confirmPassword, password);
    setErrorContrasena(errorClave);
    setErrorConfirmacion(errorRepeticion);
    if (errorClave || errorRepeticion) return;

    if (!navigator.onLine) {
      setErrorEnvio(MENSAJE_SIN_INTERNET_ENLACE);
      return;
    }
    setLoading(true);
    try {
      await activarCuenta({ token, password, confirmPassword });
      setEstadoEnlace("activado");
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo activar la cuenta. Intente nuevamente.";
      if (
        err instanceof ApiError &&
        err.status === 400 &&
        mensaje !== "Las contraseñas no coinciden" &&
        !mensaje.startsWith("La contraseña debe")
      ) {
        setMensajeEnlace(mensaje);
        setEstadoEnlace("rechazado");
        return;
      }
      setErrorEnvio(
        esErrorDeRed(err) ? MENSAJE_SIN_INTERNET_ENLACE : mensaje,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReenvio = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorEnvio(null);
    const error = mensajeErrorCorreo(email);
    if (error) {
      setErrorCampo(error);
      return;
    }
    setErrorCampo(null);
    if (!navigator.onLine) {
      setErrorEnvio(MENSAJE_SIN_INTERNET_ENLACE);
      return;
    }
    setEnviandoReenvio(true);
    try {
      await reenviarActivacion(email);
      setReenvioListo(true);
    } catch (err) {
      setErrorEnvio(
        esErrorDeRed(err)
          ? MENSAJE_SIN_INTERNET_ENLACE
          : err instanceof ApiError
            ? err.message
            : "No se pudo enviar el enlace. Intente nuevamente.",
      );
    } finally {
      setEnviandoReenvio(false);
    }
  };

  return (
    <>
      <SeoHead page={Rutas.activarCuenta} />
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-0 py-0 sm:px-4 sm:py-8">
        <motion.img
          src="/hero.webp"
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-center blur-md"
          initial={reducirMovimiento ? undefined : { opacity: 0 }}
          animate={reducirMovimiento ? undefined : { opacity: 1 }}
          transition={{ duration: 0.7 }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-royal-blue/92 via-royal-blue/78 to-royal-blue/70" />

        <div className="absolute top-5 left-4 z-10 md:top-1/2 md:left-6 md:-translate-y-1/2">
          <Link
            to={Rutas.login}
            className="flex max-w-[150px] flex-col items-start gap-1.5 rounded-xl bg-royal-gold px-3.5 py-3 text-sm font-bold text-royal-blue no-underline shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
          >
            <ArrowLeft size={18} />
            Volver a iniciar sesión
          </Link>
        </div>

        <div className="relative flex min-h-dvh w-full max-w-none flex-col justify-center rounded-none bg-surface px-6 py-10 sm:min-h-0 sm:max-w-[560px] sm:rounded-2xl sm:border sm:border-white/20 sm:px-12 sm:py-12 sm:shadow-[0_24px_50px_rgba(0,20,40,0.28)]">
          <span className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-royal-gold sm:inset-x-12" />
          <p className="mb-3 text-xs font-extrabold tracking-[0.12em] text-royal-gold uppercase sm:text-sm">
            Acceso a la parroquia
          </p>
          <h1 className="mb-3 font-heading text-[2rem] text-royal-blue sm:text-[2.35rem]">
            Activar cuenta
          </h1>

          {estadoEnlace === "activado" ? (
            <div className="flex flex-col gap-6" role="status">
              <p className="m-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-900 sm:text-base">
                Tu cuenta fue activada correctamente. Ya puedes iniciar sesión
                con tu correo y la contraseña que elegiste.
              </p>
              <Link
                to={Rutas.login}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-royal-blue px-4 text-base font-bold text-white no-underline"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : estadoEnlace === "comprobando" ? (
            <p
              className="m-0 text-base leading-relaxed text-text-muted"
              role="status"
            >
              Comprobando el enlace...
            </p>
          ) : estadoEnlace === "sin-conexion" ? (
            <div className="flex flex-col gap-6" role="alert">
              <p className="m-0 text-base leading-relaxed text-text-muted">
                {mensajeEnlace}
              </p>
              <Button
                type="button"
                variant="royal"
                className="w-full min-h-12 text-base"
                onClick={() => setReintento((valor) => valor + 1)}
              >
                Reintentar
              </Button>
            </div>
          ) : estadoEnlace === "rechazado" ? (
            <div className="flex flex-col gap-6">
              <p
                className="m-0 text-base leading-relaxed text-text-muted"
                role="alert"
              >
                {mensajeEnlace}
              </p>
              {reenvioListo ? (
                <div
                  className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
                  role="status"
                >
                  <MailCheck className="text-emerald-700" size={28} />
                  <p className="m-0 text-sm leading-relaxed text-emerald-900">
                    {MENSAJE_REENVIO}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReenvio} noValidate className="flex flex-col gap-4">
                  <p className="m-0 text-sm leading-relaxed text-text-muted">
                    Si el enlace expiró o ya no es válido, solicita uno nuevo con
                    el correo de tu cuenta.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={correoId} required className="mb-0 text-royal-blue">
                      Correo electrónico
                    </Label>
                    <Input
                      id={correoId}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorCampo) setErrorCampo(null);
                      }}
                      autoComplete="email"
                      hasError={Boolean(errorCampo)}
                      aria-invalid={Boolean(errorCampo)}
                      aria-describedby={errorCampo ? errorCorreoId : undefined}
                      className="min-h-12 px-4 py-3 text-base"
                    />
                    <FieldError id={errorCorreoId} message={errorCampo} />
                  </div>
                  <FieldError message={errorEnvio} />
                  <Button
                    type="submit"
                    variant="royal"
                    className="w-full min-h-12 text-base"
                    disabled={enviandoReenvio}
                  >
                    {enviandoReenvio
                      ? "Enviando..."
                      : "Solicitar nuevo enlace"}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => void handleActivar(e)} noValidate>
              <p className="mb-8 text-base leading-relaxed text-text-muted">
                Elige tu contraseña para activar la cuenta. Debe tener al menos
                8 caracteres, con una mayúscula, una minúscula y un número.
              </p>

              <div className="mb-5 flex flex-col gap-2">
                <Label htmlFor={contrasenaId} required className="mb-0 text-royal-blue">
                  Contraseña
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id={contrasenaId}
                    type={mostrarPassword ? "text" : "password"}
                    name="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (errorContrasena) setErrorContrasena(null);
                    }}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errorContrasena)}
                    aria-describedby={
                      errorContrasena ? errorContrasenaId : undefined
                    }
                    hasError={Boolean(errorContrasena)}
                    className="min-h-12 px-4 py-3 pr-12 text-base"
                  />
                  <button
                    type="button"
                    className={cn(
                      "absolute right-2.5 inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-text-muted",
                    )}
                    onClick={() => setMostrarPassword((valor) => !valor)}
                    aria-label={
                      mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={mostrarPassword}
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FieldError id={errorContrasenaId} message={errorContrasena} />
              </div>

              <div className="mb-6 flex flex-col gap-2">
                <Label
                  htmlFor={confirmacionId}
                  required
                  className="mb-0 text-royal-blue"
                >
                  Confirmar contraseña
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id={confirmacionId}
                    type={mostrarConfirmacion ? "text" : "password"}
                    name="confirm-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (errorConfirmacion) setErrorConfirmacion(null);
                    }}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errorConfirmacion)}
                    aria-describedby={
                      errorConfirmacion ? errorConfirmacionId : undefined
                    }
                    hasError={Boolean(errorConfirmacion)}
                    className="min-h-12 px-4 py-3 pr-12 text-base"
                  />
                  <button
                    type="button"
                    className={cn(
                      "absolute right-2.5 inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-text-muted",
                    )}
                    onClick={() => setMostrarConfirmacion((valor) => !valor)}
                    aria-label={
                      mostrarConfirmacion
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    aria-pressed={mostrarConfirmacion}
                  >
                    {mostrarConfirmacion ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                <FieldError
                  id={errorConfirmacionId}
                  message={errorConfirmacion}
                />
              </div>

              <FieldError message={errorEnvio} className="mb-5" />
              <Button
                type="submit"
                variant="royal"
                className="w-full min-h-12 text-base"
                disabled={loading}
              >
                {loading ? "Activando..." : "Activar cuenta"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
