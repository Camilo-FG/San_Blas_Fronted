import { clearAuthToken, getAuthToken } from "../utils/authToken";
import {
  getAccesoPanelFromToken,
  getEmailFromToken,
  getRoleFromToken,
  getUserIdFromToken,
  isTokenExpired,
} from "../utils/jwt";

export interface AuthUser {
  id: number | null;
  email: string;
  role: string;
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
    accesoPanel: getAccesoPanelFromToken(token),
  };
};

export const isAuthenticated = (): boolean => getCurrentUser() !== null;

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin" || user?.accesoPanel === true;
};
