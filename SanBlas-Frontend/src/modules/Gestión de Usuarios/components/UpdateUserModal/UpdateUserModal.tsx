import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Usuario } from '../../../../types/Usuario';
import { opcionesSelectRol, type Rol } from '../../../../types/Rol';
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  Select,
} from '../../../../shared/ui';
import { normalizarTexto } from '../../Utils/normalizarTexto';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserData) => void;
  usuario: Usuario | null;
  users: Usuario[];
  roles: Rol[];
  esUsuarioActual?: boolean;
}

export interface UpdateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
  rol: string;
  estado: boolean;
}

const UpdateUserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  usuario,
  users,
  roles,
  esUsuarioActual = false,
}) => {
  const form = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
      rol: 'user',
      estado: true,
    },
    onSubmit: async ({ value }) => {
      onSave({
        ...value,
        nombre: normalizarTexto(value.nombre),
        correo: normalizarTexto(value.correo),
        telefono: normalizarTexto(value.telefono),
        contraseña: value.contraseña.trim(),
      });
    },
  });

  useEffect(() => {
    if (usuario && isOpen) {
      form.setFieldValue('nombre', usuario.userName);
      form.setFieldValue('correo', usuario.email);
      form.setFieldValue('telefono', usuario.phoneNumber);
      form.setFieldValue('contraseña', '');
      form.setFieldValue('rol', usuario.role);
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

  const normalizarFormulario = () => {
    const valores = form.state.values;
    form.setFieldValue('nombre', normalizarTexto(valores.nombre));
    form.setFieldValue('correo', normalizarTexto(valores.correo));
    form.setFieldValue('telefono', normalizarTexto(valores.telefono));
    form.setFieldValue('contraseña', valores.contraseña.trim());
  };

  const validarNombre = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El nombre es requerido.';
    if (usuario && v === normalizarTexto(usuario.userName)) return undefined;
    if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return 'El nombre solo puede contener letras.';
    return undefined;
  };

  const validarCorreo = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El correo es requerido.';
    if (!validateEmail(v)) return 'Solo se permiten dominios .com, .es o .org';
    if (
      users.some(
        (u) => u.email.toLowerCase() === v.toLowerCase() && u.id !== usuario?.id,
      )
    ) {
      return 'Ya existe una cuenta con este correo.';
    }
    return undefined;
  };

  const validarTelefono = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El teléfono es requerido.';
    if (!validatePhone(v)) return 'El formato debe ser 8888-8888.';
    return undefined;
  };

  const validarContraseña = (value: string) => {
    const v = value.trim();
    if (!v) return undefined;
    if (v.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
    if (v.length > 64) return 'La contraseña no puede superar 64 caracteres.';
    return undefined;
  };

  return (
    <Modal onClose={onClose} title="Editar usuario" cerrarAlClicFuera={false}>
      <h3 className="mb-4 pr-10 text-lg font-bold text-royal-blue">
        Editar usuario
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          normalizarFormulario();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4">
          <form.Field
            name="nombre"
            validators={{
              onBlur: ({ value }) => validarNombre(value),
              onSubmit: ({ value }) => validarNombre(value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="u-nombre">Nombre completo</Label>
                <Input
                  id="u-nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez González"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                />
                <FieldError message={field.state.meta.errors[0]} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="correo"
            validators={{
              onBlur: ({ value }) => validarCorreo(value),
              onSubmit: ({ value }) => validarCorreo(value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="u-correo">Correo electrónico</Label>
                <Input
                  id="u-correo"
                  type="email"
                  placeholder="Ej: ejemplo@correo.com"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                />
                <FieldError message={field.state.meta.errors[0]} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              name="telefono"
              validators={{
                onBlur: ({ value }) => validarTelefono(value),
                onSubmit: ({ value }) => validarTelefono(value),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="u-telefono">Teléfono</Label>
                  <Input
                    id="u-telefono"
                    type="tel"
                    placeholder="Ej: 8888-8888"
                    value={field.state.value}
                    hasError={field.state.meta.errors.length > 0}
                    onChange={(e) => field.handleChange(formatTelefono(e.target.value))}
                    onBlur={() => {
                      field.handleChange(normalizarTexto(field.state.value));
                      field.handleBlur();
                    }}
                    maxLength={9}
                  />
                  <FieldError message={field.state.meta.errors[0]} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="contraseña"
              validators={{
                onBlur: ({ value }) => validarContraseña(value),
                onSubmit: ({ value }) => validarContraseña(value),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="u-contraseña">
                    Nueva contraseña
                    <span className="ml-1.5 font-normal text-text-muted">
                      ({field.state.value.length}/64)
                    </span>
                  </Label>
                  <Input
                    id="u-contraseña"
                    type="password"
                    placeholder="Dejar vacío para no cambiar"
                    value={field.state.value}
                    hasError={field.state.meta.errors.length > 0}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={() => {
                      field.handleChange(field.state.value.trim());
                      field.handleBlur();
                    }}
                    maxLength={64}
                  />
                  <FieldError message={field.state.meta.errors[0]} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="rol">
              {(field) => (
                <div>
                  <Label htmlFor="u-rol">Rol de Usuario</Label>
                  <Select
                    id="u-rol"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={esUsuarioActual}
                  >
                    {opcionesSelectRol(roles, field.state.value).map((rol) => (
                      <option key={rol.clave} value={rol.clave}>
                        {rol.nombre}
                      </option>
                    ))}
                  </Select>
                  {esUsuarioActual && (
                    <p className="mt-1.5 text-xs text-text-muted">
                      No puede cambiar su propio rol.
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="estado">
              {(field) => (
                <div>
                  <Label htmlFor="u-estado">Estado</Label>
                  <Select
                    id="u-estado"
                    value={field.state.value ? 'active' : 'inactive'}
                    onChange={(e) => field.handleChange(e.target.value === 'active')}
                    onBlur={field.handleBlur}
                    disabled={esUsuarioActual}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </Select>
                  {esUsuarioActual && (
                    <p className="mt-1.5 text-xs text-text-muted">
                      No puede inactivar su propia cuenta.
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border-strong pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" variant="royal">
            Guardar cambios
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateUserModal;
