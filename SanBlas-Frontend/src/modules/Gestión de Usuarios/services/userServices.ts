import { Usuario, UserCreate, UserUpdate } from '../../../types/Usuario';
import { apiClient } from '../../../services/apiClient';

const normalizePhoneNumber = (phone: string): string => phone.replace(/\D/g, '');

// Mapea al backend que espera { nombre, email, password }
const mapCreateToBackend = (userData: UserCreate) => ({
  nombre: userData.userName.trim(),
  email: userData.email.trim(),
  password: userData.password,
});

const mapUpdateToBackend = (userData: UserUpdate) => {
  const body: Record<string, unknown> = {};
  if (userData.userName) body.nombre = userData.userName.trim();
  if (userData.email) body.email = userData.email.trim();
  if (userData.password) body.password = userData.password;
  return body;
};

const mapBackendToFrontend = (data: Record<string, unknown>): Usuario => ({
  id: data.id as number,
  userName: (data.nombre as string) ?? '',
  email: (data.email as string) ?? '',
  phoneNumber: '',
  role: (data.role as string) ?? 'user',
  state: true,
  creationDate: '',
});

export const getUsers = async (): Promise<Usuario[]> => {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/usuario');
  return data.map(mapBackendToFrontend);
};

export const getUserById = async (id: number): Promise<Usuario> => {
  const { data } = await apiClient.get<Record<string, unknown>>(`/usuario/${id}`);
  return mapBackendToFrontend(data);
};

export const createUser = async (userData: UserCreate): Promise<Usuario> => {
  const { data } = await apiClient.post<Record<string, unknown>>(
    '/usuario',
    mapCreateToBackend(userData),
  );
  return mapBackendToFrontend(data);
};

export const updateUser = async (id: number, userData: UserUpdate): Promise<Usuario> => {
  const { data } = await apiClient.patch<Record<string, unknown>>(
    `/usuario/${id}`,
    mapUpdateToBackend(userData),
  );
  return mapBackendToFrontend(data);
};
