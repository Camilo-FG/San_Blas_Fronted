import React, { useState } from 'react';

interface FormData {
    anonimo: boolean;
    nombre: string;
    correo: string;
    telefono: string;
    detalle: string;
}

interface FormErrors {
    nombre?: string;
    correo?: string;
    telefono?: string;
    detalle?: string;
}

export default function FormularioDonacion(): React.JSX.Element {
    const [formData, setFormData] = useState<FormData>({
        anonimo: false,
        nombre: '',
        correo: '',
        telefono: '',
        detalle: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validar = (): boolean => {
        const nuevosErrores: FormErrors = {};

        // 1. Validar NOMBRE COMPLETO (solo si NO es anónimo)
        if (!formData.anonimo) {
            const nombreTrim = formData.nombre.trim();
            if (!nombreTrim) {
                nuevosErrores.nombre = 'El nombre completo es requerido.';
            } 
            // Valida letras/acentos y exige al menos un espacio para asegurar Nombre y Apellido
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
                nuevosErrores.nombre = 'El nombre solo puede contener letras.';
            } 
            else if (!nombreTrim.includes(' ') || nombreTrim.split(/\s+/).length < 2) {
                nuevosErrores.nombre = 'Por favor, ingresá tu nombre y al menos un apellido.';
            }
        }

        // 2. Validar CORREO GENERAL (Acepta gmail, hotmail, yahoo, institucionales, etc.)
        const correoTrim = formData.correo.trim();
        if (!correoTrim) {
            nuevosErrores.correo = 'El correo electrónico es requerido.';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correoTrim)) {
            nuevosErrores.correo = 'Ingresá un correo válido. Ej: nombre@dominio.com';
        }

        // 3. Validar Teléfono (solo si NO es anónimo)
        if (!formData.anonimo) {
            if (!formData.telefono.trim()) {
                nuevosErrores.telefono = 'El teléfono es requerido.';
            } else if (!/^\d{4}-\d{4}$/.test(formData.telefono)) {
                nuevosErrores.telefono = 'El formato debe ser 8888-8888.';
            }
        }

        // 4. Validar Detalle (siempre requerido)
        if (!formData.detalle.trim()) {
            nuevosErrores.detalle = 'El detalle es requerido.';
        } else if (formData.detalle.trim().length < 10) {
            nuevosErrores.detalle = 'El detalle debe tener al menos 10 caracteres.';
        } else if (formData.detalle.trim().length > 300) {
            nuevosErrores.detalle = 'El detalle no puede superar los 300 caracteres.';
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (typeof value === 'string') {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleTelefono = (value: string) => {
        const soloNumeros = value.replace(/\D/g, '').slice(0, 8);
        const formateado = soloNumeros.length > 4
            ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
            : soloNumeros;
        handleChange('telefono', formateado);
    };

    const handleSubmit = () => {
        if (!validar()) return;
        
        console.log('Donación lista para enviar:', formData);
        
        // Limpiamos el formulario tras un envío exitoso
        setFormData({ anonimo: false, nombre: '', correo: '', telefono: '', detalle: '' });
    };

    // Estilos visuales del museo
    const inputStyle = (error?: string): React.CSSProperties => ({
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
        fontSize: '0.95rem',
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    });

    const errorStyle: React.CSSProperties = {
        color: '#ef4444',
        fontSize: '0.82rem',
        marginTop: '4px',
        display: 'block'
    };

    const labelStyle: React.CSSProperties = {
        color: '#003366',
        fontWeight: '600',
        fontSize: '0.9rem',
        marginBottom: '6px',
        display: 'block'
    };

    return (
        <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '36px',
            maxWidth: '700px',
            margin: '0 auto',
            boxShadow: '0 4px 16px rgba(0,51,102,0.08)',
            border: '1px solid #e5e7eb'
        }}>
            <h3 style={{ color: '#003366', marginBottom: '6px', fontSize: '1.4rem' }}>
                🤲 Formulario de Donación de Insumos
            </h3>
            <p style={{ color: '#1F2937', marginBottom: '28px', fontSize: '0.95rem' }}>
                Completá el formulario para registrar tu donación de insumos.
            </p>

            {/* Checkbox anónimo */}
            <div style={{
                backgroundColor: '#F9FAFB',
                border: '2px solid #D4AF37',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
            }}
                onClick={() => {
                    setFormData(prev => ({
                        ...prev,
                        anonimo: !prev.anonimo,
                        nombre: '',
                        telefono: ''
                    }));
                    setErrors({});
                }}
            >
                <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: `2px solid ${formData.anonimo ? '#D4AF37' : '#003366'}`,
                    backgroundColor: formData.anonimo ? '#D4AF37' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                }}>
                    {formData.anonimo && (
                        <span style={{ color: '#003366', fontWeight: 'bold', fontSize: '14px' }}>✓</span>
                    )}
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#003366' }}>
                        Donar de forma anónima
                    </p>

                </div>
            </div>

            {/* Nombre completo */}
            {!formData.anonimo && (
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Nombre completo</label>
                    <input
                        type="text"
                        placeholder="Ej: Juan Pérez González"
                        value={formData.nombre}
                        onChange={e => handleChange('nombre', e.target.value)}
                        style={inputStyle(errors.nombre)}
                    />
                    {errors.nombre && <span style={errorStyle}>⚠ {errors.nombre}</span>}
                </div>
            )}

            {/* Correo */}
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                    type="email"
                    placeholder="Ej: ejemplo@correo.com"
                    value={formData.correo}
                    onChange={e => handleChange('correo', e.target.value)}
                    style={inputStyle(errors.correo)}
                />
                {errors.correo && <span style={errorStyle}>⚠ {errors.correo}</span>}
            </div>

            {/* Teléfono */}
            {!formData.anonimo && (
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                        type="text"
                        placeholder="Ej: 8888-8888"
                        value={formData.telefono}
                        onChange={e => handleTelefono(e.target.value)}
                        style={inputStyle(errors.telefono)}
                        maxLength={9}
                    />
                    {errors.telefono && <span style={errorStyle}>⚠ {errors.telefono}</span>}
                </div>
            )}

            {/* Detalle */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>
                    Detalle de la donación
                    <span style={{ color: '#888', fontWeight: 'normal', marginLeft: '6px' }}>
                        ({formData.detalle.length}/300)
                    </span>
                </label>
                <textarea
                    placeholder="Ej: Ropa en buen estado para niños de 5 a 10 años"
                    value={formData.detalle}
                    onChange={e => handleChange('detalle', e.target.value)}
                    rows={4}
                    maxLength={300}
                    style={{
                        ...inputStyle(errors.detalle),
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                />
                {errors.detalle && <span style={errorStyle}>⚠ {errors.detalle}</span>}
            </div>

            {/* Botón Enviar */}
            <button
                onClick={handleSubmit}
                style={{
                    backgroundColor: '#D4AF37',
                    color: '#003366',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                    transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
                Enviar Donación
            </button>
        </div>
    );
}