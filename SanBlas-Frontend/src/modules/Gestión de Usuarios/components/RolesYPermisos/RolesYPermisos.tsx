import { Shield, ShieldCheck, UserRound } from 'lucide-react';
import { Badge, Button } from '../../../../shared/ui';
import { etiquetaPermiso, type Rol } from '../../../../types/Rol';
import type { Usuario } from '../../../../types/Usuario';

interface RolesYPermisosProps {
  users: Usuario[];
  roles: Rol[];
  onCrearRol: () => void;
}

export function RolesYPermisos({
  users,
  roles,
  onCrearRol,
}: RolesYPermisosProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="m-0 text-sm leading-relaxed text-text-muted">
          Cree roles y asígnelos al crear o editar un usuario. Los permisos
          indican a qué módulos del panel puede entrar.
        </p>
        <Button variant="royal" className="shrink-0" onClick={onCrearRol}>
          + Crear rol
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {roles.length === 0 ? (
          <p className="m-0 rounded-2xl border border-border-strong bg-surface px-4 py-10 text-center text-sm text-text-muted lg:col-span-2">
            Aún no hay roles. Cree el primero con el botón Crear rol.
          </p>
        ) : (
          roles.map((rol) => {
          const Icon = rol.clave === 'admin' ? ShieldCheck : UserRound;
          const asignados = users.filter(
            (usuario) => usuario.role === rol.clave,
          ).length;

          return (
            <article
              key={rol.clave}
              className="flex flex-col gap-4 rounded-2xl border border-border-strong bg-surface p-5 shadow-sm"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-royal-blue/8 text-royal-blue">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="m-0 font-heading text-xl text-royal-blue">
                      {rol.nombre}
                    </h3>
                    <p className="m-0 mt-0.5 text-xs font-semibold tracking-wide text-text-muted uppercase">
                      {rol.esSistema ? 'Rol del sistema' : `Código: ${rol.clave}`}
                    </p>
                  </div>
                </div>
                <Badge variant={rol.clave === 'admin' ? 'info' : 'neutral'}>
                  {asignados} {asignados === 1 ? 'cuenta' : 'cuentas'}
                </Badge>
              </header>

              {rol.descripcion ? (
                <p className="m-0 text-sm leading-relaxed text-text-secondary">
                  {rol.descripcion}
                </p>
              ) : null}

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-royal-blue uppercase">
                  <Shield size={14} aria-hidden="true" />
                  Permisos
                </p>
                {rol.permisos.length > 0 ? (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {rol.permisos.map((permiso) => (
                      <li
                        key={permiso}
                        className="rounded-xl bg-surface-muted px-3 py-2 text-sm leading-relaxed text-text"
                      >
                        {etiquetaPermiso(permiso)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="m-0 rounded-xl bg-surface-muted px-3 py-2 text-sm text-text-muted">
                    Sin acceso al panel administrativo.
                  </p>
                )}
              </div>
            </article>
          );
        })
        )}
      </div>
    </div>
  );
}
