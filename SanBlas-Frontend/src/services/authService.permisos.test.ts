import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';
import { restoreSession, logout, login } from './authService';
import { ApiError } from './apiClient';
import { getCurrentUser, setCurrentUser, logout as cerrarSesionLocal, type AuthUser } from './authSession';

function pendiente<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}

const usuario: AuthUser = { id: 99, email: 'test@example.com', role: 'limitado', roles: ['limitado'], permisos: ['panel', 'catequesis'], accesoPanel: true };

describe('actualización de permisos de sesión', () => {
  beforeEach(() => { setCurrentUser(usuario); });
  afterEach(() => { vi.restoreAllMocks(); setCurrentUser(null); });

  it('la actualización consulta al servidor aunque haya una sesión en memoria', async () => {
    const limitado = { ...usuario, permisos: ['panel'] };
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { user: limitado } });
    expect(await restoreSession()).toEqual(usuario);
    expect(get).not.toHaveBeenCalled();
    expect(await restoreSession(true)).toEqual(limitado);
    expect(get).toHaveBeenCalledWith('/auth/session');
    expect(getCurrentUser()?.permisos).toEqual(['panel']);
  });

  it('deduplica actualizaciones simultáneas', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { user: usuario } });
    await Promise.all([restoreSession(true), restoreSession(true)]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('no elimina la sesión por fallo de red o servicio', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({ response: { status: 503 } });
    await expect(restoreSession(true)).rejects.toBeDefined();
    expect(getCurrentUser()).toEqual(usuario);
  });

  it('elimina la sesión si el servidor informa que ya no es válida', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { user: null } });
    expect(await restoreSession(true)).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });

  it('una respuesta tardía no restaura una sesión cerrada', async () => {
    const respuesta = pendiente<{ data: { user: AuthUser } }>();
    vi.spyOn(apiClient, 'get').mockReturnValue(respuesta.promise as ReturnType<typeof apiClient.get>);
    const consulta = restoreSession(true);
    cerrarSesionLocal();
    respuesta.resolve({ data: { user: usuario } });
    expect(await consulta).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });

  it.each(['usuario', 'anonima', '401'])(
    'una respuesta antigua (%s) no sobrescribe ni elimina la cuenta nueva', async (tipo) => {
      const respuesta = pendiente<{ data: { user: AuthUser | null } }>();
      vi.spyOn(apiClient, 'get').mockReturnValue(respuesta.promise as ReturnType<typeof apiClient.get>);
      const consulta = restoreSession(true);
      const nuevo = { ...usuario, id: 100, email: 'nuevo@example.com', permisos: ['panel'] };
      setCurrentUser(nuevo);
      if (tipo === '401') respuesta.reject({ response: { status: 401 } });
      else respuesta.resolve({ data: { user: tipo === 'anonima' ? null : usuario } });
      expect(await consulta).toEqual(nuevo);
      expect(getCurrentUser()).toEqual(nuevo);
    },
  );

  it('una cuenta nueva no reutiliza la petición antigua y conserva su deduplicación', async () => {
    const anterior = pendiente<{ data: { user: AuthUser } }>();
    const siguiente = pendiente<{ data: { user: AuthUser } }>();
    const get = vi.spyOn(apiClient, 'get')
      .mockReturnValueOnce(anterior.promise as ReturnType<typeof apiClient.get>)
      .mockReturnValueOnce(siguiente.promise as ReturnType<typeof apiClient.get>);
    const consultaAnterior = restoreSession(true);
    const nuevo = { ...usuario, id: 100, permisos: ['panel'] };
    setCurrentUser(nuevo);
    const consultaNueva = restoreSession(true);
    anterior.resolve({ data: { user: usuario } });
    await consultaAnterior;
    const simultanea = restoreSession(true);
    expect(get).toHaveBeenCalledTimes(2);
    siguiente.resolve({ data: { user: nuevo } });
    await Promise.all([consultaNueva, simultanea]);
    expect(getCurrentUser()).toEqual(nuevo);
  });

  it('un logout pendiente no borra una cuenta iniciada después', async () => {
    const respuesta = pendiente<void>();
    vi.spyOn(apiClient, 'post').mockReturnValue(respuesta.promise as ReturnType<typeof apiClient.post>);
    const cierre = logout();
    const nuevo = { ...usuario, id: 100 };
    setCurrentUser(nuevo);
    respuesta.resolve();
    await cierre;
    expect(getCurrentUser()).toEqual(nuevo);
  });
});

describe('login: conserva el mensaje del backend sin iniciar sesión tras errores', () => {
  beforeEach(() => { setCurrentUser(null); });
  afterEach(() => { vi.restoreAllMocks(); setCurrentUser(null); });

  it.each([
    [401, 'Email o contraseña incorrecta'],
    [403, 'Esta cuenta está pendiente de activación. Utiliza el enlace enviado a tu correo para crear tu contraseña.'],
  ])('propaga el texto exacto de HTTP %s y no guarda usuario', async (status, mensaje) => {
    vi.spyOn(apiClient, 'post').mockRejectedValue({
      isAxiosError: true, response: { status, data: { mensaje } },
    });
    await expect(login({ email: 'test@example.com', password: 'Incorrecta123!' }))
      .rejects.toMatchObject({ name: 'ApiError', message: mensaje, status });
    expect(getCurrentUser()).toBeNull();
  });

  it('tras un error permite volver a iniciar sesión con credenciales corregidas', async () => {
    vi.spyOn(apiClient, 'post')
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 401, data: { mensaje: 'Email o contraseña incorrecta' } } })
      .mockResolvedValueOnce({ data: { user: usuario } });
    await expect(login({ email: usuario.email, password: 'Incorrecta123!' })).rejects.toBeInstanceOf(ApiError);
    expect(getCurrentUser()).toBeNull();
    expect(await login({ email: usuario.email, password: 'Correcta123!' })).toEqual(usuario);
    expect(getCurrentUser()).toEqual(usuario);
  });
});
