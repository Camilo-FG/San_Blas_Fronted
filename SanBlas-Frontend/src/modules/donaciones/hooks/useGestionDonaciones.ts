import { useState, useEffect } from 'react';

export interface Donacion {
    id: number;
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

    const cargarDonaciones = async () => {
        try {
            setCargando(true);
            // GET del backend
            const response = await fetch('http://localhost:5146/api/Donacion');
            if (!response.ok) throw new Error('Error al obtener las donaciones');
            const data = await response.json();
            
            const listaFormateada = data.map((don: any) => {
                let estadoActual: 'Pendiente' | 'Aprobado' | 'Rechazado' = 'Pendiente';
                
                if (don.estado === 'Aceptada' || don.estado === 'Aprobado') {
                    estadoActual = 'Aprobado';
                } else if (don.estado === 'Denegada' || don.estado === 'Rechazado') {
                    estadoActual = 'Rechazado';
                }

                return {
                    id: don.id,
                    fecha: don.fecha || '',
                    anonimo: !!don.anonimo,
                    nombre: don.nombre || '',
                    correo: don.correo || '',
                    telefono: don.telefono || '',
                    detalle: don.detalle || '',
                    estado: estadoActual
                };
            });
            
            setDonaciones(listaFormateada);
        } catch (error) {
            console.error(error);
            alert('No se pudieron cargar las donaciones.');
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstadoDonacion = async (id: number, nuevoEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        setProcesandoId(id);
        try {
            // PATCH hacia el backend
            const response = await fetch(`http://localhost:5146/api/Donacion/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoEstado)
            });

            if (!response.ok) throw new Error('Error al actualizar el estado');
            
            const listaActualizada = donaciones.map(donacion => 
                donacion.id === id ? { ...donacion, estado: nuevoEstado } : donacion
            );
            
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