import React, { useState, useEffect } from 'react';
import { Usuario } from '../../../../types/Usuario';
import '../CreateUserModal/CreateUserModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserData) => void;
  usuario: Usuario | null;
  users: Usuario[];
}

interface UpdateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
  rol: boolean;
  estado: boolean;
}

interface FormErrors {
  nombre?: string;
  correo?: string;
  telefono?: string;
  contraseña?: string;
}

const UpdateUserModal: React.FC<Props> = ({ isOpen, onClose, onSave, usuario, users }) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    nombre: '',
    correo: '',
    telefono: '',
    contraseña: '',
    rol: false,
    estado: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (usuario && isOpen) {
      setFormData({
        nombre: usuario.UserName,
        correo: usuario.Email,
        telefono: usuario.PhoneNumber,
        contraseña: usuario.Password,
        rol: usuario.UserRole,
        estado: usuario.State,
      });
      setErrors({});
      setTouchedFields(new Set());
    }
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const validDomainsRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org)$/i;
    return validDomainsRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const nuevosErrores: FormErrors = {};

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

    const correoTrim = formData.correo.trim();
    if (!correoTrim) {
      nuevosErrores.correo = 'El correo es requerido.';
    } else if (!validateEmail(correoTrim)) {
      nuevosErrores.correo = 'Solo se permiten dominios .com, .es o .org';
    } else if (
      users.some(
        u => u.Email.toLowerCase() === correoTrim.toLowerCase() &&
        u.ID !== usuario?.ID // permitir el mismo correo del usuario que se edita
      )
    ) {
      nuevosErrores.correo = 'Ya existe una cuenta con este correo.';
    }

    const telefonoTrim = formData.telefono.trim();
    if (!telefonoTrim) {
      nuevosErrores.telefono = 'El teléfono es requerido.';
    } else if (!validatePhone(telefonoTrim)) {
      nuevosErrores.telefono = 'El formato debe ser 8888-8888.';
    }

    const contraseñaTrim = formData.contraseña.trim();
    if (!contraseñaTrim) {
      nuevosErrores.contraseña = 'La contraseña es requerida.';
    } else if (contraseñaTrim.length < 8) {
      nuevosErrores.contraseña = 'La contraseña debe tener mínimo 8 caracteres.';
    } else if (contraseñaTrim.length > 64) {
      nuevosErrores.contraseña = 'La contraseña no puede superar 64 caracteres.';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (field: keyof UpdateUserData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
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
      className += errors[field as keyof FormErrors]
        ? ' modal-form-group--error'
        : ' modal-form-group--success';
    }
    return className;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>EDITAR USUARIO</h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            <div className={getFieldClassName('nombre')}>
              <label htmlFor="u-nombre">Nombre completo</label>
              <input
                id="u-nombre"
                type="text"
                placeholder="Ej: Juan Pérez González"
                value={formData.nombre}
                onChange={e => handleInputChange('nombre', e.target.value)}
                onBlur={() => handleFieldBlur('nombre')}
              />
              {errors.nombre && <span className="modal-form-error">⚠ {errors.nombre}</span>}
            </div>

            <div className={getFieldClassName('correo')}>
              <label htmlFor="u-correo">Correo electrónico</label>
              <input
                id="u-correo"
                type="email"
                placeholder="Ej: ejemplo@correo.com"
                value={formData.correo}
                onChange={e => handleInputChange('correo', e.target.value)}
                onBlur={() => handleFieldBlur('correo')}
              />
              {errors.correo && <span className="modal-form-error">⚠ {errors.correo}</span>}
            </div>

            <div className="modal-form-row">
              <div className={getFieldClassName('telefono')}>
                <label htmlFor="u-telefono">Teléfono</label>
                <input
                  id="u-telefono"
                  type="tel"
                  placeholder="Ej: 8888-8888"
                  value={formData.telefono}
                  onChange={e => handleTelefono(e.target.value)}
                  onBlur={() => handleFieldBlur('telefono')}
                  maxLength={9}
                />
                {errors.telefono && <span className="modal-form-error">⚠ {errors.telefono}</span>}
              </div>
              <div className={getFieldClassName('contraseña')}>
                <label htmlFor="u-contraseña">
                  Contraseña
                  <span className="modal-form-char-count">({formData.contraseña.length}/64)</span>
                </label>
                <input
                  id="u-contraseña"
                  type="password"
                  placeholder="Min. 8 caracteres"
                  value={formData.contraseña}
                  onChange={e => handleInputChange('contraseña', e.target.value)}
                  onBlur={() => handleFieldBlur('contraseña')}
                  maxLength={64}
                />
                {errors.contraseña && <span className="modal-form-error">⚠ {errors.contraseña}</span>}
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label htmlFor="u-rol">Rol de Usuario</label>
                <select
                  id="u-rol"
                  value={formData.rol ? 'admin' : 'user'}
                  onChange={e => handleInputChange('rol', e.target.value === 'admin')}
                  onBlur={() => handleFieldBlur('rol')}
                >
                  <option value="user">Usuario Regular</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label htmlFor="u-estado">Estado</label>
                <select
                  id="u-estado"
                  value={formData.estado ? 'active' : 'inactive'}
                  onChange={e => handleInputChange('estado', e.target.value === 'active')}
                  onBlur={() => handleFieldBlur('estado')}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              CANCELAR
            </button>
            <button type="submit" className="modal-btn modal-btn--primary">
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;