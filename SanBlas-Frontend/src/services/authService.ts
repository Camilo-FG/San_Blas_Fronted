import {
  apiClient,
  clearAuthToken,
  getAuthToken,
  handleApiError,
  setAuthToken,
} from "./apiClient";
import {
  getEmailFromToken,
  getRoleFromToken,
  getUserIdFromToken,
  isTokenExpired,
} from "../utils/jwt";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number | null;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthUser> => {
  try {
    const { data } = await apiClient.post<LoginResponse>("/Auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    setAuthToken(data.token);
    return getCurrentUser()!;
  } catch (error) {
    handleApiError(error);
  }
};

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

export const isAdmin = (): boolean => getCurrentUser()?.role === "Admin";
