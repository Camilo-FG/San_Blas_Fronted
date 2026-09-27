import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { isTokenExpired } from "./jwt";
import Rutas from "../routes/Rutas";

export const getValidSessionToken = (): string | null => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    if (token) clearAuthToken();
    return null;
  }
  return token;
};

export const isUserRouteAllowed = (pathname: string): boolean => {
  if (pathname === Rutas.home || pathname.startsWith(Rutas.login)) return true;
  return (
    pathname === Rutas.SolicitudesSacramentos ||
    pathname === Rutas.FormsolicitudesCatequesis
  );
};

export const getPostLoginPath = (
  puedeVerPanel: boolean,
  redirectTo?: string,
): string => {
  if (puedeVerPanel) {
    return redirectTo?.startsWith(Rutas.dashboard)
      ? redirectTo
      : Rutas.dashboard;
  }

  if (redirectTo && isUserRouteAllowed(redirectTo)) {
    return redirectTo;
  }

  return Rutas.SolicitudesSacramentos;
};
