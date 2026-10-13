import { useState } from 'react';
import { Shield, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { Badge, Button, ConfirmacionAccionModal, useToast } from '../../../../shared/ui';
import { etiquetaPermiso, type Rol } from '../../../../types/Rol';
import type { Usuario } from '../../../../types/Usuario';
import { useDeleteRol } from '../../hooks/hooksUsuarios/useDeleteRol';

interface RolesYPermisosProps {
  users: Usuario[];
  roles: Rol[];
  onCrearRol: () => void;
  onRolEliminado?: () => void;
}

// Claves que nunca se pueden eliminar desde el panel (espejo del backend).
const CLAVES_NO_ELIMINABLES = [
  'admin',
  'user',
  'secretario',
  'catequista',
  'gestor-eventos',
  'gestor-donaciones',
];

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="m-0 text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
          Cree roles y asígnelos al crear o editar un usuario. Los permisos
          indican a qué módulos del panel puede entrar.
        </p>
        <Button variant="royal" className="shrink-0" onClick={onCrearRol}>
          + Crear rol
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {roles.length === 0 ? (
          <p className="m-0 rounded-2xl border border-border-strong bg-surface px-4 py-10 text-center text-sm text-text-muted lg:col-span-2 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:text-[#7f8da3]">
            Aún no hay roles. Cree el primero con el botón Crear rol.
          </p>
        ) : (
          roles.map((rol) => {
          const Icon = rol.clave === 'admin' ? ShieldCheck : UserRound;
          const asignados = cuentasConRol(rol.clave);

          return (
            <article
              key={rol.clave}
              className="flex flex-col gap-4 rounded-2xl border border-border-strong bg-surface p-5 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-royal-blue/8 text-royal-blue dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="m-0 font-heading text-xl text-royal-blue dark:text-[#f3f6fa]">
                      {rol.nombre}
                    </h3>
                    <p className="m-0 mt-0.5 text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-[#7f8da3]">
                      {rol.esSistema ? 'Rol del sistema' : `Código: ${rol.clave}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge
                    variant={rol.clave === 'admin' ? 'info' : 'neutral'}
                    className={
                      rol.clave === 'admin'
                        ? 'dark:border-[#f2a34a] dark:bg-[rgba(242,163,74,0.10)] dark:text-[#f2a34a]'
                        : 'dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#b7c3d4]'
                    }
                  >
                    {asignados} {asignados === 1 ? 'cuenta' : 'cuentas'}
                  </Badge>
                  {!rol.esSistema && !CLAVES_NO_ELIMINABLES.includes(rol.clave) && (
                    <button
                      type="button"
                      onClick={() => setRolAEliminar(rol)}
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
        })
        )}
      </div>

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
