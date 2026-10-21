import { useState } from 'react';
import { Lock, Shield, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmacionAccionModal,
  cn,
  useToast,
} from '../../../../shared/ui';
import {
  CLAVES_ROL_SISTEMA,
  esRolDelSistema,
  etiquetaPermiso,
  type Rol,
} from '../../../../types/Rol';
import type { Usuario } from '../../../../types/Usuario';
import { useDeleteRol } from '../../hooks/hooksUsuarios/useDeleteRol';

interface RolesYPermisosProps {
  users: Usuario[];
  roles: Rol[];
  onCrearRol: () => void;
  onRolEliminado?: () => void;
}

interface RolCardProps {
  rol: Rol;
  asignados: number;
  onEliminar: (rol: Rol) => void;
}

function RolCard({ rol, asignados, onEliminar }: RolCardProps) {
  const esAdmin = rol.clave === 'admin' || rol.clave === 'secretario';
  const delSistema = esRolDelSistema(rol);
  const Icono = esAdmin ? ShieldCheck : delSistema ? Shield : Sparkles;
  const puedeEliminar =
    !delSistema &&
    !(CLAVES_ROL_SISTEMA as readonly string[]).includes(rol.clave);

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-surface p-5 shadow-sm dark:bg-[#0a1425] dark:shadow-none',
        delSistema
          ? 'border-royal-blue/15 dark:border-[rgba(217,169,40,0.22)]'
          : 'border-border-strong dark:border-[rgba(220,230,242,0.12)]',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl',
              delSistema
                ? 'bg-royal-blue/8 text-royal-blue dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]'
                : 'bg-[#aa7323]/10 text-[#aa7323] dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]',
            )}
          >
            <Icono size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 className="m-0 font-heading text-xl text-royal-blue dark:text-[#f3f6fa]">
              {rol.nombre}
            </h3>
            <p className="m-0 mt-0.5 text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-[#7f8da3]">
              {delSistema ? (
                'Rol del sistema'
              ) : (
                <>
                  Código:{' '}
                  <span className="font-mono tracking-normal normal-case">
                    {rol.clave}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge
            variant={esAdmin ? 'info' : 'neutral'}
            className={
              esAdmin
                ? 'dark:border-[#f2a34a] dark:bg-[rgba(242,163,74,0.10)] dark:text-[#f2a34a]'
                : 'dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#b7c3d4]'
            }
          >
            {asignados} {asignados === 1 ? 'cuenta' : 'cuentas'}
          </Badge>
          {puedeEliminar ? (
            <button
              type="button"
              onClick={() => onEliminar(rol)}
              disabled={asignados > 0}
              title={
                asignados > 0
                  ? 'No se puede eliminar: tiene cuentas asignadas'
                  : `Eliminar rol ${rol.nombre}`
              }
              aria-label={`Eliminar rol ${rol.nombre}`}
              className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#7f8da3] dark:hover:bg-[rgba(230,106,106,0.12)] dark:hover:text-[#e66a6a]"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <span
              className="inline-flex size-9 items-center justify-center rounded-lg text-text-muted dark:text-[#7f8da3]"
              title="Rol protegido: no se puede eliminar"
            >
              <Lock size={15} aria-hidden="true" />
            </span>
          )}
        </div>
      </header>

      {rol.descripcion ? (
        <p className="m-0 text-sm leading-relaxed text-text-secondary dark:text-[#b7c3d4]">
          {rol.descripcion}
        </p>
      ) : null}

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-royal-blue uppercase dark:text-[#d9a928]">
          <Shield size={14} aria-hidden="true" />
          Permisos
        </p>
        {rol.permisos.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {rol.permisos.map((permiso) => (
              <li
                key={permiso}
                className="rounded-xl bg-surface-muted px-3 py-2 text-sm leading-relaxed text-text dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa]"
              >
                {etiquetaPermiso(permiso)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 rounded-xl bg-surface-muted px-3 py-2 text-sm text-text-muted dark:bg-[#0f1d33] dark:text-[#7f8da3]">
            Sin acceso al panel administrativo.
          </p>
        )}
      </div>
    </article>
  );
}

export function RolesYPermisos({
  users,
  roles,
  onCrearRol,
  onRolEliminado,
}: RolesYPermisosProps) {
  const { showToast } = useToast();
  const { eliminarRol, loading: eliminando } = useDeleteRol();
  const [rolAEliminar, setRolAEliminar] = useState<Rol | null>(null);

  const cuentasConRol = (clave: string) =>
    users.filter(
      (usuario) => usuario.role === clave || usuario.roles?.includes(clave),
    ).length;

  const rolesSistema = roles.filter((rol) => esRolDelSistema(rol));
  const rolesPersonalizados = roles.filter((rol) => !esRolDelSistema(rol));

  const handleConfirmarEliminar = async () => {
    if (!rolAEliminar) return;
    const resultado = await eliminarRol(rolAEliminar.id);
    if (!resultado.ok) {
      showToast(resultado.mensaje, 'error');
      return;
    }
    showToast('Rol eliminado correctamente', 'success');
    setRolAEliminar(null);
    onRolEliminado?.();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
          Los{' '}
          <strong className="font-semibold text-royal-blue dark:text-[#d9a928]">
            roles del sistema
          </strong>{' '}
          vienen definidos por la plataforma; los{' '}
          <strong className="font-semibold text-royal-blue dark:text-[#d9a928]">
            personalizados
          </strong>{' '}
          los crea usted. Los permisos indican a qué módulos del panel puede
          entrar cada cuenta.
        </p>
        <Button variant="royal" className="shrink-0" onClick={onCrearRol}>
          + Crear rol
        </Button>
      </div>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-10 text-center dark:border-[rgba(220,230,242,0.16)] dark:bg-[#0a1425]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-royal-blue/8 text-royal-blue dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
            <Shield size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="m-0 text-sm font-semibold text-text dark:text-[#f3f6fa]">
              Aún no hay roles
            </p>
            <p className="m-0 mt-1 text-sm text-text-muted dark:text-[#7f8da3]">
              Cree el primero para empezar a asignar accesos.
            </p>
          </div>
          <Button variant="royal" onClick={onCrearRol}>
            + Crear rol
          </Button>
        </div>
      ) : (
        <>
          {rolesSistema.length > 0 ? (
            <section
              aria-labelledby="titulo-roles-sistema"
              className="flex flex-col gap-4 rounded-2xl border border-royal-blue/10 bg-[#f5f8fd] p-4 sm:p-5 dark:border-[rgba(217,169,40,0.16)] dark:bg-[#08111f]"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-royal-blue/10 text-royal-blue dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
                    <ShieldCheck size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        id="titulo-roles-sistema"
                        className="m-0 font-heading text-lg text-royal-blue dark:text-[#f3f6fa]"
                      >
                        Roles del sistema
                      </h2>
                      <Badge
                        variant="info"
                        className="dark:border-[rgba(217,169,40,0.25)] dark:bg-[rgba(217,169,40,0.12)] dark:text-[#d9a928]"
                      >
                        {rolesSistema.length}
                      </Badge>
                    </div>
                    <p className="m-0 mt-0.5 max-w-2xl text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
                      Definidos por la plataforma. No se pueden eliminar ni
                      cambiar sus permisos.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-royal-blue/15 bg-white/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-royal-blue uppercase dark:border-[rgba(217,169,40,0.25)] dark:bg-[rgba(217,169,40,0.08)] dark:text-[#d9a928]">
                  <Lock size={12} aria-hidden="true" />
                  Protegidos
                </span>
              </header>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {rolesSistema.map((rol) => (
                  <RolCard
                    key={rol.clave}
                    rol={rol}
                    asignados={cuentasConRol(rol.clave)}
                    onEliminar={setRolAEliminar}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section
            aria-labelledby="titulo-roles-personalizados"
            className="flex flex-col gap-4 rounded-2xl border border-[#aa7323]/15 bg-[#fbf7f1] p-4 sm:p-5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#08111f]"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#aa7323]/10 text-[#aa7323] dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
                  <Sparkles size={20} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="titulo-roles-personalizados"
                      className="m-0 font-heading text-lg text-royal-blue dark:text-[#f3f6fa]"
                    >
                      Roles personalizados
                    </h2>
                    <Badge
                      variant="warning"
                      className="dark:border-[rgba(217,169,40,0.25)] dark:bg-[rgba(217,169,40,0.12)] dark:text-[#d9a928]"
                    >
                      {rolesPersonalizados.length}
                    </Badge>
                  </div>
                  <p className="m-0 mt-0.5 max-w-2xl text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
                    Creados por usted para ajustar el acceso a los módulos de la
                    parroquia.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#aa7323]/20 bg-white/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#aa7323] uppercase dark:border-[rgba(217,169,40,0.25)] dark:bg-[rgba(217,169,40,0.08)] dark:text-[#d9a928]">
                <Sparkles size={12} aria-hidden="true" />
                A medida
              </span>
            </header>

            {rolesPersonalizados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {rolesPersonalizados.map((rol) => (
                  <RolCard
                    key={rol.clave}
                    rol={rol}
                    asignados={cuentasConRol(rol.clave)}
                    onEliminar={setRolAEliminar}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface/70 px-4 py-8 text-center dark:border-[rgba(220,230,242,0.18)] dark:bg-[#0a1425]/60">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#aa7323]/10 text-[#aa7323] dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
                  <Sparkles size={22} aria-hidden="true" />
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-text dark:text-[#f3f6fa]">
                    Aún no hay roles personalizados
                  </p>
                  <p className="m-0 mt-1 text-sm text-text-muted dark:text-[#7f8da3]">
                    Cree uno para otorgar solo los permisos que necesita.
                  </p>
                </div>
                <Button variant="royal" onClick={onCrearRol}>
                  + Crear rol
                </Button>
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmacionAccionModal
        open={rolAEliminar !== null}
        title="Eliminar rol"
        parteSubrayada="Eliminar rol"
        resto={rolAEliminar ? ` ${rolAEliminar.nombre}` : ''}
        iconoAdvertencia
        confirmVariant="danger"
        confirmLabel="Sí, eliminar"
        pendingLabel="Eliminando..."
        isPending={eliminando}
        mensaje={
          rolAEliminar ? (
            <>
              ¿Está seguro de eliminar el rol{' '}
              <strong className="font-semibold text-text dark:text-[#f3f6fa]">
                {rolAEliminar.nombre}
              </strong>
              ? Esta acción no se puede deshacer.
            </>
          ) : (
            ''
          )
        }
        onConfirm={() => void handleConfirmarEliminar()}
        onCancel={() => {
          if (!eliminando) setRolAEliminar(null);
        }}
        overlayClassName="fixed inset-0 z-[1350] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
        className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_p.text-text-secondary]:text-[#b7c3d4] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        cancelClassName="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
      />
    </div>
  );
}
