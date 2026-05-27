import React, { useState } from 'react';
import './CreateUserModal.css';
import { Usuario } from 'src/types/Usuario';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserData) => void;
  users: Usuario[];
}

interface CreateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
  rol: 'user' | 'admin';
}

interface FormErrors {
  nombre?: string;
  correo?: string;
  telefono?: string;
  contraseña?: string;
  rol?: string;
}

const CreateUserModal: React.FC<Props> = ({ isOpen, onClose, onSave, users }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    nombre: '',
    correo: '',
    telefono: '',
    contraseña: '',
    rol: 'user',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    // Validación estricta: solo permite .com, .es, .org
    const validDomainsRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org)$/i;
    return validDomainsRegex.test(email);
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

    //alidacion correo
    const correoTrim = formData.correo.trim();
    if (!correoTrim) {
      nuevosErrores.correo = 'El correo es requerido.';
    } else if (!validateEmail(correoTrim)) {
      nuevosErrores.correo = 'Solo se permiten dominios .com, .es o .org';
    } else if (users.some(u => u.Email.toLowerCase() === correoTrim.toLowerCase())) {
    nuevosErrores.correo = 'Ya existe una cuenta con este correo.'; //validar si ya hay una cuenta registrada con el mismo correo introducido
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

    // Validar rol
    if (!formData.rol) {
      nuevosErrores.rol = 'Selecciona un rol de usuario.';
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

    onSave(formData);

    // Limpiar formulario
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
      rol: 'user',
    });
    setErrors({});
    setTouchedFields(new Set());
  };

  const handleTelefono = (value: string) => {
    const soloNumeros = value.replace(/\D/g, '').slice(0, 8);
    const formateado = soloNumeros.length > 4
      ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
      : soloNumeros;
    handleInputChange('telefono', formateado);
  };

  const getFieldClassName = (field: string): string => {
    let className = 'modal-form-group';
    if (touchedFields.has(field) || errors[field as keyof FormErrors]) {
      if (errors[field as keyof FormErrors]) {
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

            {/* Campo Rol */}
            <div className={getFieldClassName('rol')}>
              <label htmlFor="rol">Rol de Usuario</label>
              <select
                id="rol"
                value={formData.rol}
                onChange={(e) => handleInputChange('rol', e.target.value)}
                onBlur={() => handleFieldBlur('rol')}
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
              {errors.rol && (
                <span className="modal-form-error">⚠ {errors.rol}</span>
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
