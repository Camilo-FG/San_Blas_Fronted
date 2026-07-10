import {
  apiClient,
  handleApiError,
  setAuthToken,
} from "./apiClient";
import { isDemoSinInternet } from "../config/demoMode";
import { getCurrentUser, type AuthUser } from "./authSession";
import { tryDemoLogin } from "./demoAuth";
import axios from "axios";
import { ApiError } from "./apiClient";

export type { AuthUser } from "./authSession";
export { getCurrentUser, logout } from "./authSession";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

const isNetworkError = (error: unknown): boolean => {
  if (!navigator.onLine) return true;
  if (error instanceof ApiError && error.status === 0) return true;
  return axios.isAxiosError(error) && !error.response;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthUser> => {
  if (isDemoSinInternet) {
    const demoUser = tryDemoLogin(credentials.email, credentials.password);
    if (demoUser) return demoUser;
  }

  try {
    const { data } = await apiClient.post<LoginResponse>("/Auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    setAuthToken(data.token);
    return getCurrentUser()!;
  } catch (error) {
    if (isDemoSinInternet) {
      const demoUser = tryDemoLogin(credentials.email, credentials.password);
      if (demoUser) return demoUser;
    }

    if (isDemoSinInternet && isNetworkError(error)) {
      throw new ApiError(
        "Sin conexión. Use las credenciales de demostración de la catequista.",
        0,
      );
    }

    handleApiError(error);
  }
};
