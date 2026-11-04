import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { setCurrentUser, type AuthUser } from '../services/authSession';
import { restoreSession } from '../services/authService';
import { ControlAccesoDashboard } from './ControlAccesoDashboard';
import Rutas from './Rutas';
import { puedeAbrirRuta } from './permisosDashboard';

const { navigate, showToast } = vi.hoisted(() => ({ navigate: vi.fn(), showToast: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }));
vi.mock('../shared/ui', () => ({ useToast: () => ({ showToast }) }));
vi.mock('../services/authService', () => ({ restoreSession: vi.fn(), login: vi.fn(), logout: vi.fn() }));
const usuario: AuthUser = { id: 99, email: 'test@example.com', role: 'limitado', roles: ['limitado'], permisos: ['panel', 'catequesis', 'usuarios'], accesoPanel: true };

function Menu() {
  const { tienePermiso } = useAuth();
  return <nav>{tienePermiso('catequesis') && <span>Menú catequesis</span>}{tienePermiso('usuarios') && <span>Menú usuarios</span>}</nav>;
}

describe.each([
  [Rutas.dashboardUrl.cica, 'catequesis'],
  [Rutas.dashboardUrl.catequesisBautismo, 'catequesis'],
  [Rutas.dashboardUrl.gestionUsuarios, 'usuarios'],
])('revocación en %s', (ruta, permiso) => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentUser(usuario);
    vi.mocked(restoreSession).mockResolvedValue(usuario);
  });
  afterEach(() => { act(() => { setCurrentUser(null); }); });

  function montar() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['datos-privados'], { nombre: 'privado' });
    render(<QueryClientProvider client={client}><AuthProvider>
      <Menu />
      <ControlAccesoDashboard pathname={ruta}><div>Datos del módulo y modal abierto</div></ControlAccesoDashboard>
    </AuthProvider></QueryClientProvider>);
    return client;
  }

  it('permite ver el módulo con permiso', () => {
    montar();
    expect(screen.getByText('Datos del módulo y modal abierto')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each(['focus', 'auth:permisos-denegados'])('al actualizar por %s oculta datos, limpia caché y redirige', async (evento) => {
    const client = montar();
    const limitado = { ...usuario, permisos: ['panel'] };
    vi.mocked(restoreSession).mockImplementation(async () => {
      setCurrentUser(limitado);
      return limitado;
    });
    await act(async () => { window.dispatchEvent(new Event(evento)); });
    await waitFor(() => expect(screen.queryByText('Datos del módulo y modal abierto')).not.toBeInTheDocument());
    expect(screen.queryByText(permiso === 'usuarios' ? 'Menú usuarios' : 'Menú catequesis')).not.toBeInTheDocument();
    expect(client.getQueryData(['datos-privados'])).toBeUndefined();
    expect(navigate).toHaveBeenCalledWith({ to: Rutas.dashboard, replace: true });
    expect(showToast).toHaveBeenCalledWith('Ya no tiene permiso para acceder a este módulo.', 'error');
    expect(restoreSession).toHaveBeenCalledWith(true);
  });

  it('rechaza URL directa y mantiene el acceso del administrador', () => {
    expect(puedeAbrirRuta({ ...usuario, permisos: ['panel'] }, ruta)).toBe(false);
    expect(puedeAbrirRuta({ ...usuario, role: 'secretario', roles: ['secretario'], permisos: [] }, ruta)).toBe(true);
  });

  it('no monta contenido al abrir directamente una ruta sin permiso', () => {
    setCurrentUser({ ...usuario, permisos: ['panel'] });
    montar();
    expect(screen.queryByText('Datos del módulo y modal abierto')).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith({ to: Rutas.dashboard, replace: true });
  });

  it('el administrador puede abrir directamente el módulo sin permisos individuales', () => {
    setCurrentUser({ ...usuario, role: 'secretario', roles: ['secretario'], permisos: [] });
    montar();
    expect(screen.getByText('Datos del módulo y modal abierto')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('una caída de red no revoca la sesión ni borra datos', async () => {
    const client = montar();
    vi.mocked(restoreSession).mockRejectedValue(new Error('sin conexión'));
    await act(async () => { window.dispatchEvent(new Event('focus')); });
    expect(screen.getByText('Datos del módulo y modal abierto')).toBeInTheDocument();
    expect(client.getQueryData(['datos-privados'])).toEqual({ nombre: 'privado' });
    expect(navigate).not.toHaveBeenCalled();
  });
});
