import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useCaptcha } from '../../../shared/hooks/useCaptcha';
import './DonacionForm.css';

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
    captcha?: string;
}

export default function DonacionForm(): React.JSX.Element {
    const [formData, setFormData] = useState<FormData>({
        anonimo: false,
        nombre: '',
        correo: '',
        telefono: '',
        detalle: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const { captchaRef, captchaToken, handleCaptchaChange, handleCaptchaExpired, resetCaptcha } = useCaptcha();
    const [enviado, setEnviado] = useState<boolean>(false); 

    const validar = (): boolean => {
        const nuevosErrores: FormErrors = {};
        
        if (!captchaToken) {
            nuevosErrores.captcha = 'Por favor completá el reCAPTCHA.';
        }

        if (!formData.anonimo) {
            const nombreTrim = formData.nombre.trim();
            if (!nombreTrim) {
                nuevosErrores.nombre = 'El nombre completo es requerido.';
            } 
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
                nuevosErrores.nombre = 'El nombre solo puede contener letras.';
            } 
            else if (!nombreTrim.includes(' ') || nombreTrim.split(/\s+/).length < 2) {
                nuevosErrores.nombre = 'Por favor, ingresá tu nombre y al menos un apellido.';
            }
        }

        const correoTrim = formData.correo.trim();
        if (!correoTrim) {
            nuevosErrores.correo = 'El correo electrónico es requerido.';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correoTrim)) {
            nuevosErrores.correo = 'Ingresá un correo válido. Ej: nombre@dominio.com';
        }

        if (!formData.anonimo) {
            if (!formData.telefono.trim()) {
                nuevosErrores.telefono = 'El teléfono es requerido.';
            } else if (!/^\d{4}-\d{4}$/.test(formData.telefono)) {
                nuevosErrores.telefono = 'El formato debe ser 8888-8888.';
            }
        }

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
        
        setEnviado(true);
        setFormData({ anonimo: false, nombre: '', correo: '', telefono: '', detalle: '' });
        resetCaptcha();
    };

    const handleHacerOtraDonacion = () => {
        setFormData({ anonimo: false, nombre: '', correo: '', telefono: '', detalle: '' });
        resetCaptcha();
        setErrors({});
        setEnviado(false); 
        
        setTimeout(() => {
            captchaRef.current?.reset();
        }, 50);
    };

    return (
        <div className={`formulario-container ${enviado ? 'enviado' : ''}`}>
            {enviado ? (
                <div className="exito-container">
                    <div className="checkmark-circle">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    <h3 className="exito-titulo">
                        ¡Donación enviada con éxito!
                    </h3>

                    <p className="exito-texto">
                        Gracias por tu generosidad. Nos pondremos en contacto con vos pronto.
                    </p>

                    <button onClick={handleHacerOtraDonacion} className="btn-otra-donacion">
                        Hacer otra donación
                    </button>
                </div>
            ) : (
                <>
                    <h3 className="formulario-titulo">
                        Formulario de Donación de Insumos
                    </h3>
                    <p className="formulario-descripcion">
                        Completá el formulario para registrar tu donación de insumos.
                    </p>

                    <div className="checkbox-anonimo-container" onClick={() => {
                        setFormData(prev => ({ ...prev, anonimo: !prev.anonimo, nombre: '', telefono: '' }));
                        setErrors(prev => ({ ...prev, nombre: undefined, telefono: undefined }));
                    }}>
                        <div className={`checkbox-box ${formData.anonimo ? 'checked' : ''}`}>
                            {formData.anonimo && <span className="checkbox-check">✓</span>}
                        </div>
                        <div>
                            <p className="checkbox-titulo">Donar de forma anónima</p>
                            <p className="checkbox-subtitulo">
                                {formData.anonimo ? 'Solo se pedirá tu correo y el detalle de la donación.' : 'Se pedirá nombre completo, correo, teléfono y detalle.'}
                            </p>
                        </div>
                    </div>

                    {!formData.anonimo && (
                        <div className="form-group">
                            <label className="form-label">Nombre completo</label>
                            <input
                                type="text"
                                placeholder="Ej: Juan Pérez González"
                                value={formData.nombre}
                                onChange={e => handleChange('nombre', e.target.value)}
                                className={`form-input ${errors.nombre ? 'input-error' : ''}`}
                            />
                            {errors.nombre && <span className="form-error">⚠ {errors.nombre}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="Ej: ejemplo@correo.com"
                            value={formData.correo}
                            onChange={e => handleChange('correo', e.target.value)}
                            className={`form-input ${errors.correo ? 'input-error' : ''}`}
                        />
                        {errors.correo && <span className="form-error">⚠ {errors.correo}</span>}
                    </div>

                    {!formData.anonimo && (
                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input
                                type="text"
                                placeholder="Ej: 8888-8888"
                                value={formData.telefono}
                                onChange={e => handleTelefono(e.target.value)}
                                className={`form-input ${errors.telefono ? 'input-error' : ''}`}
                                maxLength={9}
                            />
                            {errors.telefono && <span className="form-error">⚠ {errors.telefono}</span>}
                        </div>
                    )}

                    <div className="form-group last">
                        <label className="form-label">
                            Detalle de la donación 
                            <span className="form-label-count">({formData.detalle.length}/300)</span>
                        </label>
                        <textarea
                            placeholder="Ej: Ropa en buen estado para niños de 5 a 10 años"
                            value={formData.detalle}
                            onChange={e => handleChange('detalle', e.target.value)}
                            rows={4}
                            maxLength={300}
                            className={`form-input form-textarea ${errors.detalle ? 'input-error' : ''}`}
                        />
                        {errors.detalle && <span className="form-error">⚠ {errors.detalle}</span>}
                    </div>

                    <div className="captcha-container">
                        <ReCAPTCHA
                            ref={captchaRef}
                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                            onChange={(token: string | null) => {
                                handleCaptchaChange(token);
                                setErrors(prev => ({ ...prev, captcha: undefined }));
                            }}
                            onExpired={handleCaptchaExpired}
                        />
                        {errors.captcha && <span className="form-error">⚠ {errors.captcha}</span>}
                    </div>

                    <button onClick={handleSubmit} className="btn-enviar">
                        Enviar Donación
                    </button>
                </>
            )}
        </div>
    );
}