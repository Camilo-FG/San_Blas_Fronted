export interface UserCreate {
    userName: string;
    email: string;
    phoneNumber: string;
    role?: string;
    roles?: string[];
}

export interface UserUpdate {
    userName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    roles?: string[];
    state?: boolean;
}

export interface Usuario {
    id: number;
    userName: string;
    email: string;
    phoneNumber: string;
    role: string;
    roles?: string[];
    state: boolean;
    /** Invitación enviada; aún no activó la cuenta. */
    pendienteActivacion?: boolean;
    creationDate: string;
}

export function etiquetaEstadoUsuario(usuario: Pick<Usuario, 'state' | 'pendienteActivacion'>): string {
    if (usuario.state) return 'Activo';
    if (usuario.pendienteActivacion) return 'Pendiente de activación';
    return 'Inactivo';
}

export const isAdminRole = (role: string): boolean => {
    const clave = role?.toLowerCase();
    return clave === "secretario" || clave === "admin";
};
