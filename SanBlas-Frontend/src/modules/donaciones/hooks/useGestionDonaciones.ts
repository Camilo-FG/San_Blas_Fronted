import { useState, useEffect } from 'react';

export interface Donacion {
    fecha: string;
    anonimo: boolean;
    nombre: string;
    correo: string;
    telefono: string;
    detalle: string;
    estado?: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export const useGestionDonaciones = () => {
    const [donaciones, setDonaciones] = useState<Donacion[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [procesandoId, setProcesandoId] = useState<number | null>(null);

    const BIN_ID = import.meta.env.VITE_DONACION_BIN_ID;
    const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY_DONACION;

    const cargarDonaciones = async () => {
        try {
            setCargando(true);
            const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                method: 'GET',
                headers: { 'X-Master-Key': ACCESS_KEY }
            });
            if (!response.ok) throw new Error('Error al obtener las donaciones');
            const data = await response.json();
            
            const listaFormateada = (data.record?.donaciones || []).map((don: any) => {
                let estadoActual: 'Pendiente' | 'Aprobado' | 'Rechazado' = 'Pendiente';
                
                // Conversión limpia de estados viejos a nuevos
                if (don.estado === 'Aceptada' || don.estado === 'Aprobado') {
                    estadoActual = 'Aprobado';
                } else if (don.estado === 'Denegada' || don.estado === 'Rechazado') {
                    estadoActual = 'Rechazado';
                }

                return {
                    fecha: don.fecha || '',
                    anonimo: !!don.anonimo,
                    nombre: don.nombre || '',
                    correo: don.correo || '',
                    telefono: don.telefono || '',
                    detalle: don.detalle || '',
                    estado: estadoActual
                };
            });
            
            // Ordenar por fecha (más recientes primero)
            listaFormateada.sort((a: Donacion, b: Donacion) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            
            setDonaciones(listaFormateada);
        } catch (error) {
            console.error(error);
            alert('No se pudieron cargar las donaciones.');
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstadoDonacion = async (indexOriginal: number, nuevoEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        setProcesandoId(indexOriginal);
        try {
            const listaActualizada = [...donaciones];
            listaActualizada[indexOriginal].estado = nuevoEstado;

            const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': ACCESS_KEY
                },
                body: JSON.stringify({ donaciones: listaActualizada })
            });

            if (!response.ok) throw new Error('Error al actualizar el estado');
            setDonaciones(listaActualizada);
            return true;
        } catch (error) {
            console.error(error);
            alert('Hubo un error al guardar el nuevo estado.');
            return false;
        } finally {
            setProcesandoId(null);
        }
    };

    useEffect(() => {
        cargarDonaciones();
    }, []);

    return {
        donaciones,
        cargando,
        procesandoId,
        cambiarEstadoDonacion,
        recargar: cargarDonaciones
    };
};