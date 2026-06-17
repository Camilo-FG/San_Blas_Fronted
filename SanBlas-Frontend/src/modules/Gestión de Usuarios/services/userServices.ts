import { UserResponse, Usuario } from '../../../types/Usuario';
import { apiUsers } from '../api/apiUsers';

export const getUsers = async (): Promise<Usuario[]> => {
    const { data } = await apiUsers.get<Usuario[]>('/api/Users');
    return data;
};

export const getUserById = async (id: number): Promise<Usuario> => {
    const { data } = await apiUsers.get<Usuario>(`/api/Users/${id}`);
    return data;
};

export const createUser = async (userData: {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    userRole?: boolean; //este solo el admin lo usa
}): Promise<Usuario> => {
    const { data } = await apiUsers.post<Usuario>('/api/Users', userData);
    return data;
};

export const updateUser = async (id: number, userData: {
    userName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    userRole?: boolean;
    state?: boolean;
}): Promise<Usuario> => {
    const { data } = await apiUsers.put<Usuario>(`/api/Users/${id}`, userData);
    return data;
};