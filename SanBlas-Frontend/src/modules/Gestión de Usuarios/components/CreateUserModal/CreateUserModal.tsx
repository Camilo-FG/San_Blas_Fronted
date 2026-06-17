import React from 'react';
import { useForm } from '@tanstack/react-form';
import './CreateUserModal.css';
import { Usuario } from '../../../../types/Usuario';

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

const CreateUserModal: React.FC<Props> = ({ isOpen, onClose, onSave, users }) => {

  const form = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
      rol: 'user' as 'user' | 'admin',
    },
    onSubmit: async ({ value }) => {
      onSave(value);
      form.reset();
    },
  });

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const validDomainsRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org)$/i;
    return validDomainsRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\d{4}-\d{4}$/.test(phone);
  };

  const formatTelefono = (value: string) => {
    const soloNumeros = value.replace(/\D/g, '').slice(0, 8);
    return soloNumeros.length > 4
      ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
      : soloNumeros;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>CREAR NUEVO USUARIO</h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
          <div className="modal-body">

            {/* Nombre */}
            <form.Field
              name="nombre"
              validators={{
                onBlur: ({ value }) => {
                  const v = value.trim();
                  if (!v) return 'El nombre es requerido.';
                  if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
                  if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
                  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return 'El nombre solo puede contener letras.';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Juan Pérez González"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="modal-form-error">⚠ {field.state.meta.errors[0]}</span>
                  )}
                </div>
              )}
            </form.Field>

            {/* Correo */}
            <form.Field
              name="correo"
              validators={{
                onBlur: ({ value }) => {
                  const v = value.trim();
                  if (!v) return 'El correo es requerido.';
                  if (!validateEmail(v)) return 'Solo se permiten dominios .com, .es o .org';
                  if (users.some(u => u.Email.toLowerCase() === v.toLowerCase()))
                    return 'Ya existe una cuenta con este correo.';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                  <label htmlFor="correo">Correo electrónico</label>
                  <input
                    id="correo"
                    type="email"
                    placeholder="Ej: ejemplo@correo.com"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="modal-form-error">⚠ {field.state.meta.errors[0]}</span>
                  )}
                </div>
              )}
            </form.Field>

            <div className="modal-form-row">
              <form.Field
                name="telefono"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return 'El teléfono es requerido.';
                    if (!validatePhone(value)) return 'El formato debe ser 8888-8888.';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      type="tel"
                      placeholder="Ej: 8888-8888"
                      value={field.state.value}
                      onChange={e => field.handleChange(formatTelefono(e.target.value))}
                      onBlur={field.handleBlur}
                      maxLength={9}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <span className="modal-form-error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="contraseña"
                validators={{
                  onBlur: ({ value }) => {
                    const v = value.trim();
                    if (!v) return 'La contraseña es requerida.';
                    if (v.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
                    if (v.length > 64) return 'La contraseña no puede superar 64 caracteres.';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                    <label htmlFor="contraseña">
                      Contraseña
                      <span className="modal-form-char-count">({field.state.value.length}/64)</span>
                    </label>
                    <input
                      id="contraseña"
                      type="password"
                      placeholder="Min. 8 caracteres"
                      value={field.state.value}
                      onChange={e => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      maxLength={64}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <span className="modal-form-error">⚠ {field.state.meta.errors[0]}</span>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Rol */}
            <form.Field name="rol">
              {(field) => (
                <div className="modal-form-group">
                  <label htmlFor="rol">Rol de Usuario</label>
                  <select
                    id="rol"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value as 'user' | 'admin')}
                    onBlur={field.handleBlur}
                  >
                    <option value="user">Usuario Regular</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              )}
            </form.Field>

          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              cancelar
            </button>
            <button type="submit" className="modal-btn modal-btn--primary">
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;