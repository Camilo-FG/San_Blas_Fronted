import { Usuario, UserCreate, UserUpdate } from '../../../types/Usuario';
import { apiClient, handleApiError } from '../../../services/apiClient';
import { normalizarTexto } from '../Utils/normalizarTexto';

const mapCreateToBackend = (userData: UserCreate) => ({
  nombre: normalizarTexto(userData.userName),
  email: normalizarTexto(userData.email),
  password: userData.password.trim(),
  confirmPassword: userData.confirmPassword.trim(),
  role: userData.role,
  telefono: normalizarTexto(userData.phoneNumber),
});

const mapUpdateToBackend = (userData: UserUpdate) => {
  const body: Record<string, unknown> = {};
  if (userData.userName) body.nombre = normalizarTexto(userData.userName);
  if (userData.password) {
    body.password = userData.password.trim();
    body.confirmPassword = (userData.confirmPassword ?? userData.password).trim();
  }
  if (userData.role) body.role = userData.role;
  if (typeof userData.state === 'boolean') body.isActive = userData.state;
  if (userData.phoneNumber !== undefined) {
    body.telefono = normalizarTexto(userData.phoneNumber);
  }
  return body;
};

const leerFechaCreacion = (data: Record<string, unknown>): string => {
  const raw = data.createdAt ?? data.created_at ?? data.creationDate;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === 'string' && raw.trim()) return raw;
  return '';
};

const mapBackendToFrontend = (data: Record<string, unknown>): Usuario => ({
  id: data.id as number,
  userName: (data.nombre as string) ?? '',
  email: (data.email as string) ?? '',
  phoneNumber: ((data.telefono as string) ?? (data.phoneNumber as string) ?? ''),
  role: (data.role as string) ?? 'user',
  state: data.isActive === false ? false : true,
  creationDate: leerFechaCreacion(data),
});

export const getUsers = async (): Promise<Usuario[]> => {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/usuario');
  return data.map(mapBackendToFrontend);
};

// respuesta paginada del backend: data + total + pages, la página y el límite usados
export interface PaginacionUsuarios {
  data: Usuario[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// consulta paginada con búsqueda server-side; sin `search` devuelve la primera página completa
export const getUsersPaginados = async (
  page = 1,
  limit = 10,
  search?: string,
): Promise<PaginacionUsuarios> => {
  const buscar = search?.trim();
  const { data } = await apiClient.get<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    pages: number;
    limit: number;
  }>('/usuario', {
    params: {
      page,
      limit,
      ...(buscar ? { search: buscar } : {}),
    },
  });
  return {
    data: data.data.map(mapBackendToFrontend),
    total: data.total,
    page: data.page,
    pages: data.pages,
    limit: data.limit,
  };
};

export const getUserById = async (id: number): Promise<Usuario> => {
  try {
    const { data } = await apiClient.get<Record<string, unknown>>(`/usuario/${id}`);
    return mapBackendToFrontend(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const createUser = async (userData: UserCreate): Promise<Usuario> => {
  try {
    const { data } = await apiClient.post<Record<string, unknown>>(
      '/usuario',
      mapCreateToBackend(userData),
    );
    return mapBackendToFrontend(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/usuario/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const updateUser = async (id: number, userData: UserUpdate): Promise<Usuario> => {
  try {
    const { data } = await apiClient.patch<Record<string, unknown>>(
      `/usuario/${id}`,
      mapUpdateToBackend(userData),
    );
    return mapBackendToFrontend(data);
  } catch (error) {
    handleApiError(error);
  }
};
