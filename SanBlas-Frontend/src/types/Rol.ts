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

export const opcionesSelectRol = (roles: Rol[], claveActual?: string) => {
  const base =
    roles.length > 0
      ? roles.map((rol) => ({ clave: rol.clave, nombre: rol.nombre }))
      : [
          { clave: "user", nombre: "Usuario" },
          { clave: "admin", nombre: "Administrador" },
        ];

  if (claveActual && !base.some((rol) => rol.clave === claveActual)) {
    return [...base, { clave: claveActual, nombre: etiquetaRol(claveActual, roles) }];
  }

  return base;
};
