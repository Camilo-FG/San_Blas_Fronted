import { clearAuthToken } from "../utils/authToken";

export interface AuthUser {
  id: number | null;
  email: string;
  role: string;
  roles: string[];
  permisos: string[];
  accesoPanel: boolean;
}

let currentUser: AuthUser | null = null;
let sessionRevision = 0;
export const getSessionRevision = (): number => sessionRevision;
const listeners = new Set<(user: AuthUser | null) => void>();

export const subscribeSession = (listener: (user: AuthUser | null) => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const setCurrentUser = (user: AuthUser | null): void => {
  sessionRevision += 1;
  currentUser = user;
  listeners.forEach((listener) => listener(user));
};

export const logout = (): void => {
  clearAuthToken();
  setCurrentUser(null);
};

export const getCurrentUser = (): AuthUser | null => currentUser;

export const esSecretario = (user: AuthUser | null): boolean =>
  !!user &&
  (user.roles.indexOf("secretario") !== -1 ||
    user.role.toLowerCase() === "admin");

export const tienePermiso = (
  user: AuthUser | null,
  permiso: string,
): boolean => {
  if (!user) return false;
  if (esSecretario(user)) return true;
  return user.permisos.indexOf(permiso) !== -1;
};

export const isAuthenticated = (): boolean => getCurrentUser() !== null;

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return esSecretario(user);
};
