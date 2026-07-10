import { DEMO_CREDENTIALS, isDemoSinInternet } from "../config/demoMode";
import type { AuthUser } from "./authSession";

const DEMO_SESSION_KEY = "sanblas-demo-session";

export const getDemoUser = (): AuthUser | null => {
  if (!isDemoSinInternet) return null;

  const raw = localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed.role === "Admin" && parsed.email) {
      return parsed;
    }
  } catch {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }

  return null;
};

export const tryDemoLogin = (
  email: string,
  password: string,
): AuthUser | null => {
  if (!isDemoSinInternet) return null;

  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail !== DEMO_CREDENTIALS.email ||
    password !== DEMO_CREDENTIALS.password
  ) {
    return null;
  }

  const user: AuthUser = {
    id: 1,
    email: DEMO_CREDENTIALS.email,
    role: "Admin",
  };

  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  return user;
};

export const clearDemoSession = (): void => {
  localStorage.removeItem(DEMO_SESSION_KEY);
};
