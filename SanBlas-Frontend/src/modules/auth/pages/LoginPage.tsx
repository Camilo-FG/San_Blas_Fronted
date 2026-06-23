import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/apiClient";
import Rutas from "../../../routes/Rutas";
import { getPostLoginPath } from "../../../utils/authRouting";
import "./LoginPage.css";

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
        authUser.role === "Admin",
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
    <section className="login-page">
      <div className="login-card">
        <p className="login-card__eyebrow">Acceso a la parroquia</p>
        <h1>Iniciar sesión</h1>
        <p className="login-card__subtitle">
          Administradores acceden al panel. Usuarios regulares pueden enviar
          solicitudes de constancia y catequesis.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="login-card__field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="login-card__field">
            <label htmlFor="password">Contraseña</label>
            <div className="login-card__password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-card__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="login-card__error">{error}</p>}

          <button
            type="submit"
            className="login-card__submit"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <Link to={Rutas.home} className="login-card__back">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
};

export default LoginPage;
