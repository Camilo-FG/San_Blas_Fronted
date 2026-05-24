import { RegistroComunion } from "src/types/registroSacramento";
import { apiComunion } from "../Api/ApiConfigComunion";


export const fetchGetComunion = async (): Promise<RegistroComunion[]> => {
    const {data} = await apiComunion.get('/ID_DEL_BIN_COMUNION');
    return data.record; 
}

export const fetchCreateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
   // 1. Obtener los datos actuales
       const { data: datosActuales } = await apiComunion.get('/b/TU_BIN_ID_BAUTISMO/latest');
       const registrosActuales = datosActuales.record || [];
       
       // 2. Agregar el nuevo registro
       const registrosActualizados = [...registrosActuales, comunion];
       
       // 3. Actualizar todo el bin
       const { data } = await apiComunion.put(`/b/TU_BIN_ID_BAUTISMO`, {
           record: registrosActualizados
       });
       
       return data.record;
}

export const fetchUpdateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
    const {data} = await apiComunion.put('/ID_DEL_BIN_COMUNION', comunion);
    return data.record; 
}

export const fetchDeleteComunion = async (id: number): Promise<void> => {
    await apiComunion.delete(`/ID_DEL_BIN_COMUNION/${id}`);
}