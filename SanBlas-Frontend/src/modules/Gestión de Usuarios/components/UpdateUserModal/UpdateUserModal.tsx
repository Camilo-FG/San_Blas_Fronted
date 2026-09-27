import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Eye, EyeOff } from 'lucide-react';
import { type Usuario } from '../../../../types/Usuario';
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

// estilos del botón de ojo para mostrar/ocultar contraseña (mismo look que el login)
const BOTON_OJO =
  'absolute right-2.5 inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-text-muted transition-colors hover:bg-royal-blue/5 hover:text-royal-blue focus-visible:ring-2 focus-visible:ring-royal-blue/25 focus-visible:outline-none';

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
  roles: string[];
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
      roles: [] as string[],
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

  const { user: usuarioSesion } = useAuth();
  // controla si se ve o se oculta el texto de la nueva contraseña
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  // solo un secretario puede otorgar el rol secretario
  const rolesSesion: string[] =
    usuarioSesion?.roles && usuarioSesion.roles.length > 0
      ? usuarioSesion.roles
      : [usuarioSesion?.role ?? 'user'];
  const esSecretarioSesion = rolesSesion.some(
    (rol) => rol.toLowerCase() === 'secretario',
  );
  const rolesPermitidos = esSecretarioSesion
    ? [...ROLES_ASIGNABLES]
    : ROLES_ASIGNABLES.filter((rol) => rol !== 'secretario');

  // al menos un rol obligatorio al guardar
  const validarRoles = (value: string[]) => {
    if (!value || value.length === 0) return 'Seleccione al menos un rol.';
    return undefined;
  };

  useEffect(() => {
    if (usuario && isOpen) {
      form.setFieldValue('nombre', usuario.userName);
      form.setFieldValue('correo', usuario.email);
      form.setFieldValue('telefono', usuario.phoneNumber);
      form.setFieldValue('contraseña', '');
      form.setFieldValue(
        'roles',
        usuario.roles && usuario.roles.length > 0
          ? [...usuario.roles]
          : usuario.role
            ? [usuario.role]
            : [],
      );
      form.setFieldValue('estado', usuario.state);
    }
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org)$/i.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[1-9]\d{3}-\d{4}$/.test(phone);
  };

  const formatTelefono = (value: string) => {
    const soloNumeros = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 8);
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
    if (v.length > 64) return 'La contraseña no puede superar 64 caracteres.';
    const faltantes: string[] = [];
    if (v.length < 8) faltantes.push('mínimo 8 caracteres');
    if (!/[a-z]/.test(v)) faltantes.push('una minúscula');
    if (!/[A-Z]/.test(v)) faltantes.push('una mayúscula');
    if (!/\d/.test(v)) faltantes.push('un número');
    if (faltantes.length > 0) {
      return `Falta: ${faltantes.join(', ')}.`;
    }
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
                <Label htmlFor="u-nombre">
                  Nombre completo
                  <span className="ml-1.5 font-normal text-text-muted">
                    ({field.state.value.length}/100)
                  </span>
                </Label>
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
                  maxLength={100}
                />
                <FieldError message={field.state.meta.errors[0]} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="correo"
            validators={{
              onChange: ({ value }) => validarCorreo(value),
              onBlur: ({ value }) => validarCorreo(value),
              onSubmit: ({ value }) => validarCorreo(value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="u-correo">
                  Correo electrónico
                  <span className="ml-1.5 font-normal text-text-muted">
                    ({field.state.value.length}/100)
                  </span>
                </Label>
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
                  maxLength={100}
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
                onChange: ({ value }) => validarContraseña(value),
                onBlur: ({ value }) => validarContraseña(value),
                onSubmit: ({ value }) => validarContraseña(value),
              }}
            >
              {(field) => {
                const valor = field.state.value.trim();
                let puntos = 0;
                if (valor.length >= 8) puntos += 1;
                if (/[a-z]/.test(valor)) puntos += 1;
                if (/[A-Z]/.test(valor)) puntos += 1;
                if (/\d/.test(valor)) puntos += 1;
                const fortaleza =
                  puntos <= 1
                    ? { texto: 'Débil', clase: 'bg-red-500' }
                    : puntos <= 3
                      ? { texto: 'Media', clase: 'bg-amber-500' }
                      : { texto: 'Fuerte', clase: 'bg-emerald-500' };
                return (
                  <div>
                    <Label htmlFor="u-contraseña">
                      Nueva contraseña
                      <span className="ml-1.5 font-normal text-text-muted">
                        ({field.state.value.length}/64)
                      </span>
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="u-contraseña"
                        type={mostrarContrasena ? 'text' : 'password'}
                        placeholder="Dejar vacío para no cambiar"
                        value={field.state.value}
                        hasError={field.state.meta.errors.length > 0}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={() => {
                          field.handleChange(field.state.value.trim());
                          field.handleBlur();
                        }}
                        maxLength={64}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        className={BOTON_OJO}
                        onClick={() => setMostrarContrasena((prev) => !prev)}
                        aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={mostrarContrasena}
                      >
                        {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {valor ? (
                      <div className="mt-2 flex items-center gap-2" aria-live="polite">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong">
                          <div
                            className={`h-full rounded-full transition-all ${fortaleza.clase}`}
                            style={{ width: `${(puntos / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-text-muted">
                          {fortaleza.texto}
                        </span>
                      </div>
                    ) : null}
                    <p className="mt-1 text-xs text-text-muted">
                      Incluya mayúscula, minúscula y número.
                    </p>
                    <FieldError message={field.state.meta.errors[0]} />
                  </div>
                );
              }}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              name="roles"
              validators={{
                onChange: ({ value }) => validarRoles(value),
                onBlur: ({ value }) => validarRoles(value),
                onSubmit: ({ value }) => validarRoles(value),
              }}
            >
              {(field) => (
                <div>
                  <Label id="u-roles-titulo">Roles del usuario</Label>
                  <div
                    role="group"
                    aria-labelledby="u-roles-titulo"
                    className="flex flex-col gap-2 rounded-xl border border-border-strong bg-surface-muted p-3"
                  >
                    {opcionesSelectRol(
                      roles,
                      field.state.value[0],
                      rolesPermitidos,
                    ).map((rol) => {
                      const marcado = field.state.value.includes(rol.clave);
                      return (
                        <label
                          key={rol.clave}
                          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text"
                        >
                          <input
                            type="checkbox"
                            checked={marcado}
                            disabled={esUsuarioActual}
                            onChange={() => {
                              const actual = field.state.value;
                              field.handleChange(
                                marcado
                                  ? actual.filter((r) => r !== rol.clave)
                                  : [...actual, rol.clave],
                              );
                            }}
                            onBlur={field.handleBlur}
                            className="h-4 w-4 shrink-0 cursor-pointer accent-royal-blue"
                          />
                          <span>{rol.nombre}</span>
                        </label>
                      );
                    })}
                  </div>
                  <FieldError
                    message={
                      typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : undefined
                    }
                  />
                  {esUsuarioActual && (
                    <p className="mt-1.5 text-xs text-text-muted">
                      No puede cambiar sus propios roles.
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
