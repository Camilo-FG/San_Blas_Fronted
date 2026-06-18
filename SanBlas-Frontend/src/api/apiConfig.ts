/**
 * @deprecated Usar `apiClient` desde `src/services/apiClient.ts`.
 * Se mantiene como alias para no romper imports existentes.
 */
export {
  apiClient as apiConfig,
  ApiError,
  clearAuthToken,
  getAuthToken,
  handleApiError,
  setAuthToken,
} from "../services/apiClient";
