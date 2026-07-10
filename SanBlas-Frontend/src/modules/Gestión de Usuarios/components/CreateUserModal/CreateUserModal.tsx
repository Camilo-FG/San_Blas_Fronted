import React from 'react';
import { useForm } from '@tanstack/react-form';
import { Usuario } from '../../../../types/Usuario';
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  Select,
} from '../../../../shared/ui';

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
    <Modal onClose={onClose} title="Crear nuevo usuario">
      <h2 className="mb-4 pr-10 text-lg font-bold tracking-wide text-royal-blue uppercase">
        Crear nuevo usuario
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4">
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
              <div>
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez González"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError message={field.state.meta.errors[0]} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="correo"
            validators={{
              onBlur: ({ value }) => {
                const v = value.trim();
                if (!v) return 'El correo es requerido.';
                if (!validateEmail(v)) return 'Solo se permiten dominios .com, .es o .org';
                if (users.some((u) => u.email.toLowerCase() === v.toLowerCase()))
                  return 'Ya existe una cuenta con este correo.';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="Ej: ejemplo@correo.com"
                  value={field.state.value}
                  hasError={field.state.meta.errors.length > 0}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError message={field.state.meta.errors[0]} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="Ej: 8888-8888"
                    value={field.state.value}
                    hasError={field.state.meta.errors.length > 0}
                    onChange={(e) => field.handleChange(formatTelefono(e.target.value))}
                    onBlur={field.handleBlur}
                    maxLength={9}
                  />
                  <FieldError message={field.state.meta.errors[0]} />
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
                <div>
                  <Label htmlFor="contraseña">
                    Contraseña
                    <span className="ml-1.5 font-normal text-slate-400">
                      ({field.state.value.length}/64)
                    </span>
                  </Label>
                  <Input
                    id="contraseña"
                    type="password"
                    placeholder="Min. 8 caracteres"
                    value={field.state.value}
                    hasError={field.state.meta.errors.length > 0}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    maxLength={64}
                  />
                  <FieldError message={field.state.meta.errors[0]} />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="rol">
            {(field) => (
              <div>
                <Label htmlFor="rol">Rol de Usuario</Label>
                <Select
                  id="rol"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'user' | 'admin')}
                  onBlur={field.handleBlur}
                >
                  <option value="user">Usuario Regular</option>
                  <option value="admin">Administrador</option>
                </Select>
              </div>
            )}
          </form.Field>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border-strong pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="royal">
            Crear usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
