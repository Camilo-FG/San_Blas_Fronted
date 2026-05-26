import { RegistroBautismo } from "src/types/registroSacramento";
import { apiBautismo } from "../Api/ApiConfigBautismo";

export const fetchGetBautismo = async (): Promise<RegistroBautismo[]> => {
    const {data} = await apiBautismo.get('/latest');
    return data.record; 
}

export const fetchCreateBautismo = async (bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
 // 1. Obtener los datos actuales
    const { data: datosActuales } = await apiBautismo.get('/latest');
    const registrosActuales = datosActuales.record || [];
    // 2. Agregar el nuevo registro
    const registrosActualizados = [...registrosActuales, bautismo];
    // 3. Actualizar todo el bin
    const { data } = await apiBautismo.put(`/`, {
        record: registrosActualizados
    });
    
    return bautismo;
};

export const fetchUpdateBautismo = async (bautismoActualizado: RegistroBautismo): Promise<RegistroBautismo> => {
    // 1. Obtener todos
    const { data: datosActuales } = await apiBautismo.get('/latest');
    const registrosActuales: RegistroBautismo[] = datosActuales.record || [];
    // 2. Encontrar y reemplazar el que coincide por ID
    const registrosActualizados = registrosActuales.map(b => 
        b.id === bautismoActualizado.id ? bautismoActualizado : b);
    // 3. Actualizar todo el bin
    const { data } = await apiBautismo.put('/', {
        record: registrosActualizados
    });
    
    return bautismoActualizado;
}

export const fetchDeleteBautismo = async (id: number): Promise<void> => {
    // 1. Obtener todos
    const { data: datosActuales } = await apiBautismo.get('/latest');
    const registrosActuales: RegistroBautismo[] = datosActuales.record || [];
    // 2. Filtrar para eliminar el que tiene el ID
    const registrosActualizados = registrosActuales.filter(b => b.id !== id);
    // 3. Actualizar todo el bin
    await apiBautismo.put('/', {
        record: registrosActualizados
    });
}