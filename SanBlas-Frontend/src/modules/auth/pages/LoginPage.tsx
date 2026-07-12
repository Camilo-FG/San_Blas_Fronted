import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/apiClient";
import Rutas from "../../../routes/Rutas";
import { getPostLoginPath } from "../../../utils/authRouting";
import { Button, FieldError, Input, Label, cn } from "../../../shared/ui";

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
    <section className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-gradient-to-b from-surface-muted to-slate-100 px-4 py-8">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-8 shadow-[0_12px_30px_rgba(0,51,102,0.08)]">
        <p className="mb-2 text-xs font-extrabold tracking-[0.12em] text-royal-gold uppercase">
          Acceso a la parroquia
        </p>
        <h1 className="mb-2 font-heading text-[1.75rem] text-royal-blue">
          Iniciar sesión
        </h1>
        <p className="mb-6 text-[0.95rem] text-text-muted">
          Administradores acceden al panel. Usuarios regulares pueden enviar
          solicitudes de constancia y catequesis.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-1.5">
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
            />
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
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
                className="pr-11"
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
          </div>

          <FieldError message={error} className="mb-4" />

          <Button
            type="submit"
            variant="royal"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <Link
          to={Rutas.home}
          className="mt-4 inline-block text-sm text-royal-blue no-underline hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
};

export default LoginPage;
