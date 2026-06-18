import { Usuario, UserCreate, UserUpdate } from '../../../types/Usuario';
import { apiConfig } from '../../../api/apiConfig';

export const getUsers = async (): Promise<Usuario[]> => {
    const { data } = await apiConfig.get<Usuario[]>('/api/Users');
    return data;
};

export const getUserById = async (id: number): Promise<Usuario> => {
    const { data } = await apiConfig.get<Usuario>(`/api/Users/${id}`);
    return data;
};

export const createUser = async (userData: UserCreate): Promise<Usuario> => {
    const { data } = await apiConfig.post<Usuario>('/api/Users', userData);
    return data;
};

export const updateUser = async (id: number, userData: UserUpdate): Promise<Usuario> => {
    const { data } = await apiConfig.put<Usuario>(`/api/Users/${id}`, userData);
    return data;
};
