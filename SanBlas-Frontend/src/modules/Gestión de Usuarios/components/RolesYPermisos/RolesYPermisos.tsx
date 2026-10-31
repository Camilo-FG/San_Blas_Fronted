import { useEffect, useState } from 'react';
import {
  ChevronDown,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  /** Se incrementa al crear un rol para abrir la subpestaña de personalizados. */
  irAPersonalizadosToken?: number;
  /** Clave del rol recién creado para resaltarlo en verde. */
  claveRolRecienCreado?: string | null;
  onResaltadoRolConsumido?: () => void;
}

interface RolCardProps {
  rol: Rol;
  asignados: number;
  onEliminar: (rol: Rol) => void;
  resaltar?: boolean;
  onResaltadoTerminado?: () => void;
}

function RolCard({
  rol,
  asignados,
  onEliminar,
  resaltar = false,
  onResaltadoTerminado,
}: RolCardProps) {
  const [permisosAbiertos, setPermisosAbiertos] = useState(false);
  const reducirMovimiento = useReducedMotion();
  const esAdmin = rol.clave === 'admin' || rol.clave === 'secretario';
  const delSistema = esRolDelSistema(rol);
  const Icono = esAdmin ? ShieldCheck : delSistema ? Shield : Sparkles;
  const puedeEliminar =
    !delSistema &&
    !(CLAVES_ROL_SISTEMA as readonly string[]).includes(rol.clave);
  const panelId = `permisos-rol-${rol.clave}`;

  useEffect(() => {
    if (!resaltar || !reducirMovimiento) return;
    const t = window.setTimeout(() => onResaltadoTerminado?.(), 2500);
    return () => window.clearTimeout(t);
  }, [resaltar, reducirMovimiento, onResaltadoTerminado]);

  return (
    <motion.article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-surface p-5 shadow-sm dark:bg-[#0a1425] dark:shadow-none',
        delSistema
          ? 'border-royal-blue/15 dark:border-[rgba(217,169,40,0.22)]'
          : 'border-border-strong dark:border-[rgba(220,230,242,0.12)]',
        resaltar &&
          'border-emerald-500 ring-2 ring-emerald-400/40 dark:border-emerald-400 dark:ring-emerald-400/30',
      )}
      animate={
        resaltar && !reducirMovimiento
          ? {
              boxShadow: [
                '0 0 0 0 rgba(34,197,94,0)',
                '0 0 0 6px rgba(34,197,94,0.4)',
                '0 0 0 0 rgba(34,197,94,0)',
                '0 0 0 6px rgba(34,197,94,0.4)',
                '0 1px 2px 0 rgba(0,0,0,0.05)',
              ],
            }
          : undefined
      }
      transition={
        resaltar && !reducirMovimiento
          ? { duration: 2.4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }
          : undefined
      }
      onAnimationComplete={() => {
        if (resaltar && !reducirMovimiento) onResaltadoTerminado?.();
      }}
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

      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border-strong/70 transition-colors duration-300 dark:border-[rgba(220,230,242,0.12)]',
          permisosAbiertos
            ? 'bg-surface-muted/70 dark:bg-[#0f1d33]/80'
            : 'bg-surface-muted/40 dark:bg-[#0f1d33]/50',
        )}
      >
        <button
          type="button"
          aria-expanded={permisosAbiertos}
          aria-controls={panelId}
          onClick={() => setPermisosAbiertos((abierto) => !abierto)}
          className="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-3 py-2.5 text-left text-xs font-extrabold tracking-wider text-royal-blue uppercase transition-colors hover:bg-royal-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:text-[#d9a928] dark:hover:bg-[rgba(217,169,40,0.08)]"
        >
          <span className="inline-flex items-center gap-1.5">
            <Shield size={14} aria-hidden="true" />
            Permisos
            <span className="rounded-full bg-royal-blue/10 px-2 py-0.5 text-[10px] font-bold tracking-normal text-royal-blue normal-case dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
              {rol.permisos.length}
            </span>
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              'shrink-0 text-text-muted transition-transform duration-300 ease-out dark:text-[#7f8da3]',
              permisosAbiertos && 'rotate-180',
            )}
          />
        </button>

        <div
          id={panelId}
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            permisosAbiertos ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                'border-t border-border-strong/60 px-3 pt-2 pb-3 transition-opacity duration-300 dark:border-[rgba(220,230,242,0.10)]',
                permisosAbiertos ? 'opacity-100' : 'opacity-0',
              )}
            >
              {rol.permisos.length > 0 ? (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {rol.permisos.map((permiso, indice) => (
                    <li
                      key={permiso}
                      className={cn(
                        'rounded-xl bg-surface px-3 py-2 text-sm leading-relaxed text-text transition-all duration-300 ease-out dark:border-[rgba(220,230,242,0.12)] dark:bg-[#08111f] dark:text-[#f3f6fa]',
                        permisosAbiertos
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-1 opacity-0',
                      )}
                      style={{
                        transitionDelay: permisosAbiertos
                          ? `${Math.min(indice, 8) * 35}ms`
                          : '0ms',
                      }}
                    >
                      {etiquetaPermiso(permiso)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 rounded-xl bg-surface px-3 py-2 text-sm text-text-muted dark:bg-[#08111f] dark:text-[#7f8da3]">
                  Sin acceso al panel administrativo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

type SubpestanaRoles = 'sistema' | 'personalizados';

export function RolesYPermisos({
  users,
  roles,
  onCrearRol,
  onRolEliminado,
  irAPersonalizadosToken = 0,
  claveRolRecienCreado = null,
  onResaltadoRolConsumido,
}: RolesYPermisosProps) {
  const { showToast } = useToast();
  const { eliminarRol, loading: eliminando } = useDeleteRol();
  const [rolAEliminar, setRolAEliminar] = useState<Rol | null>(null);
  const [subpestana, setSubpestana] =
    useState<SubpestanaRoles>('sistema');
  const [claveResaltada, setClaveResaltada] = useState<string | null>(null);
  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    if (irAPersonalizadosToken > 0) {
      setSubpestana('personalizados');
    }
  }, [irAPersonalizadosToken]);

  useEffect(() => {
    if (!claveRolRecienCreado) return;
    setClaveResaltada(claveRolRecienCreado);
  }, [claveRolRecienCreado]);

  const cuentasConRol = (clave: string) =>
    users.filter(
      (usuario) => usuario.role === clave || usuario.roles?.includes(clave),
    ).length;

  const animacionPanel = reducirMovimiento
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  // 'user' no se ofrece ni se muestra: no da acceso al panel y no se asigna desde aquí.
  const rolesVisibles = roles.filter((rol) => rol.clave !== 'user');
  const rolesSistema = rolesVisibles.filter((rol) => esRolDelSistema(rol));
  const rolesPersonalizados = rolesVisibles.filter(
    (rol) => !esRolDelSistema(rol),
  );

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

  const subpestanas: {
    id: SubpestanaRoles;
    label: string;
    cantidad: number;
    icono: typeof ShieldCheck;
  }[] = [
    {
      id: 'sistema',
      label: 'Roles del sistema',
      cantidad: rolesSistema.length,
      icono: ShieldCheck,
    },
    {
      id: 'personalizados',
      label: 'Roles personalizados',
      cantidad: rolesPersonalizados.length,
      icono: Sparkles,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
          Los permisos indican a qué módulos del panel puede entrar cada
          cuenta. Alterne entre roles del sistema y personalizados con las
          pestañas de abajo.
        </p>
        <Button variant="royal" className="shrink-0" onClick={onCrearRol}>
          + Crear rol personalizado
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Tipo de roles"
        className="flex flex-wrap gap-1 border-b border-border-strong dark:border-[rgba(220,230,242,0.12)]"
      >
        {subpestanas.map((item) => {
          const activa = subpestana === item.id;
          const IconoTab = item.icono;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-roles-${item.id}`}
              aria-selected={activa}
              aria-controls={`panel-roles-${item.id}`}
              tabIndex={activa ? 0 : -1}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring',
                activa
                  ? 'border-royal-blue text-royal-blue dark:border-[#d9a928] dark:text-[#d9a928]'
                  : 'border-transparent text-text-muted hover:text-royal-blue dark:text-[#7f8da3] dark:hover:text-[#d9a928]',
              )}
              onClick={() => setSubpestana(item.id)}
            >
              <IconoTab size={16} aria-hidden="true" />
              {item.label}
              <Badge
                variant={activa ? 'info' : 'neutral'}
                className={
                  activa
                    ? 'dark:border-[rgba(217,169,40,0.25)] dark:bg-[rgba(217,169,40,0.12)] dark:text-[#d9a928]'
                    : 'dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#b7c3d4]'
                }
              >
                {item.cantidad}
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[12rem]">
        <AnimatePresence mode="wait" initial={false}>
          {subpestana === 'sistema' ? (
            <motion.div
              key="sistema"
              id="panel-roles-sistema"
              role="tabpanel"
              aria-labelledby="tab-roles-sistema"
              className="flex flex-col gap-4"
              initial={animacionPanel.initial}
              animate={animacionPanel.animate}
              exit={animacionPanel.exit}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
                Definidos por la plataforma. No se pueden eliminar ni cambiar
                sus permisos.
              </p>
              {rolesSistema.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-10 text-center dark:border-[rgba(220,230,242,0.16)] dark:bg-[#0a1425]">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-royal-blue/8 text-royal-blue dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]">
                    <ShieldCheck size={22} aria-hidden="true" />
                  </div>
                  <p className="m-0 text-sm text-text-muted dark:text-[#7f8da3]">
                    No hay roles del sistema para mostrar.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="personalizados"
              id="panel-roles-personalizados"
              role="tabpanel"
              aria-labelledby="tab-roles-personalizados"
              className="flex flex-col gap-4"
              initial={animacionPanel.initial}
              animate={animacionPanel.animate}
              exit={animacionPanel.exit}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 text-sm leading-relaxed text-text-muted dark:text-[#7f8da3]">
                Creados por usted para ajustar el acceso a los módulos de la
                parroquia.
              </p>
              {rolesPersonalizados.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {rolesPersonalizados.map((rol) => (
                    <RolCard
                      key={rol.clave}
                      rol={rol}
                      asignados={cuentasConRol(rol.clave)}
                      onEliminar={setRolAEliminar}
                      resaltar={claveResaltada === rol.clave}
                      onResaltadoTerminado={() => {
                        setClaveResaltada(null);
                        onResaltadoRolConsumido?.();
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-10 text-center dark:border-[rgba(220,230,242,0.16)] dark:bg-[#0a1425]">
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
                    + Crear rol personalizado
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
