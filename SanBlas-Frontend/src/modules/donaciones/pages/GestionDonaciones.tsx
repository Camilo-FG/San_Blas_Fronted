import React, { useState } from 'react';
import { useGestionDonaciones, Donacion } from '../hooks/useGestionDonaciones';
import './GestionDonaciones.css';

export default function GestionDonaciones(): React.JSX.Element {
    const { donaciones, cargando, procesandoId, cambiarEstadoDonacion } = useGestionDonaciones();
    const [donacionSeleccionada, setDonacionSeleccionada] = useState<Donacion | null>(null);

    const formatearFecha = (fechaStr: string) => {
        const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(fechaStr).toLocaleDateString('es-CR', opciones);
    };

    const handleAccionEstado = async (index: number, nuevoEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        const exito = await cambiarEstadoDonacion(index, nuevoEstado);
        if (exito && donacionSeleccionada) {
            setDonacionSeleccionada({ ...donacionSeleccionada, estado: nuevoEstado });
        }
    };

    return (
        <div className="gestion-container">
            <div className="gestion-header-seccion">
                <h2 className="gestion-titulo">Gestión de Donaciones de Insumos</h2>
                <p className="gestion-subtitulo">Administre, revise detalles y modifique el estado de las donaciones recibidas.</p>
            </div>

            {cargando ? (
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando donaciones...</p>
                </div>
            ) : donaciones.length === 0 ? (
                <div className="no-datos-card">
                    <p className="no-datos">No hay donaciones registradas en el sistema.</p>
                </div>
            ) : (
                <div className="tabla-wrapper">
                    <table className="tabla-donaciones">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Donante</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donaciones.map((donacion: Donacion, index: number) => (
                                <tr key={index}>
                                    <td>{formatearFecha(donacion.fecha)}</td>
                                    <td>
                                        <span className={`badge-nombre ${donacion.anonimo ? 'es-anonimo' : ''}`}>
                                            {donacion.nombre}
                                        </span>
                                    </td>
                                    <td>{donacion.correo}</td>
                                    <td>{donacion.telefono || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No provisto</span>}</td> {/* ← Muestra el celular */}
                                    <td>
                                        <select
                                            className={`select-estado-dinamico ${(donacion.estado || 'pendiente').toLowerCase()}`}
                                            value={donacion.estado || 'Pendiente'}
                                            disabled={procesandoId === index}
                                            onChange={(e) => handleAccionEstado(index, e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado')}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Aprobado">Aprobado</option>
                                            <option value="Rechazado">Rechazado</option>
                                        </select>
                                    </td>
                                    <td className="acciones-celda">
                                        <button 
                                            className="btn-accion btn-ver" 
                                            onClick={() => setDonacionSeleccionada(donacion)}
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {donacionSeleccionada && (
                <div className="modal-overlay" onClick={() => setDonacionSeleccionada(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detalle de la Donación</h3>
                            <button className="modal-cerrar" onClick={() => setDonacionSeleccionada(null)}>×</button>
                        </div>
                        <hr className="modal-divisor" />
                        
                        <div className="modal-grid">
                            <p><strong>Fecha:</strong> {formatearFecha(donacionSeleccionada.fecha)}</p>
                            <p><strong>Tipo:</strong> {donacionSeleccionada.anonimo ? 'Anónimo' : 'Identificado'}</p>
                            <p><strong>Nombre:</strong> {donacionSeleccionada.nombre}</p>
                            <p><strong>Correo:</strong> {donacionSeleccionada.correo}</p>
                            <p><strong>Teléfono:</strong> {donacionSeleccionada.telefono || 'No provisto'}</p>
                            <p>
                                <strong>Estado Actual:</strong>{' '}
                                <span className={`estado-badge ${(donacionSeleccionada.estado || 'pendiente').toLowerCase()}`}>
                                    {donacionSeleccionada.estado}
                                </span>
                            </p>
                        </div>

                        <div className="modal-detalle-bloque">
                            <strong>Insumos ofrecidos:</strong>
                            <p className="detalle-texto-caja">{donacionSeleccionada.detalle}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}