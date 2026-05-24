import { RegistroConfirmacion } from "src/types/registroSacramento";

import { apiConfirma } from "../Api/ApiConfigConfirma";
export const fetchGetConfirma = async (): Promise<RegistroConfirmacion[]> => {
    const {data} = await apiConfirma.get('/ID_DEL_BIN_CONFIRMA');
    return data.record; 
}

export const fetchCreateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
      // 1. Obtener los datos actuales
           const { data: datosActuales } = await apiConfirma.get('/b/TU_BIN_ID_BAUTISMO/latest');
           const registrosActuales = datosActuales.record || [];
           
           // 2. Agregar el nuevo registro
           const registrosActualizados = [...registrosActuales, confirma];
           
           // 3. Actualizar todo el bin
           const { data } = await apiConfirma.put(`/b/TU_BIN_ID_BAUTISMO`, {
               record: registrosActualizados
           });
           
           return data.record;
}

export const fetchUpdateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
    const {data} = await apiConfirma.put('/ID_DEL_BIN_CONFIRMA', confirma);
    return data.record; 
}
export const fetchDeleteConfirma = async (id: number): Promise<void> => {
    await apiConfirma.delete(`/ID_DEL_BIN_CONFIRMA/${id}`);
}