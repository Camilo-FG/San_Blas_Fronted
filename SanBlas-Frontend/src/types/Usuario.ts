export interface UserCreate {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    role?: string;
}

export interface UserUpdate {
    userName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    state?: boolean;
}

export interface Usuario {
    id: number;
    userName: string;
    email: string;
    phoneNumber: string;
    role: string;
    state: boolean;
    creationDate: string;
}

export const isAdminRole = (role: string): boolean =>
    role?.toLowerCase() === "admin";
