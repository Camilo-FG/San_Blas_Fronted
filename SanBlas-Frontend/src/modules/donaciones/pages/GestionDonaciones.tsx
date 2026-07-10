import React, { useState } from 'react';
import { HandHeart, Mail, Phone, Eye } from 'lucide-react';
import { useGestionDonaciones, Donacion } from '../hooks/useGestionDonaciones';
import { AdminRecordCard } from '../../../shared/components/admin/AdminRecordCard';
import { AdminRecordDetailSheet } from '../../../shared/components/admin/AdminRecordDetailSheet';
import {
    AdminModule,
    AdminTable,
    AdminTableCell,
    AdminTableHead,
    AdminTableHeaderCell,
    AdminTablePanel,
    AdminTableRow,
    Badge,
    Button,
    EmptyState,
    ErrorMessage,
    PageLoader,
    Select,
    cn,
    type BadgeVariant,
} from '../../../shared/ui';

const getEstadoBadgeVariant = (estado?: string): BadgeVariant => {
    const normalized = (estado || 'pendiente').toLowerCase();
    if (normalized === 'aprobado') return 'success';
    if (normalized === 'rechazado') return 'danger';
    return 'warning';
};

const estadoSelectClass = (estado?: string) =>
    cn(
        'w-[135px] max-w-[160px] rounded-full border px-3.5 py-1.5 text-center text-xs font-semibold',
        (estado || 'pendiente').toLowerCase() === 'aprobado' &&
            'border-emerald-300 bg-success-bg text-success',
        (estado || 'pendiente').toLowerCase() === 'rechazado' &&
            'border-red-300 bg-danger-bg text-danger',
        (estado || 'pendiente').toLowerCase() === 'pendiente' &&
            'border-amber-300 bg-warning-bg text-warning',
    );

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
        <Badge variant={getEstadoBadgeVariant(estado)}>
            {estado || 'Pendiente'}
        </Badge>
    );

    return (
        <AdminModule>
            {error ? (
                <ErrorMessage message={error} />
            ) : cargando ? (
                <PageLoader />
            ) : donaciones.length === 0 ? (
                <EmptyState title="No hay donaciones registradas en el sistema." />
            ) : (
                <>
                    <div className="hidden md:block">
                        <AdminTablePanel>
                            <AdminTable>
                                <AdminTableHead>
                                    <AdminTableRow>
                                        <AdminTableHeaderCell>Fecha</AdminTableHeaderCell>
                                        <AdminTableHeaderCell>Donante</AdminTableHeaderCell>
                                        <AdminTableHeaderCell>Correo</AdminTableHeaderCell>
                                        <AdminTableHeaderCell>Teléfono</AdminTableHeaderCell>
                                        <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
                                        <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
                                    </AdminTableRow>
                                </AdminTableHead>
                                <tbody>
                                    {donaciones.map((donacion: Donacion, index: number) => (
                                        <AdminTableRow key={index}>
                                            <AdminTableCell>{formatearFecha(donacion.fecha)}</AdminTableCell>
                                            <AdminTableCell>
                                                <span
                                                    className={cn(
                                                        'font-medium',
                                                        donacion.anonimo && 'italic text-slate-400',
                                                    )}
                                                >
                                                    {donacion.nombre}
                                                </span>
                                            </AdminTableCell>
                                            <AdminTableCell>{donacion.correo}</AdminTableCell>
                                            <AdminTableCell>
                                                {donacion.telefono || (
                                                    <span className="text-slate-400 italic">No provisto</span>
                                                )}
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <Select
                                                    className={estadoSelectClass(donacion.estado)}
                                                    value={donacion.estado || 'Pendiente'}
                                                    disabled={procesandoId === donacion.id}
                                                    onChange={(e) =>
                                                        handleAccionEstado(
                                                            donacion.id,
                                                            e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
                                                        )
                                                    }
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Aprobado">Aprobado</option>
                                                    <option value="Rechazado">Rechazado</option>
                                                </Select>
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setDonacionSeleccionada(donacion)}
                                                >
                                                    Ver Detalle
                                                </Button>
                                            </AdminTableCell>
                                        </AdminTableRow>
                                    ))}
                                </tbody>
                            </AdminTable>
                        </AdminTablePanel>
                    </div>

                    <div className="flex flex-col gap-2.5 md:hidden">
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
                                    <Select
                                        className={cn('w-full', estadoSelectClass(donacion.estado))}
                                        value={donacion.estado || 'Pendiente'}
                                        disabled={procesandoId === donacion.id}
                                        aria-label={`Estado de donación de ${donacion.nombre}`}
                                        onChange={(e) =>
                                            handleAccionEstado(
                                                donacion.id,
                                                e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
                                            )
                                        }
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Aprobado">Aprobado</option>
                                        <option value="Rechazado">Rechazado</option>
                                    </Select>
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
                </>
            )}

            <AdminRecordDetailSheet
                open={donacionSeleccionada !== null}
                title={donacionSeleccionada?.nombre ?? 'Donación'}
                subtitle={donacionSeleccionada ? formatearFecha(donacionSeleccionada.fecha) : undefined}
                badges={donacionSeleccionada ? renderEstadoBadge(donacionSeleccionada.estado) : undefined}
                onClose={() => setDonacionSeleccionada(null)}
                actions={
                    donacionSeleccionada ? (
                        <label className="flex w-full flex-col gap-1.5 text-sm font-semibold text-slate-700">
                            <span>Cambiar estado</span>
                            <Select
                                className={estadoSelectClass(donacionSeleccionada.estado)}
                                value={donacionSeleccionada.estado || 'Pendiente'}
                                disabled={procesandoId === donacionSeleccionada.id}
                                onChange={(e) =>
                                    handleAccionEstado(
                                        donacionSeleccionada.id,
                                        e.target.value as 'Pendiente' | 'Aprobado' | 'Rechazado',
                                    )
                                }
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                            </Select>
                        </label>
                    ) : undefined
                }
            >
                {donacionSeleccionada && (
                    <>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <p className="m-0 text-sm text-slate-600">
                                <strong className="text-slate-800">Tipo:</strong>{' '}
                                {donacionSeleccionada.anonimo ? 'Anónimo' : 'Identificado'}
                            </p>
                            <p className="m-0 text-sm text-slate-600">
                                <strong className="text-slate-800">Correo:</strong>{' '}
                                {donacionSeleccionada.correo}
                            </p>
                            <p className="m-0 text-sm text-slate-600">
                                <strong className="text-slate-800">Teléfono:</strong>{' '}
                                {donacionSeleccionada.telefono || 'No provisto'}
                            </p>
                        </div>
                        <div className="mt-4">
                            <strong className="text-sm text-slate-800">Insumos ofrecidos</strong>
                            <p className="mt-1.5 rounded-xl border border-border-strong bg-surface-muted p-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                                {donacionSeleccionada.detalle}
                            </p>
                        </div>
                    </>
                )}
            </AdminRecordDetailSheet>
        </AdminModule>
    );
}
