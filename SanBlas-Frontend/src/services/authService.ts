import {
  apiClient,
  handleApiError,
} from "./apiClient";
import {
  getCurrentUser,
  logout as clearSession,
  setCurrentUser,
  type AuthUser,
} from "./authSession";

export type { AuthUser } from "./authSession";
export { getCurrentUser } from "./authSession";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthUser> => {
  try {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    setCurrentUser(data.user);
    return data.user;
  } catch (error) {
    handleApiError(error);
  }
};

let restorePromise: Promise<AuthUser | null> | null = null;

// Recupera la sesión desde la cookie HttpOnly una vez por carga de la app.
export const restoreSession = async (): Promise<AuthUser | null> => {
  if (getCurrentUser()) return getCurrentUser();
  restorePromise ??= apiClient
    .get<LoginResponse>("/auth/session")
    .then(({ data }) => {
      setCurrentUser(data.user);
      return data.user;
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      restorePromise = null;
    });

  return restorePromise;
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearSession();
  }
};

export const solicitarRecuperacionContrasena = async (
  email: string,
): Promise<void> => {
  try {
    await apiClient.post("/auth/recuperar-contrasena", {
      email: email.trim(),
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const validarEnlaceRecuperacion = async (
  token: string,
): Promise<void> => {
  try {
    await apiClient.post("/auth/validar-enlace-recuperacion", { token });
  } catch (error) {
    handleApiError(error);
  }
};

export const restablecerContrasena = async (datos: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<void> => {
  try {
    await apiClient.post("/auth/restablecer-contrasena", datos);
  } catch (error) {
    handleApiError(error);
  }
};
