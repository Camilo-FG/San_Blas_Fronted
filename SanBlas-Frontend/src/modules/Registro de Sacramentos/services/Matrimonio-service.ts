import { RegistroMatrimonio } from "src/types/registroSacramento";
import { apiMatrimonio } from "../Api/ApiConfigMatrimonio";


export const fetchGetMatrimonio = async (): Promise<RegistroMatrimonio[]> => {
    const {data} = await apiMatrimonio.get('/latest');
    return data.record; 
}

export const fetchCreateMatrimonio = async (matrimonio: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
       // 1. Obtener los datos actuales
               const { data: datosActuales } = await apiMatrimonio.get('/latest');
               const registrosActuales = datosActuales.record || [];
               // 2. Agregar el nuevo registro
               const registrosActualizados = [...registrosActuales, matrimonio];
               // 3. Actualizar todo el bin
               const { data } = await apiMatrimonio.put(`/`, {
                   record: registrosActualizados
               });
               
               return data.record;
}

export const fetchUpdateMatrimonio = async (matrimonioActualizado: RegistroMatrimonio): Promise<RegistroMatrimonio> => {
    // 1. Obtener todos
                 const { data: datosActuales } = await apiMatrimonio.get('/latest');
                 const registrosActuales: RegistroMatrimonio[] = datosActuales.record || [];
                 // 2. Encontrar y reemplazar el que coincide por ID
                 const registrosActualizados = registrosActuales.map(b => 
                     b.id === matrimonioActualizado.id ? matrimonioActualizado : b);
                 // 3. Actualizar todo el bin
                 const { data } = await apiMatrimonio.put('/', {
                     record: registrosActualizados
                 });
                 
                 return matrimonioActualizado;
}

export const fetchDeleteMatrimonio = async (id: number): Promise<void> => {
    // 1. Obtener todos
              const { data: datosActuales } = await apiMatrimonio.get('/latest');
              const registrosActuales: RegistroMatrimonio[] = datosActuales.record || [];
              // 2. Filtrar para eliminar el que tiene el ID
              const registrosActualizados = registrosActuales.filter(b => b.id !== id);
              // 3. Actualizar todo el bin
              await apiMatrimonio.put('/', {
                  record: registrosActualizados
              });
}