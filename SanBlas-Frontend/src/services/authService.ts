import {
  apiClient,
  handleApiError,
} from "./apiClient";
import {
  getCurrentUser,
  getSessionRevision,
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
let restoreRevision = -1;

// Recupera la sesión desde la cookie HttpOnly una vez por carga de la app.
export const restoreSession = async (actualizar = false): Promise<AuthUser | null> => {
  if (!actualizar && getCurrentUser()) return getCurrentUser();
  const revision = getSessionRevision();
  if (restorePromise && restoreRevision === revision) return restorePromise;
  restoreRevision = revision;
  const peticion = apiClient
    .get<LoginResponse>("/auth/session")
    .then(({ data }) => {
      // Un logout, login u otra actualización invalida las respuestas anteriores.
      if (revision !== getSessionRevision()) return getCurrentUser();
      if (!data?.user) {
        clearSession();
        return null;
      }
      setCurrentUser(data.user);
      return data.user;
    })
    .catch((error) => {
      if (revision !== getSessionRevision()) return getCurrentUser();
      // Una caída de red no equivale a perder la sesión ni los permisos.
      if (error?.response?.status !== 401) throw error;
      clearSession();
      return null;
    })
    .finally(() => {
      if (restorePromise === peticion) restorePromise = null;
    });
  restorePromise = peticion;
  return peticion;
};

export const logout = async (): Promise<void> => {
  const revision = getSessionRevision();
  try {
    await apiClient.post("/auth/logout");
  } finally {
    if (revision === getSessionRevision()) clearSession();
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

export const validarEnlaceActivacion = async (
  token: string,
): Promise<void> => {
  try {
    await apiClient.post("/auth/validar-enlace-activacion", { token });
  } catch (error) {
    handleApiError(error);
  }
};

export const activarCuenta = async (datos: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<void> => {
  try {
    await apiClient.post("/auth/activar-cuenta", datos);
  } catch (error) {
    handleApiError(error);
  }
};

export const reenviarActivacion = async (email: string): Promise<void> => {
  try {
    await apiClient.post("/auth/reenviar-activacion", {
      email: email.trim(),
    });
  } catch (error) {
    handleApiError(error);
  }
};
