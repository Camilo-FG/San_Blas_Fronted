import Rutas from './Rutas';
import { tienePermiso, type AuthUser } from '../services/authSession';

export const RUTAS_POR_PERMISO = [
  { permiso: 'panel', to: Rutas.dashboard },
  { permiso: 'sacramentos', to: Rutas.dashboardUrl.registroSacramentos },
  { permiso: 'constancias', to: Rutas.dashboardUrl.constanciasSacramentos },
  { permiso: 'catequesis', to: Rutas.dashboardUrl.solicitudesCatequesis },
  { permiso: 'catequesis', to: Rutas.dashboardUrl.cica },
  { permiso: 'catequesis', to: Rutas.dashboardUrl.catequesisBautismo },
  { permiso: 'donaciones', to: Rutas.dashboardUrl.donaciones },
  { permiso: 'eventos', to: Rutas.dashboardUrl.eventos },
  { permiso: 'landing', to: Rutas.dashboardUrl.gestionLanding },
  { permiso: 'usuarios', to: Rutas.dashboardUrl.gestionUsuarios },
];

export const primeraRutaPermitida = (usuario: AuthUser | null): string =>
  usuario?.accesoPanel
    ? RUTAS_POR_PERMISO.find(({ permiso }) => tienePermiso(usuario, permiso))?.to ?? Rutas.SolicitudesSacramentos
    : Rutas.SolicitudesSacramentos;

export const puedeAbrirRuta = (usuario: AuthUser | null, pathname: string): boolean => {
  if (!usuario?.accesoPanel) return false;
  const ruta = RUTAS_POR_PERMISO.find(({ to }) =>
    to === Rutas.dashboard ? pathname === to || pathname === `${to}/`
      : pathname === to || pathname.startsWith(`${to}/`));
  return !ruta || tienePermiso(usuario, ruta.permiso);
};
