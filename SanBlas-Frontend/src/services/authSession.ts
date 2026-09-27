import { clearAuthToken, getAuthToken } from "../utils/authToken";
import {
  getAccesoPanelFromToken,
  getEmailFromToken,
  getPermisosFromToken,
  getRoleFromToken,
  getRolesFromToken,
  getUserIdFromToken,
  isTokenExpired,
} from "../utils/jwt";

export interface AuthUser {
  id: number | null;
  email: string;
  role: string;
  roles: string[];
  permisos: string[];
  accesoPanel: boolean;
}

export const logout = (): void => {
  clearAuthToken();
};

export const getCurrentUser = (): AuthUser | null => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    if (token) clearAuthToken();
    return null;
  }

  const email = getEmailFromToken(token);
  if (!email) {
    clearAuthToken();
    return null;
  }

  return {
    id: getUserIdFromToken(token),
    email,
    role: getRoleFromToken(token) ?? "user",
    roles: getRolesFromToken(token),
    permisos: getPermisosFromToken(token),
    accesoPanel: getAccesoPanelFromToken(token),
  };
};

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
