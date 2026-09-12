import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { isAdminRole, type Usuario } from '../../../../types/Usuario';
import {
  opcionesSelectRol,
  ROLES_ASIGNABLES,
  type Rol,
} from '../../../../types/Rol';
import { useAuth } from '../../../../context/AuthContext';
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  Select,
} from '../../../../shared/ui';
import { normalizarTexto } from '../../Utils/normalizarTexto';

interface CreateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
  confirmarContraseña: string;
  rol: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserData) => Promise<boolean>;
  users: Usuario[];
  roles: Rol[];
  guardando?: boolean;
}

const REGEX_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const mensajeErrorCampo = (errors: unknown[]) => {
  const first = errors[0];
  return typeof first === 'string' ? first : undefined;
};

const CreateUserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  users,
  roles,
  guardando = false,
}) => {
  const form = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
      confirmarContraseña: '',
      rol: '',
    },
    onSubmit: async ({ value }) => {
      const ok = await onSave({
        ...value,
        nombre: normalizarTexto(value.nombre),
        correo: normalizarTexto(value.correo),
        telefono: normalizarTexto(value.telefono),
        contraseña: value.contraseña.trim(),
        confirmarContraseña: value.confirmarContraseña.trim(),
      });
      if (ok) {
        form.reset();
      }
    },
  });

  const { user: usuarioSesion } = useAuth();
  // solo un admin puede otorgar el rol admin; el resto solo puede crear usuarios normales
  const rolesPermitidos = isAdminRole(usuarioSesion?.role ?? '')
    ? [...ROLES_ASIGNABLES]
    : [ROLES_ASIGNABLES[ROLES_ASIGNABLES.length - 1]];

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

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

  const normalizarFormulario = () => {
    const valores = form.state.values;
    form.setFieldValue('nombre', normalizarTexto(valores.nombre));
    form.setFieldValue('correo', normalizarTexto(valores.correo));
    form.setFieldValue('telefono', normalizarTexto(valores.telefono));
    form.setFieldValue('contraseña', valores.contraseña.trim());
    form.setFieldValue('confirmarContraseña', valores.confirmarContraseña.trim());
  };

  const validarNombre = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El nombre es requerido.';
    if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return 'El nombre solo puede contener letras.';
    return undefined;
  };

  const validarCorreo = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El correo es requerido.';
    if (!validateEmail(v)) return 'Solo se permiten dominios .com, .es o .org';
    if (users.some((u) => u.email.toLowerCase() === v.toLowerCase())) {
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
    if (!v) return 'La contraseña es requerida.';
    if (v.length > 64) return 'La contraseña no puede superar 64 caracteres.';
    if (!REGEX_PASSWORD.test(v)) {
      return 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
    }
    return undefined;
  };

  const validarConfirmacion = (value: string) => {
    const v = value.trim();
    if (!v) return 'Confirme la contraseña.';
    if (v !== form.getFieldValue('contraseña').trim()) return 'Las contraseñas no coinciden.';
    return undefined;
  };

  // el rol es obligatorio y ya no se asigna 'user' por defecto; se bloquea el submit si queda vacío
  const validarRol = (value: string) => {
    if (!value) return 'Seleccione un rol para el usuario.';
    return undefined;
  };

  return (
    <Modal
      onClose={guardando ? () => undefined : onClose}
      title="Crear nuevo usuario"
      cerrarAlClicFuera={false}
    >
      <h3 className="mb-4 pr-10 text-lg font-bold text-royal-blue">
        Crear nuevo usuario
      </h3>

      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          normalizarFormulario();
          void form.handleSubmit();
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
                <Label htmlFor="nombre" required>
                  Nombre completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez González"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                  disabled={guardando}
                />
                <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
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
                <Label htmlFor="correo" required>
                  Correo electrónico
                </Label>
                  <Input
                    id="correo"
                    type="email"
                    autoComplete="off"
                    placeholder="Ej: ejemplo@correo.com"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                  disabled={guardando}
                />
                <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
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
                  <Label htmlFor="telefono" required>
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
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
                    disabled={guardando}
                  />
                  <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
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
                  <Label htmlFor="nueva-contrasena-usuario" required>
                    Contraseña
                    <span className="ml-1.5 font-normal text-text-muted">
                      ({field.state.value.length}/64)
                    </span>
                  </Label>
                  <Input
                    id="nueva-contrasena-usuario"
                    name="nueva-contrasena-usuario"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Escriba una contraseña"
                    value={field.state.value}
                    hasError={field.state.meta.errors.length > 0}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={() => {
                      field.handleChange(field.state.value.trim());
                      field.handleBlur();
                    }}
                    maxLength={64}
                    disabled={guardando}
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    Incluya mayúscula, minúscula, número y carácter especial.
                  </p>
                  <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="confirmarContraseña"
            validators={{
              onBlur: ({ value }) => validarConfirmacion(value),
              onSubmit: ({ value }) => validarConfirmacion(value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="confirmar-contrasena-usuario" required>
                  Confirmar contraseña
                </Label>
                <Input
                  id="confirmar-contrasena-usuario"
                  name="confirmar-contrasena-usuario"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita la contraseña"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => {
                    field.handleChange(field.state.value.trim());
                    field.handleBlur();
                  }}
                  maxLength={64}
                  disabled={guardando}
                />
                <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="rol"
            validators={{
              onBlur: ({ value }) => validarRol(value),
              onSubmit: ({ value }) => validarRol(value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="rol" required>
                  Rol de Usuario
                </Label>
                <Select
                  id="rol"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={guardando}
                >
                  <option value="">Seleccione un rol</option>
                  {opcionesSelectRol(
                    roles,
                    field.state.value,
                    rolesPermitidos,
                  ).map((rol) => (
                    <option key={rol.clave} value={rol.clave}>
                      {rol.nombre}
                    </option>
                  ))}
                </Select>
                <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border-strong pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" variant="royal" disabled={guardando}>
            {guardando ? 'Creando...' : 'Crear usuario'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
