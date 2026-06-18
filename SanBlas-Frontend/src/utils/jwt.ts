export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  [claim: string]: unknown;
}

const CLAIM_ID =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_EMAIL =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const CLAIM_ROLE =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  const payload = parseJwt(token);
  return typeof payload?.exp === "number" ? payload.exp : null;
};

export const isTokenExpired = (token: string): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

export const getEmailFromToken = (token: string): string | null => {
  const payload = parseJwt(token);
  if (!payload) return null;

  const email = payload[CLAIM_EMAIL] ?? payload.email;
  return typeof email === "string" ? email : null;
};

export const getRoleFromToken = (token: string): string | null => {
  const payload = parseJwt(token);
  if (!payload) return null;

  const role = payload[CLAIM_ROLE] ?? payload.role;
  return typeof role === "string" ? role : null;
};

export const getUserIdFromToken = (token: string): number | null => {
  const payload = parseJwt(token);
  if (!payload) return null;

  const id = payload[CLAIM_ID] ?? payload.sub;
  if (typeof id === "number") return id;
  if (typeof id === "string") {
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};
