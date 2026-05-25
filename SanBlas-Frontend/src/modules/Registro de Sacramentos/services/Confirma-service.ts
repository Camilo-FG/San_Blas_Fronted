import { RegistroConfirmacion } from "src/types/registroSacramento";
import { apiConfirma } from "../Api/ApiConfigConfirma";

export const fetchGetConfirma = async (): Promise<RegistroConfirmacion[]> => {
    const {data} = await apiConfirma.get('/latest');
    return data.record; 
}

export const fetchCreateConfirma = async (confirma: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
      // 1. Obtener los datos actuales
           const { data: datosActuales } = await apiConfirma.get('/latest');
           const registrosActuales = datosActuales.record || [];
           // 2. Agregar el nuevo registro
           const registrosActualizados = [...registrosActuales, confirma];
           // 3. Actualizar todo el bin
           const { data } = await apiConfirma.put(`/`, {
               record: registrosActualizados
           });
           
           return data.record;
}

export const fetchUpdateConfirma = async (confirmaActualizada: RegistroConfirmacion): Promise<RegistroConfirmacion> => {
   // 1. Obtener todos
             const { data: datosActuales } = await apiConfirma.get('/latest');
             const registrosActuales: RegistroConfirmacion[] = datosActuales.record || [];
             // 2. Encontrar y reemplazar el que coincide por ID
             const registrosActualizados = registrosActuales.map(b => 
                 b.id === confirmaActualizada.id ? confirmaActualizada : b);
             // 3. Actualizar todo el bin
             const { data } = await apiConfirma.put('/', {
                 record: registrosActualizados
             });
             
             return confirmaActualizada;
}
export const fetchDeleteConfirma = async (id: number): Promise<void> => {
    // 1. Obtener todos
           const { data: datosActuales } = await apiConfirma.get('/latest');
           const registrosActuales: RegistroConfirmacion[] = datosActuales.record || [];
           // 2. Filtrar para eliminar el que tiene el ID
           const registrosActualizados = registrosActuales.filter(b => b.id !== id);
           // 3. Actualizar todo el bin
           await apiConfirma.put('/', {
               record: registrosActualizados
           });
}