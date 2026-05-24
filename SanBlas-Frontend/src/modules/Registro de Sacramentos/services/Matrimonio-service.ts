import { RegistroMatrimonio } from "src/types/registroSacramento";
import { apiMatrimonio } from "../Api/ApiConfigMatrimonio";


export const fetchGetMatrimonio = async (): Promise<RegistroMatrimonio[]> => {
    const {data} = await apiMatrimonio.get('/ID_DEL_BIN_MATRIMONIO');
    return data.record; 
}

export const fetchCreateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
       // 1. Obtener los datos actuales
               const { data: datosActuales } = await apiMatrimonio.get('/b/TU_BIN_ID_BAUTISMO/latest');
               const registrosActuales = datosActuales.record || [];
               
               // 2. Agregar el nuevo registro
               const registrosActualizados = [...registrosActuales, matrimonio];
               
               // 3. Actualizar todo el bin
               const { data } = await apiMatrimonio.put(`/b/TU_BIN_ID_BAUTISMO`, {
                   record: registrosActualizados
               });
               
               return data.record;
}

export const fetchUpdateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
    const {data} = await apiMatrimonio.put('/ID_DEL_BIN_MATRIMONIO', matrimonio);
    return data.record; 
}

export const fetchDeleteMatrimonio = async (id: number): Promise<void> => {
    await apiMatrimonio.delete(`/ID_DEL_BIN_MATRIMONIO/${id}`);
}