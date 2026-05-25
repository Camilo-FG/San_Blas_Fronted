import { UserResponse, Usuario } from 'src/types/Usuario';
import { apiUsers } from '../api/apiUsers';

//GET usuarios
export const getUsers = async (): Promise<Usuario[]> => {
    const {data} = await apiUsers.get<UserResponse>('/b/6a13738a6877513b27c83e60');
    return data.record;
}

//faltan las demás funciones (POST, PUT y GET(id))
