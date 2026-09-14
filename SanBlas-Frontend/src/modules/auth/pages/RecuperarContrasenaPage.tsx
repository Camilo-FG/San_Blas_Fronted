import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, MailCheck } from "lucide-react";
import { ApiError } from "../../../services/apiClient";
import { solicitarRecuperacionContrasena } from "../../../services/authService";
import Rutas from "../../../routes/Rutas";
import { Button, FieldError, Input, Label } from "../../../shared/ui";
import SeoHead from "../../../seo/SeoHead";
import { mensajeErrorCorreo } from "../validarCorreo";

const MENSAJE_CONFIRMACION =
  "Enviamos el enlace de recuperación a ese correo. Revise su bandeja de entrada y la carpeta de spam. Si no recibe el mensaje, también puede intentar de nuevo más tarde.";

export default function RecuperarContrasenaPage() {
  const correoId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const reducirMovimiento = useReducedMotion();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorEnvio(null);

    const error = mensajeErrorCorreo(email);
    if (error) {
      setErrorCampo(error);
      return;
    }

    setErrorCampo(null);
    setLoading(true);

    try {
      await solicitarRecuperacionContrasena(email);
      setEnviado(true);
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar la solicitud. Intente nuevamente.";
      setErrorEnvio(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead page={Rutas.recuperarContrasena} />
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-0 py-0 sm:px-4 sm:py-8 sm:pt-8">
        <motion.img
          src="/hero.webp"
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-center blur-md"
          initial={reducirMovimiento ? false : { opacity: 0, scale: 1.02 }}
          animate={reducirMovimiento ? undefined : { opacity: 1, scale: 1.1 }}
          transition={{
            opacity: { duration: 0.9, ease: "easeOut" },
            scale: { duration: 18, ease: "linear" },
          }}
        />
        <motion.div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-royal-blue/92 via-royal-blue/78 to-royal-blue/70"
          initial={reducirMovimiento ? false : { opacity: 0 }}
          animate={reducirMovimiento ? undefined : { opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full border border-royal-gold/25 motion-safe:animate-login-drift" />
        <div className="pointer-events-none absolute top-1/3 -right-10 h-48 w-48 rounded-full border border-royal-gold/15 motion-safe:animate-login-drift [animation-delay:1.4s]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full border border-white/10 motion-safe:animate-login-drift [animation-delay:2.2s]" />
        <div className="pointer-events-none absolute bottom-16 left-1/4 h-32 w-32 rounded-full border border-royal-gold/20 motion-safe:animate-login-drift [animation-delay:0.6s]" />

        <div className="absolute top-5 left-4 z-10 flex flex-col gap-2.5 md:top-1/2 md:left-6 md:-translate-y-1/2">
          <motion.div
            initial={reducirMovimiento ? false : { opacity: 0, x: -22 }}
            animate={reducirMovimiento ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.18 }}
          >
            <Link
              to={Rutas.home}
              className="flex max-w-[150px] flex-col items-start gap-1.5 rounded-xl bg-royal-gold px-3.5 py-3 text-sm font-bold text-royal-blue no-underline shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-x-0.5 hover:bg-royal-gold-light focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </Link>
          </motion.div>
          <motion.div
            initial={reducirMovimiento ? false : { opacity: 0, x: -22 }}
            animate={reducirMovimiento ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.28 }}
          >
            <Link
              to={Rutas.login}
              className="flex max-w-[150px] flex-col items-start gap-1.5 rounded-xl bg-royal-gold px-3.5 py-3 text-sm font-bold text-royal-blue no-underline shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-x-0.5 hover:bg-royal-gold-light focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <ArrowLeft size={18} />
              Volver a iniciar sesión
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative flex min-h-dvh w-full max-w-none flex-col justify-center rounded-none border-0 bg-surface px-6 py-10 shadow-none sm:min-h-0 sm:max-w-[560px] sm:rounded-2xl sm:border sm:border-white/20 sm:px-12 sm:py-12 sm:shadow-[0_24px_50px_rgba(0,20,40,0.28)]"
          initial={reducirMovimiento ? false : { opacity: 0, y: 28 }}
          animate={reducirMovimiento ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        >
          <span className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-royal-gold sm:inset-x-12" />
          <p className="mb-3 text-xs font-extrabold tracking-[0.12em] text-royal-gold uppercase sm:text-sm">
            Acceso a la parroquia
          </p>
          <h1 className="mb-3 font-heading text-[2rem] text-royal-blue sm:text-[2.35rem]">
            Recuperar contraseña
          </h1>
          <p className="mb-8 text-base leading-relaxed text-text-muted">
            {enviado
              ? "Revise su correo para continuar."
              : "Ingrese el correo de su cuenta y le enviaremos un enlace para crear una nueva contraseña."}
          </p>

          {enviado ? (
            <div
              className="flex flex-col gap-6"
              role="status"
              aria-live="polite"
            >
              <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900">
                <MailCheck
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={22}
                  aria-hidden
                />
                <p className="m-0 text-sm leading-relaxed sm:text-base">
                  {MENSAJE_CONFIRMACION}
                </p>
              </div>
              <Button
                type="button"
                variant="royal"
                className="w-full min-h-12 text-base"
                onClick={() => {
                  setEnviado(false);
                  setEmail("");
                  setErrorCampo(null);
                  setErrorEnvio(null);
                }}
              >
                Usar otro correo
              </Button>
              <Link
                to={Rutas.login}
                className="inline-block text-center text-base text-royal-blue no-underline transition-colors hover:text-royal-gold hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-6 flex flex-col gap-2">
                <Label htmlFor={correoId} required className="mb-0 text-royal-blue">
                  Correo electrónico
                </Label>
                <Input
                  id={correoId}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errorCampo) setErrorCampo(null);
                  }}
                  placeholder="nombre@correo.com"
                  autoComplete="email"
                  inputMode="email"
                  aria-required="true"
                  aria-invalid={Boolean(errorCampo)}
                  aria-describedby={errorCampo ? errorId : undefined}
                  hasError={Boolean(errorCampo)}
                  className="min-h-12 px-4 py-3 text-base"
                />
                <FieldError id={errorId} message={errorCampo} />
              </div>

              <FieldError message={errorEnvio} className="mb-5" />

              <Button
                type="submit"
                variant="royal"
                className="w-full min-h-12 text-base"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
          )}

          {!enviado ? (
            <Link
              to={Rutas.login}
              className="mt-5 inline-block text-base text-royal-blue no-underline transition-colors hover:text-royal-gold hover:underline"
            >
              Volver a iniciar sesión
            </Link>
          ) : null}
        </motion.div>
      </section>
    </>
  );
}
