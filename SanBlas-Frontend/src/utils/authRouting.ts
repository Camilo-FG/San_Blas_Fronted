import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { getRoleFromToken, isTokenExpired } from "./jwt";
import Rutas from "../routes/Rutas";

export const USER_ALLOWED_PATHS = [
  Rutas.SolicitudesSacramentos,
  Rutas.FormsolicitudesCatequesis,
  Rutas.login,
  Rutas.home,
] as const;

export const isAdminFromToken = (token: string): boolean =>
  getRoleFromToken(token) === "Admin";

export const getValidSessionToken = (): string | null => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    if (token) clearAuthToken();
    return null;
  }
  return token;
};

export const isAuthenticatedAdmin = (): boolean => {
  const token = getValidSessionToken();
  return token !== null && isAdminFromToken(token);
};

export const isUserRouteAllowed = (pathname: string): boolean => {
  if (pathname === Rutas.home || pathname.startsWith(Rutas.login)) return true;
  return (
    pathname === Rutas.SolicitudesSacramentos ||
    pathname === Rutas.FormsolicitudesCatequesis
  );
};

export const getPostLoginPath = (
  isAdmin: boolean,
  redirectTo?: string,
): string => {
  if (isAdmin) {
    return redirectTo?.startsWith(Rutas.dashboard)
      ? redirectTo
      : Rutas.dashboard;
  }

  if (redirectTo && isUserRouteAllowed(redirectTo)) {
    return redirectTo;
  }

  return Rutas.SolicitudesSacramentos;
};
