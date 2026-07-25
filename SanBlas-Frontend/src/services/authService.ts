import {
  apiClient,
  handleApiError,
  setAuthToken,
} from "./apiClient";
import { getCurrentUser, type AuthUser } from "./authSession";

export type { AuthUser } from "./authSession";
export { getCurrentUser, logout } from "./authSession";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthUser> => {
  try {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    setAuthToken(data.accessToken);
    return getCurrentUser()!;
  } catch (error) {
    handleApiError(error);
  }
};
