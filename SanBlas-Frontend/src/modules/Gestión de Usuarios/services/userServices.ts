import { Usuario, UserCreate, UserUpdate } from '../../../types/Usuario';
import { apiClient } from '../../../services/apiClient';

const normalizePhoneNumber = (phone: string): string => phone.replace(/\D/g, '');

export const getUsers = async (): Promise<Usuario[]> => {
    const { data } = await apiClient.get<Usuario[]>('/Users');
    return data;
};

export const getUserById = async (id: number): Promise<Usuario> => {
    const { data } = await apiClient.get<Usuario>(`/Users/${id}`);
    return data;
};

export const createUser = async (userData: UserCreate): Promise<Usuario> => {
    const { data } = await apiClient.post<Usuario>('/Users', {
        ...userData,
        phoneNumber: normalizePhoneNumber(userData.phoneNumber),
    });
    return data;
};

export const updateUser = async (id: number, userData: UserUpdate): Promise<Usuario> => {
    const { data } = await apiClient.put<Usuario>(`/Users/${id}`, {
        ...userData,
        ...(userData.phoneNumber
            ? { phoneNumber: normalizePhoneNumber(userData.phoneNumber) }
            : {}),
    });
    return data;
};
