import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { ApiError } from '../../../services/apiClient';

const { login, navigate } = vi.hoisted(() => ({ login: vi.fn(), navigate: vi.fn() }));
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ login, isAuthenticated: false, user: null }),
}));
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => <a href={to} {...props}>{children}</a>,
}));
vi.mock('../../../seo/SeoHead', () => ({ default: () => null }));

const INVALIDAS = 'Email o contraseña incorrecta';
const PENDIENTE = 'Esta cuenta está pendiente de activación. Utiliza el enlace enviado a tu correo para crear tu contraseña.';
const AYUDA = 'Si aún no has activado tu cuenta, utiliza el enlace enviado a tu correo para crear tu contraseña.';

function completar() {
  const vista = render(<LoginPage />);
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Incorrecta123!' } });
  return vista;
}

describe('Login: mensajes exactos y reintentos', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('siempre muestra ayuda de activación sin depender del correo', () => {
    render(<LoginPage />);
    expect(screen.getByText(AYUDA)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toHaveAccessibleDescription(AYUDA);
    expect(login).not.toHaveBeenCalled();
  });

  it.each([
    [401, INVALIDAS], [403, PENDIENTE],
    [503, 'No hay conexión disponible con el servicio de datos. Intente más tarde.'],
  ])('muestra el texto exacto de %s y deja la pantalla usable', async (status, mensaje) => {
    login.mockRejectedValueOnce(new ApiError(mensaje, status));
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(mensaje);
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
    expect(screen.getByLabelText('Correo electrónico')).toBeEnabled();
    expect(screen.getByLabelText('Contraseña')).toBeEnabled();
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toBeInTheDocument();
  });

  it('tras un error permite corregir la clave y entrar sin recargar', async () => {
    login.mockRejectedValueOnce(new ApiError(INVALIDAS, 401))
      .mockResolvedValueOnce({ accesoPanel: true });
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    await screen.findByRole('alert');
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Correcta123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/dashboard' }));
    expect(login).toHaveBeenLastCalledWith({ email: 'test@example.com', password: 'Correcta123!' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cuenta pendiente: permite un segundo intento después de activarla', async () => {
    login.mockRejectedValueOnce(new ApiError(PENDIENTE, 403))
      .mockResolvedValueOnce({ accesoPanel: false });
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    await screen.findByText(PENDIENTE);
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(login).toHaveBeenCalledTimes(2);
  });

  it('un error inesperado muestra el mensaje alternativo y permite reintentar', async () => {
    login.mockRejectedValueOnce(new Error('detalle técnico que no debe mostrarse'));
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión. Intente nuevamente.');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('no duplica el envío mientras carga y vuelve a habilitarse tras fallar', async () => {
    let rechazar!: (error: ApiError) => void;
    login.mockImplementationOnce(() => new Promise((_resolve, reject) => { rechazar = reject; }));
    const { container } = completar();
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    expect(login).toHaveBeenCalledTimes(1);
    await act(async () => { rechazar(new ApiError(INVALIDAS, 401)); });
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent(INVALIDAS);
  });
});
