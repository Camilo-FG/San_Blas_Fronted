import { RegistroComunion } from "src/types/registroSacramento";
import { apiComunion } from "../Api/ApiConfigComunion";


export const fetchGetComunion = async (): Promise<RegistroComunion[]> => {
    const {data} = await apiComunion.get('/latest');
    return data.record; 
}

export const fetchCreateComunion = async (comunion: RegistroComunion): Promise<RegistroComunion> => {
   // 1. Obtener los datos actuales
       const { data: datosActuales } = await apiComunion.get('/latest');
       const registrosActuales = datosActuales.record || [];
       // 2. Agregar el nuevo registro
       const registrosActualizados = [...registrosActuales, comunion];
       // 3. Actualizar todo el bin
       const { data } = await apiComunion.put(`/`, {
           record: registrosActualizados
       });

       return data.record;
}

export const fetchUpdateComunion = async (comunioActualizada: RegistroComunion): Promise<RegistroComunion> => {
     // 1. Obtener todos
       const { data: datosActuales } = await apiComunion.get('/latest');
       const registrosActuales: RegistroComunion[] = datosActuales.record || [];
       // 2. Encontrar y reemplazar el que coincide por ID
       const registrosActualizados = registrosActuales.map(b => 
           b.id === comunioActualizada.id ? comunioActualizada : b);
       // 3. Actualizar todo el bin
       const { data } = await apiComunion.put('/', {
           record: registrosActualizados
       });
       
       return comunioActualizada;
}

export const fetchDeleteComunion = async (id: number): Promise<void> => {
     // 1. Obtener todos
        const { data: datosActuales } = await apiComunion.get('/latest');
        const registrosActuales: RegistroComunion[] = datosActuales.record || [];
        // 2. Filtrar para eliminar el que tiene el ID
        const registrosActualizados = registrosActuales.filter(b => b.id !== id);
        // 3. Actualizar todo el bin
        await apiComunion.put('/', {
            record: registrosActualizados
        });
}