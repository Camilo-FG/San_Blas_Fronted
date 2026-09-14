export interface Rol {
  id: number;
  clave: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  esSistema: boolean;
}

export const PERMISOS_ROL = [
  { id: "panel", label: "Acceso al panel administrativo" },
  { id: "usuarios", label: "Gestión de usuarios y roles" },
  { id: "landing", label: "Editar el landing (CMS)" },
  { id: "eventos", label: "Gestionar eventos" },
  { id: "donaciones", label: "Gestionar donaciones" },
  { id: "catequesis", label: "Solicitudes de catequesis" },
  { id: "constancias", label: "Solicitudes de constancias" },
  { id: "sacramentos", label: "Registro de sacramentos" },
] as const;

export const etiquetaPermiso = (id: string) =>
  PERMISOS_ROL.find((item) => item.id === id)?.label ?? id;

export const etiquetaRol = (clave: string, roles: Rol[] = []) =>
  roles.find((rol) => rol.clave === clave)?.nombre ??
  (clave === "admin" ? "Administrador" : clave === "user" ? "Usuario" : clave);

// roles que se ofrecen al crear/editar usuarios en el panel (espejo del enum del backend)
export const ROLES_ASIGNABLES = ["admin", "user"] as const;

export const opcionesSelectRol = (
  roles: Rol[],
  claveActual?: string,
  soloPermitidas?: readonly string[],
) => {
  const base =
    roles.length > 0
      ? roles.map((rol) => ({ clave: rol.clave, nombre: rol.nombre }))
      : [
          { clave: "user", nombre: "Usuario" },
          { clave: "admin", nombre: "Administrador" },
        ];

  // filtra roles custom que vengan de la tabla rol; si no se filtra se muestran todos
  const filtradas =
    soloPermitidas && soloPermitidas.length > 0
      ? base.filter((rol) => soloPermitidas.includes(rol.clave))
      : base;

  // si el usuario ya tiene un rol fuera del filtro (p. ej. secretario custom),
  // igual se mantiene visible para no perderlo al editar el resto del perfil
  if (claveActual && !filtradas.some((rol) => rol.clave === claveActual)) {
    return [...filtradas, { clave: claveActual, nombre: etiquetaRol(claveActual, roles) }];
  }

  return filtradas;
};
