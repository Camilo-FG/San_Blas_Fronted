import { apiClient } from '../api/apiClient';

//GET usuarios
export async function getUsuarios() {
    const response = await apiClient.get('/usuarios');
    return response.data;
}

//faltan las demás funciones 