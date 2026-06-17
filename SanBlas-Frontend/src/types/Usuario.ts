export interface UserCreate {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    userRole?: boolean;
}

export interface UserUpdate {
    userName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    userRole?: boolean;
    state?: boolean;
}

//Response
export interface Usuario {
    id: number;
    userName: string;
    email: string;
    phoneNumber: string;
    userRole: boolean;  //false=User, true=admin
    state: boolean;     //true=activo, false=inactivo
    creationDate: string;
}