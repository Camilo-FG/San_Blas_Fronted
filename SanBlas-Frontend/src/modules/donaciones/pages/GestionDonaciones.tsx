import React, { useState } from 'react';
import { HandHeart, Mail, Phone, Eye } from 'lucide-react';
import { useGestionDonaciones, Donacion } from '../hooks/useGestionDonaciones';
import { AdminRecordCard } from '../../../shared/components/admin/AdminRecordCard';
import { AdminRecordDetailSheet } from '../../../shared/components/admin/AdminRecordDetailSheet';
import './GestionDonaciones.css';

export default function GestionDonaciones(): React.JSX.Element {
    const { donaciones, cargando, error, procesandoId, cambiarEstadoDonacion } = useGestionDonaciones();
    const [donacionSeleccionada, setDonacionSeleccionada] = useState<Donacion | null>(null);

    const formatearFecha = (fechaStr: string) => {
        const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(fechaStr).toLocaleDateString('es-CR', opciones);
    };

    const handleAccionEstado = async (id: number, nuevoEstado: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        const exito = await cambiarEstadoDonacion(id, nuevoEstado);
        if (exito && donacionSeleccionada) {
            setDonacionSeleccionada({ ...donacionSeleccionada, estado: nuevoEstado });
        }
    };

    const renderEstadoBadge = (estado?: string) => (
        <span className={`estado-badge ${(estado || 'pendiente').toLowerCase()}`}>
            {estado || 'Pendiente'}
        </span>
    );

    return (
        <div className="gestion-container">
            {error ? (
                <div className="no-datos-card">
                    <p className="no-datos" style={{ color: '#b91c1c' }}>{error}</p>
                </div>
            ) : cargando ? (
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando donaciones...</p>
                </div>
            ) : donaciones.length === 0 ? (
                <div className="no-datos-card">
                    <p className="no-datos">No hay donaciones registradas en el sistema.</p>
                </div>
            ) : (
                <div className="admin-responsive-data">
                    <div className="admin-responsive-data__table tabla-wrapper">
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
                                        <td>{donacion.telefono || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No provisto</span>}</td>
                                        <td>
                                            <select
                                                className={`select-estado-dinamico ${(donacion.estado || 'pendiente').toLowerCase()}`}
                                                value={donacion.estado || 'Pendiente'}
                                                disabled={procesandoId === donacion.id}
                                                onChange={(e) => handleAccionEstado(donacion.id, e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado')}
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

                    <div className="admin-responsive-data__cards">
                        {donaciones.map((donacion: Donacion, index: number) => (
                            <AdminRecordCard
                                key={index}
                                icon={<HandHeart size={20} />}
                                accent={donacion.anonimo ? '#64748b' : '#003366'}
                                code={`DON-${donacion.id}`}
                                title={donacion.nombre}
                                subtitle={formatearFecha(donacion.fecha)}
                                badges={renderEstadoBadge(donacion.estado)}
                                meta={[
                                    {
                                        icon: <Mail size={12} />,
                                        label: 'Correo',
                                        value: donacion.correo,
                                    },
                                    {
                                        icon: <Phone size={12} />,
                                        label: 'Teléfono',
                                        value: donacion.telefono || 'No provisto',
                                    },
                                ]}
                                footer={
                                    <select
                                        className={`admin-record-card__inline-select select-estado-dinamico ${(donacion.estado || 'pendiente').toLowerCase()}`}
                                        value={donacion.estado || 'Pendiente'}
                                        disabled={procesandoId === donacion.id}
                                        aria-label={`Estado de donación de ${donacion.nombre}`}
                                        onChange={(e) => handleAccionEstado(donacion.id, e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado')}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Aprobado">Aprobado</option>
                                        <option value="Rechazado">Rechazado</option>
                                    </select>
                                }
                                actions={[
                                    {
                                        label: 'Insumos',
                                        icon: <Eye size={15} />,
                                        variant: 'primary',
                                        onClick: () => setDonacionSeleccionada(donacion),
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>
            )}

            <AdminRecordDetailSheet
                open={donacionSeleccionada !== null}
                title={donacionSeleccionada?.nombre ?? 'Donación'}
                subtitle={donacionSeleccionada ? formatearFecha(donacionSeleccionada.fecha) : undefined}
                badges={donacionSeleccionada ? renderEstadoBadge(donacionSeleccionada.estado) : undefined}
                onClose={() => setDonacionSeleccionada(null)}
                actions={
                    donacionSeleccionada ? (
                        <label className="admin-detail-estado">
                            <span>Cambiar estado</span>
                            <select
                                className={`select-estado-dinamico ${(donacionSeleccionada.estado || 'pendiente').toLowerCase()}`}
                                value={donacionSeleccionada.estado || 'Pendiente'}
                                disabled={procesandoId === donacionSeleccionada.id}
                                onChange={(e) => handleAccionEstado(
                                    donacionSeleccionada.id,
                                    e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
                                )}
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                            </select>
                        </label>
                    ) : undefined
                }
            >
                {donacionSeleccionada && (
                    <>
                        <div className="admin-detail-fields">
                            <p className="admin-detail-field"><strong>Tipo:</strong> {donacionSeleccionada.anonimo ? 'Anónimo' : 'Identificado'}</p>
                            <p className="admin-detail-field"><strong>Correo:</strong> {donacionSeleccionada.correo}</p>
                            <p className="admin-detail-field"><strong>Teléfono:</strong> {donacionSeleccionada.telefono || 'No provisto'}</p>
                        </div>
                        <div className="admin-detail-block">
                            <strong>Insumos ofrecidos</strong>
                            <p className="admin-detail-block__content">{donacionSeleccionada.detalle}</p>
                        </div>
                    </>
                )}
            </AdminRecordDetailSheet>
        </div>
    );
}
