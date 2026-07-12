import { clearAuthToken, getAuthToken } from "../utils/authToken";
import {
  getEmailFromToken,
  getRoleFromToken,
  getUserIdFromToken,
  isTokenExpired,
} from "../utils/jwt";

export interface AuthUser {
  id: number | null;
  email: string;
  role: string;
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
    role: getRoleFromToken(token) ?? "User",
  };
};

export const isAuthenticated = (): boolean => getCurrentUser() !== null;

export const isAdmin = (): boolean => getCurrentUser()?.role === "admin";
