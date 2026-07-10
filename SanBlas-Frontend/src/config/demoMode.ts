export const isDemoSinInternet =
  import.meta.env.VITE_MODO_DEMO_SIN_INTERNET === "true";

export const DEMO_CREDENTIALS = {
  email: "catequista@sanblas.cr",
  password: "demo123",
} as const;
