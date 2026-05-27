import React, { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './CreateUserModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserData) => void;
}

interface CreateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
}

interface FormErrors {
  nombre?: string;
  correo?: string;
  telefono?: string;
  contraseña?: string;
  captcha?: string;
}

const CreateUserModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    nombre: '',
    correo: '',
    telefono: '',
    contraseña: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const captchaRef = useRef<ReCAPTCHA>(null);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const nuevosErrores: FormErrors = {};

    // Validar nombre
    const nombreTrim = formData.nombre.trim();
    if (!nombreTrim) {
      nuevosErrores.nombre = 'El nombre es requerido.';
    } else if (nombreTrim.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.';
    } else if (nombreTrim.length > 100) {
      nuevosErrores.nombre = 'El nombre no puede superar los 100 caracteres.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras.';
    }

    // Validar correo
    const correoTrim = formData.correo.trim();
    if (!correoTrim) {
      nuevosErrores.correo = 'El correo es requerido.';
    } else if (!validateEmail(correoTrim)) {
      nuevosErrores.correo = 'Ingresá un correo válido. Ej: nombre@dominio.com';
    }

    // Validar teléfono
    const telefonoTrim = formData.telefono.trim();
    if (!telefonoTrim) {
      nuevosErrores.telefono = 'El teléfono es requerido.';
    } else if (!validatePhone(telefonoTrim)) {
      nuevosErrores.telefono = 'El formato debe ser 8888-8888.';
    }

    // Validar contraseña
    const contraseñaTrim = formData.contraseña.trim();
    if (!contraseñaTrim) {
      nuevosErrores.contraseña = 'La contraseña es requerida.';
    } else if (contraseñaTrim.length < 8) {
      nuevosErrores.contraseña = 'La contraseña debe tener mínimo 8 caracteres.';
    } else if (contraseñaTrim.length > 64) {
      nuevosErrores.contraseña = 'La contraseña no puede superar 64 caracteres.';
    }

    // Validar reCAPTCHA
    if (!captchaToken) {
      nuevosErrores.captcha = 'Por favor completá el reCAPTCHA.';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario comienza a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleFieldBlur = (field: keyof CreateUserData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log('Datos del usuario:', formData);
    console.log('Token reCAPTCHA:', captchaToken);

    onSave(formData);

    // Limpiar formulario
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
    });
    setErrors({});
    setTouchedFields(new Set());
    setCaptchaToken(null);
    captchaRef.current?.reset();
  };

  const handleTelefono = (value: string) => {
    const soloNumeros = value.replace(/\D/g, '').slice(0, 8);
    const formateado = soloNumeros.length > 4
      ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
      : soloNumeros;
    handleInputChange('telefono', formateado);
  };

  const getFieldClassName = (field: keyof CreateUserData): string => {
    let className = 'modal-form-group';
    if (touchedFields.has(field) || errors[field]) {
      if (errors[field]) {
        className += ' modal-form-group--error';
      } else {
        className += ' modal-form-group--success';
      }
    }
    return className;
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>CREAR NUEVO USUARIO</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Campo Nombre */}
            <div className={getFieldClassName('nombre')}>
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                placeholder="Ej: Juan Pérez González"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                onBlur={() => handleFieldBlur('nombre')}
              />
              {errors.nombre && (
                <span className="modal-form-error">⚠ {errors.nombre}</span>
              )}
            </div>

            {/* Campo Correo */}
            <div className={getFieldClassName('correo')}>
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                placeholder="Ej: ejemplo@correo.com"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                onBlur={() => handleFieldBlur('correo')}
              />
              {errors.correo && (
                <span className="modal-form-error">⚠ {errors.correo}</span>
              )}
            </div>

            {/* Campo Teléfono y Contraseña en fila */}
            <div className="modal-form-row">
              <div className={getFieldClassName('telefono')}>
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="Ej: 8888-8888"
                  value={formData.telefono}
                  onChange={(e) => handleTelefono(e.target.value)}
                  onBlur={() => handleFieldBlur('telefono')}
                  maxLength={9}
                />
                {errors.telefono && (
                  <span className="modal-form-error">⚠ {errors.telefono}</span>
                )}
              </div>
              <div className={getFieldClassName('contraseña')}>
                <label htmlFor="contraseña">
                  Contraseña
                  <span className="modal-form-char-count">
                    ({formData.contraseña.length}/64)
                  </span>
                </label>
                <input
                  id="contraseña"
                  type="password"
                  placeholder="Min. 8 caracteres"
                  value={formData.contraseña}
                  onChange={(e) => handleInputChange('contraseña', e.target.value)}
                  onBlur={() => handleFieldBlur('contraseña')}
                  maxLength={64}
                />
                {errors.contraseña && (
                  <span className="modal-form-error">⚠ {errors.contraseña}</span>
                )}
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className={`modal-form-group modal-captcha-group ${errors.captcha ? 'modal-form-group--error' : ''}`}>
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(token: string | null) => {
                  setCaptchaToken(token);
                  if (token) {
                    setErrors((prev) => ({
                      ...prev,
                      captcha: undefined,
                    }));
                  }
                }}
                onExpired={() => setCaptchaToken(null)}
              />
              {errors.captcha && (
                <span className="modal-form-error">⚠ {errors.captcha}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={onClose}
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn--primary"
            >
              CREAR USUARIO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
