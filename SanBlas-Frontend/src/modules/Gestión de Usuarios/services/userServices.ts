import { UserResponse, Usuario } from '../../../types/Usuario';
import { apiUsers } from '../api/apiUsers';

const BIN_ID = import.meta.env.VITE_USER_BIN_ID;
//GET usuarios
export const getUsers = async (): Promise<Usuario[]> => {
    const {data} = await apiUsers.get<UserResponse>(`/${BIN_ID}`);
    return data.record;
};
//faltan las demás funciones (PUT)


export const putUser = async (usuarios: Usuario[]): Promise<Usuario[]> => {
  const { data } = await apiUsers.put<UserResponse>(`/${BIN_ID}`, usuarios);
  return data.record;
} 