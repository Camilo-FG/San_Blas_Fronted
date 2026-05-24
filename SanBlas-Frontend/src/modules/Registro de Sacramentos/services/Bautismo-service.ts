import { RegistroBautismo } from "src/types/registroSacramento";
import { apiBautismo } from "../Api/ApiConfigBautismo";

export const fetchGetBautismo = async (): Promise<RegistroBautismo[]> => {
    const {data} = await apiBautismo.get('/ID_DEL_BIN_COMUNION');
    return data.record; 
}

export const fetchCreateBautismo = async (bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
 // 1. Obtener los datos actuales
    const { data: datosActuales } = await apiBautismo.get('/b/TU_BIN_ID_BAUTISMO/latest');
    const registrosActuales = datosActuales.record || [];
    
    // 2. Agregar el nuevo registro
    const registrosActualizados = [...registrosActuales, bautismo];
    
    // 3. Actualizar todo el bin
    const { data } = await apiBautismo.put(`/b/TU_BIN_ID_BAUTISMO`, {
        record: registrosActualizados
    });
    
    return data.record;
};

export const fetchUpdateBautismo = async (Bautismo: RegistroBautismo): Promise<RegistroBautismo> => {
    const {data} = await apiBautismo.put('/ID_DEL_BIN_COMUNION', Bautismo);
    return data.record; 
}

export const fetchDeleteBautismo = async (id: number): Promise<void> => {
    await apiBautismo.delete(`/ID_DEL_BIN_COMUNION/${id}`);
}