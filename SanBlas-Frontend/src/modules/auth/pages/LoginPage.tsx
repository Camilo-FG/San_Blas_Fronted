import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/apiClient";
import Rutas from "../../../routes/Rutas";
import "./LoginPage.css";

interface LoginPageProps {
  redirectTo?: string;
}

const LoginPage = ({ redirectTo }: LoginPageProps) => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: redirectTo || Rutas.dashboard });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate({ to: redirectTo || Rutas.dashboard });
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
        <p className="login-card__eyebrow">Acceso administrativo</p>
        <h1>Iniciar sesión</h1>
        <p className="login-card__subtitle">
          Ingresá con tu cuenta para acceder al panel de la parroquia.
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
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
