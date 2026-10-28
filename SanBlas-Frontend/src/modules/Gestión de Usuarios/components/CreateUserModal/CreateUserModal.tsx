import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { AnimatePresence, motion } from 'framer-motion';
import { type Usuario } from '../../../../types/Usuario';
import {
  esRolDelSistema,
  opcionesSelectRol,
  type Rol,
} from '../../../../types/Rol';
import { useAuth } from '../../../../context/AuthContext';
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
} from '../../../../shared/ui';
import { normalizarTexto } from '../../Utils/normalizarTexto';

const MAX_NOMBRE = 100;
const MAX_CORREO = 254;

interface CreateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  roles: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserData) => Promise<boolean>;
  users: Usuario[];
  roles: Rol[];
  guardando?: boolean;
}

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
      roles: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const ok = await onSave({
        ...value,
        nombre: normalizarTexto(value.nombre),
        correo: normalizarTexto(value.correo),
        telefono: normalizarTexto(value.telefono),
      });
      if (ok) {
        form.reset();
      }
    },
  });

  const { user: usuarioSesion } = useAuth();
  const rolesSesion: string[] =
    usuarioSesion?.roles && usuarioSesion.roles.length > 0
      ? usuarioSesion.roles
      : [usuarioSesion?.role ?? 'user'];
  const esSecretarioSesion = rolesSesion.some(
    (rol) => rol.toLowerCase() === 'secretario',
  );
  const rolesAsignables = roles
    .map((rol) => rol.clave)
    .filter(
      (clave) =>
        clave !== 'user' && (esSecretarioSesion || clave !== 'secretario'),
    );
  const opcionesRol = opcionesSelectRol(roles, undefined, rolesAsignables);
  const rolesSistemaOpciones = opcionesRol.filter((opcion) => {
    const rol = roles.find((item) => item.clave === opcion.clave);
    return rol ? esRolDelSistema(rol) : false;
  });
  const rolesPersonalizadosOpciones = opcionesRol.filter((opcion) => {
    const rol = roles.find((item) => item.clave === opcion.clave);
    return rol ? !esRolDelSistema(rol) : false;
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  const validateEmail = (email: string) => {
    const validDomainsRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org)$/i;
    return validDomainsRegex.test(email);
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
  };

  const validarNombre = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El nombre es requerido.';
    if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (v.length > MAX_NOMBRE) {
      return `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(v)) {
      return 'El nombre solo puede contener letras y números.';
    }
    return undefined;
  };

  const validarCorreo = (value: string) => {
    const v = normalizarTexto(value);
    if (!v) return 'El correo es requerido.';
    if (v.length > MAX_CORREO) {
      return `El correo no puede superar los ${MAX_CORREO} caracteres.`;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) {
      if (/\.(com|es|org)(?![a-zA-Z])/i.test(v)) {
        return 'El correo debe terminar en .com, .es o .org, sin caracteres después del dominio.';
      }
      return 'Formato de correo inválido. Ej: usuario@correo.com.';
    }
    if (!validateEmail(v)) {
      return 'El correo debe terminar en .com, .es o .org, sin caracteres después del dominio.';
    }
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

  const validarRoles = (value: string[]) => {
    if (!value || value.length === 0) return 'Seleccione al menos un rol.';
    return undefined;
  };

  const contenidoModal = (
    <Modal
      onClose={guardando ? () => undefined : onClose}
      title="Crear nuevo usuario"
      cerrarAlClicFuera={false}
      overlayTransparente
      className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
    >
      <h3 className="mb-4 pr-10 text-lg font-bold text-royal-blue dark:text-[#f3f6fa]">
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
                  <span className="ml-1.5 font-normal text-text-muted dark:text-[#7f8da3]">
                    ({field.state.value.length}/{MAX_NOMBRE})
                  </span>
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez González"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g,
                        '',
                      ),
                    )
                  }
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                  maxLength={MAX_NOMBRE}
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
                  <span className="ml-1.5 font-normal text-text-muted dark:text-[#7f8da3]">
                    ({field.state.value.length}/{MAX_CORREO})
                  </span>
                </Label>
                <Input
                  id="correo"
                  type="email"
                  autoComplete="off"
                  placeholder="Ej: ejemplo@correo.com"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.replace(/[^a-zA-Z0-9._%+\-@]/g, ''),
                    )
                  }
                  onBlur={() => {
                    field.handleChange(normalizarTexto(field.state.value));
                    field.handleBlur();
                  }}
                  maxLength={MAX_CORREO}
                  disabled={guardando}
                />
                <p className="mt-1.5 text-xs text-text-muted dark:text-[#7f8da3]">
                  Se enviará un enlace de activación a este correo. El usuario
                  elegirá su contraseña al abrirlo.
                </p>
                <FieldError message={mensajeErrorCampo(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>

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
                  onChange={(e) =>
                    field.handleChange(formatTelefono(e.target.value))
                  }
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
            name="roles"
            validators={{
              onChange: ({ value }) => validarRoles(value),
              onBlur: ({ value }) => validarRoles(value),
              onSubmit: ({ value }) => validarRoles(value),
            }}
          >
            {(field) => {
              const renderCheckboxRol = (rol: {
                clave: string;
                nombre: string;
              }) => {
                const marcado = field.state.value.includes(rol.clave);
                return (
                  <label
                    key={rol.clave}
                    className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text dark:text-[#f3f6fa]"
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      disabled={guardando}
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
              };

              return (
                <div>
                  <Label id="roles-usuario-titulo" required>
                    Roles del usuario
                  </Label>
                  <div
                    role="group"
                    aria-labelledby="roles-usuario-titulo"
                    className="flex max-h-60 flex-col gap-3 overflow-y-auto rounded-xl border border-border-strong bg-surface-muted p-3 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]"
                  >
                    {rolesSistemaOpciones.length > 0 && (
                      <div>
                        <p
                          id="roles-sistema-titulo"
                          className="mb-1.5 text-[11px] font-bold tracking-wide text-royal-blue uppercase dark:text-[#d9a928]"
                        >
                          Roles del sistema
                        </p>
                        <div
                          role="group"
                          aria-labelledby="roles-sistema-titulo"
                          className="flex flex-col gap-2"
                        >
                          {rolesSistemaOpciones.map(renderCheckboxRol)}
                        </div>
                      </div>
                    )}

                    {rolesPersonalizadosOpciones.length > 0 && (
                      <div
                        className={
                          rolesSistemaOpciones.length > 0
                            ? 'border-t border-border-strong pt-3 dark:border-[rgba(220,230,242,0.12)]'
                            : undefined
                        }
                      >
                        <p
                          id="roles-personalizados-titulo"
                          className="mb-1.5 text-[11px] font-bold tracking-wide text-text-muted uppercase dark:text-[#7f8da3]"
                        >
                          Roles personalizados
                        </p>
                        <div
                          role="group"
                          aria-labelledby="roles-personalizados-titulo"
                          className="flex flex-col gap-2"
                        >
                          {rolesPersonalizadosOpciones.map(renderCheckboxRol)}
                        </div>
                      </div>
                    )}
                  </div>
                  <FieldError
                    message={mensajeErrorCampo(field.state.meta.errors)}
                  />
                </div>
              );
            }}
          </form.Field>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border-strong pt-4 sm:flex-row sm:justify-end dark:border-[rgba(220,230,242,0.12)]">
          <Button type="submit" variant="royal" disabled={guardando}>
            {guardando ? 'Enviando...' : 'Crear y enviar invitación'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={guardando}
            className="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="crear-usuario-backdrop"
            className="fixed inset-0 z-[1199] bg-[#060f20]/[0.78] backdrop-blur-[6px] dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {isOpen && contenidoModal}
    </>
  );
};

export default CreateUserModal;
