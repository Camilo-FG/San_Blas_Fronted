export type UserResponse = {
    record: Usuario[];
}

export type Usuario = {
    ID: number;
    UserName: string;
    Email: string;
    PhoneNumber: string;
    Password: string;
    UserRole: string;
    State: boolean;
    CreationDate: string;
}