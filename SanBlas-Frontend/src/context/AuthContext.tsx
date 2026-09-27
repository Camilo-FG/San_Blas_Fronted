import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  esSecretario,
  getCurrentUser,
  logout as logoutSession,
  tienePermiso as tienePermisoSesion,
  type AuthUser,
} from "../services/authSession";
import type { LoginCredentials } from "../services/authService";

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
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { login: loginRequest } = await import("../services/authService");
    const authUser = await loginRequest(credentials);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    logoutSession();
    setUser(null);
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
