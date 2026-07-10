export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const FILES_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const AUTH_TOKEN_KEY = "token";

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
} as const;
