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

export const setCurrentUser = (user: AuthUser | null): void => {
  currentUser = user;
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
