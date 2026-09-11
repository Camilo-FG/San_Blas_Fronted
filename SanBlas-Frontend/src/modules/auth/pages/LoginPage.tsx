import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/apiClient";
import Rutas from "../../../routes/Rutas";
import { getPostLoginPath } from "../../../utils/authRouting";
import { Button, FieldError, Input, Label, cn } from "../../../shared/ui";
import SeoHead from "../../../seo/SeoHead";

interface LoginPageProps {
  redirectTo?: string;
}

const LoginPage = ({ redirectTo }: LoginPageProps) => {
  const { login, isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate({
        to: getPostLoginPath(isAdmin, redirectTo),
      });
    }
  }, [isAuthenticated, isAdmin, navigate, redirectTo, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authUser = await login({ email, password });
      const destination = getPostLoginPath(
        authUser.role === "admin",
        redirectTo,
      );
      navigate({ to: destination });
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo iniciar sesión. Intente nuevamente.";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead page="/login" />
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 pt-24 md:pt-8">
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

      <div className="absolute top-5 left-4 z-10 md:top-1/2 md:left-6 md:-translate-y-1/2">
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
      </div>
      <motion.div
        className="relative w-full max-w-[560px] rounded-2xl border border-white/20 bg-surface px-8 py-10 shadow-[0_24px_50px_rgba(0,20,40,0.28)] sm:px-12 sm:py-12"
        initial={reducirMovimiento ? false : { opacity: 0, y: 28 }}
        animate={reducirMovimiento ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      >
        <span className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-royal-gold sm:inset-x-12" />
        <p className="mb-3 text-xs font-extrabold tracking-[0.12em] text-royal-gold uppercase sm:text-sm">
          Acceso a la parroquia
        </p>
        <h1 className="mb-3 font-heading text-[2rem] text-royal-blue sm:text-[2.35rem]">
          Iniciar sesión
        </h1>
        <p className="mb-8 text-base leading-relaxed text-text-muted">
          Administradores acceden al panel. Usuarios regulares pueden enviar
          solicitudes de constancia y catequesis.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex flex-col gap-2">
            <Label htmlFor="email" className="text-royal-blue">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="min-h-12 px-4 py-3 text-base"
            />
          </div>

          <div className="mb-5 flex flex-col gap-2">
            <Label htmlFor="password" className="text-royal-blue">
              Contraseña
            </Label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="min-h-12 px-4 py-3 pr-12 text-base"
              />
              <button
                type="button"
                className={cn(
                  "absolute right-2.5 inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-text-muted transition-colors",
                  "hover:bg-royal-blue/5 hover:text-royal-blue focus-visible:ring-2 focus-visible:ring-royal-blue/25 focus-visible:outline-none",
                )}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Link
              to={Rutas.recuperarContrasena}
              className="self-end text-sm font-semibold text-royal-blue no-underline transition-colors hover:text-royal-gold hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <FieldError message={error} className="mb-5" />

          <Button
            type="submit"
            variant="royal"
            className="w-full min-h-12 text-base"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <Link
          to={Rutas.home}
          className="mt-5 inline-block text-base text-royal-blue no-underline transition-colors hover:text-royal-gold hover:underline"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </section>
    </>
  );
};

export default LoginPage;
