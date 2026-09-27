// El token de acceso vive en una cookie HttpOnly. Esta variable solo mantiene
// compatibilidad con utilidades internas y nunca persiste entre recargas.
let authToken: string | null = null;

export const getAuthToken = (): string | null => authToken;

export const setAuthToken = (token: string): void => {
  authToken = token;
};

export const clearAuthToken = (): void => {
  authToken = null;
};
