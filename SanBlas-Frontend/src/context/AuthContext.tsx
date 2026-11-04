import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  esSecretario,
  getCurrentUser,
  subscribeSession,
  logout as logoutSession,
  tienePermiso as tienePermisoSesion,
  type AuthUser,
} from "../services/authSession";
import {
  login as loginRequest,
  logout as logoutRequest,
  restoreSession,
  type LoginCredentials,
} from "../services/authService";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // Alias de esSecretario: solo display. La fuente de verdad de acceso es tienePermiso().
  isAdmin: boolean;
  tienePermiso: (permiso: string) => boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const previousUser = useRef(user);

  useEffect(() => subscribeSession((siguiente) => {
    const anterior = previousUser.current;
    if (anterior && JSON.stringify(anterior) !== JSON.stringify(siguiente)) {
      void queryClient.cancelQueries();
      queryClient.clear();
    }
    previousUser.current = siguiente;
    setUser(siguiente);
  }), [queryClient]);

  useEffect(() => {
    const actualizar = () => {
      if (!getCurrentUser()) return;
      void restoreSession(true).catch(() => { /* Se conserva la sesión ante errores de red. */ });
    };
    const visible = () => { if (document.visibilityState === 'visible') actualizar(); };
    window.addEventListener('focus', actualizar);
    window.addEventListener('auth:permisos-denegados', actualizar);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('focus', actualizar);
      window.removeEventListener('auth:permisos-denegados', actualizar);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [queryClient]);

  useEffect(() => {
    // La suscripción aplica el resultado; evita que una promesa inicial antigua
    // sobrescriba permisos que ya se actualizaron por foco o por un 403.
    void restoreSession().catch(() => {});
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authUser = await loginRequest(credentials);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    logoutSession();
    setUser(null);
    void logoutRequest();
  }, []);

  const tienePermiso = useCallback(
    (permiso: string) => tienePermisoSesion(user, permiso),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: esSecretario(user),
      tienePermiso,
      login,
      logout,
    }),
    [user, tienePermiso, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
