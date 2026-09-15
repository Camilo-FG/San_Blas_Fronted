import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { register } from "../../../services/authService";
import { ApiError } from "../../../services/apiClient";
import Rutas from "../../../routes/Rutas";
import { Button, FieldError, Input, Label, cn } from "../../../shared/ui";
import SeoHead from "../../../seo/SeoHead";

interface FieldErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const reducirMovimiento = useReducedMotion();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validar = (): boolean => {
    const errs: FieldErrors = {};

    if (!nombre.trim() || nombre.trim().length < 3) {
      errs.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Ingresá un correo electrónico válido.";
    }

    if (telefono.trim() && !/^\d{4}-\d{4}$/.test(telefono.trim())) {
      errs.telefono = "El teléfono debe tener el formato 8888-8888.";
    }

    if (
      !password ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(
        password,
      )
    ) {
      errs.password =
        "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validar()) return;

    setLoading(true);
    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        telefono: telefono.trim() || "",
      });
      navigate({ to: Rutas.home });
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo completar el registro. Intente nuevamente.";
      setGlobalError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "min-h-12 px-4 py-3 text-base";

  return (
    <>
      <SeoHead page="/registro" />
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
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.12,
          }}
        >
          <span className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-royal-gold sm:inset-x-12" />
          <p className="mb-3 text-xs font-extrabold tracking-[0.12em] text-royal-gold uppercase sm:text-sm">
            Parroquia San Blas
          </p>
          <h1 className="mb-3 font-heading text-[2rem] text-royal-blue sm:text-[2.35rem]">
            Crear cuenta
          </h1>
          <p className="mb-8 text-base leading-relaxed text-text-muted">
            Registrate para acceder a los servicios de la parroquia.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="nombre" className="text-royal-blue" required>
                  Nombre de usuario
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={50}
                  hasError={!!errors.nombre}
                  className={inputClassName}
                />
                <FieldError message={errors.nombre} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="email" className="text-royal-blue" required>
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  hasError={!!errors.email}
                  className={inputClassName}
                />
                <FieldError message={errors.email} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="telefono" className="text-royal-blue">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="8888-8888"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  maxLength={9}
                  hasError={!!errors.telefono}
                  className={inputClassName}
                />
                <FieldError message={errors.telefono} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="password" className="text-royal-blue" required>
                  Contraseña
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    hasError={!!errors.password}
                    className={cn(inputClassName, "pr-12")}
                  />
                  <button
                    type="button"
                    className={cn(
                      "absolute right-2.5 inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-text-muted transition-colors",
                      "hover:bg-royal-blue/5 hover:text-royal-blue focus-visible:ring-2 focus-visible:ring-royal-blue/25 focus-visible:outline-none",
                    )}
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FieldError message={errors.password} />
              </div>

              <div className="sm:col-span-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-royal-blue"
                  required
                >
                  Confirmar contraseña
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    hasError={!!errors.confirmPassword}
                    className={cn(inputClassName, "pr-12")}
                  />
                  <button
                    type="button"
                    className={cn(
                      "absolute right-2.5 inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-text-muted transition-colors",
                      "hover:bg-royal-blue/5 hover:text-royal-blue focus-visible:ring-2 focus-visible:ring-royal-blue/25 focus-visible:outline-none",
                    )}
                    onClick={() => setShowConfirm((p) => !p)}
                    aria-label={
                      showConfirm
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FieldError message={errors.confirmPassword} />
              </div>
            </div>

            <FieldError message={globalError} className="mt-5" />

            <Button
              type="submit"
              variant="royal"
              className="mt-6 w-full min-h-12 text-base"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-5 text-center text-base text-text-muted">
            ¿Ya tenés cuenta?{" "}
            <Link
              to={Rutas.login}
              className="font-semibold text-royal-blue no-underline transition-colors hover:text-royal-gold hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default SignUpPage;
