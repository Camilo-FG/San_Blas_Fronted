import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import '../CreateUserModal/CreateUserModal.css';
import { Usuario } from '../../../../types/Usuario';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserData) => void;
  usuario: Usuario | null;
  users: Usuario[];
}

export interface UpdateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
  rol: 'user' | 'admin';
  estado: boolean;
}

const UpdateUserModal: React.FC<Props> = ({ isOpen, onClose, onSave, usuario, users }) => {

  const form = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
      rol: 'user' as 'user' | 'admin',
      estado: true,
    },
    onSubmit: async ({ value }) => {
      onSave(value);
    },
  });

  //cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (usuario && isOpen) {
      form.setFieldValue('nombre', usuario.userName);
      form.setFieldValue('correo', usuario.email);
      form.setFieldValue('telefono', usuario.phoneNumber);
      form.setFieldValue('contraseña', '');
      form.setFieldValue('rol', usuario.role === 'admin' ? 'admin' : 'user');
      form.setFieldValue('estado', usuario.state);
    }
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org)$/i.test(email);
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
          <h2>EDITAR USUARIO</h2>
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
                  if (usuario && v === usuario.userName.trim()) return undefined;
                  if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
                  if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
                  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return 'El nombre solo puede contener letras.';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                  <label htmlFor="u-nombre">Nombre completo</label>
                  <input
                    id="u-nombre"
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
                  if (users.some(u => u.email.toLowerCase() === v.toLowerCase() && u.id !== usuario?.id))
                    return 'Ya existe una cuenta con este correo.';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                  <label htmlFor="u-correo">Correo electrónico</label>
                  <input
                    id="u-correo"
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
                    <label htmlFor="u-telefono">Teléfono</label>
                    <input
                      id="u-telefono"
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

              {/* Contraseña */}
              <form.Field
                name="contraseña"
                validators={{
                  onBlur: ({ value }) => {
                    const v = value.trim();
                    if (!v) return undefined;
                    if (v.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
                    if (v.length > 64) return 'La contraseña no puede superar 64 caracteres.';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className={`modal-form-group ${field.state.meta.errors.length > 0 ? 'modal-form-group--error' : field.state.meta.isTouched && field.state.value ? 'modal-form-group--success' : ''}`}>
                    <label htmlFor="u-contraseña">
                      Nueva contraseña
                      <span className="modal-form-char-count">({field.state.value.length}/64)</span>
                    </label>
                    <input
                      id="u-contraseña"
                      type="password"
                      placeholder="Dejar vacío para no cambiar"
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

            <div className="modal-form-row">
              {/* Rol */}
              <form.Field name="rol">
                {(field) => (
                  <div className="modal-form-group">
                    <label htmlFor="u-rol">Rol de Usuario</label>
                    <select
                      id="u-rol"
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

              {/* Estado */}
              <form.Field name="estado">
                {(field) => (
                  <div className="modal-form-group">
                    <label htmlFor="u-estado">Estado</label>
                    <select
                      id="u-estado"
                      value={field.state.value ? 'active' : 'inactive'}
                      onChange={e => field.handleChange(e.target.value === 'active')}
                      onBlur={field.handleBlur}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                )}
              </form.Field>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              cancelar
            </button>
            <button type="submit" className="modal-btn modal-btn--primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;