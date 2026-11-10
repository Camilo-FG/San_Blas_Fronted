import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../apiClient';
import { crearSolicitudSacramento } from './constanciasService';

const solicitud = {
  Nombre: 'Persona Prueba',
  PrimerApellido: 'Prueba',
  SegundoApellido: 'Prueba',
  Cedula: 123456789,
  Correo: 'prueba@example.com',
  Telefono: 88888888,
  TipoSacramento: 'Bautismo',
  Motivo: 'Constancia de prueba',
  recaptchaToken: 'token-simulado',
};
const respuesta = {
  id: 1,
  PrimerNombre: 'Persona',
  PrimerApellido: 'Prueba',
  SegundoApellido: 'Prueba',
  Cedula: 123456789,
  Correo: 'prueba@example.com',
  Telefono: 88888888,
  Motivo: 'Constancia de prueba',
};

describe('token reCAPTCHA en solicitudes de constancia', () => {
  afterEach(() => vi.restoreAllMocks());

  it('incluye el token en el contrato JSON', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: respuesta });
    await crearSolicitudSacramento(solicitud);
    expect(post).toHaveBeenCalledWith(
      '/solic-sacramento',
      expect.objectContaining({
        recaptchaToken: 'token-simulado',
        PrimerNombre: 'Persona',
      }),
    );
  });

  it('incluye el token dentro de Payload y conserva el archivo del multipart', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: respuesta });
    const archivo = new File(['imagen simulada'], 'prueba.png', {
      type: 'image/png',
    });
    await crearSolicitudSacramento({ ...solicitud, archivoImagen: archivo });
    expect(post.mock.calls[0][0]).toBe('/solic-sacramento/con-imagen');
    const body = post.mock.calls[0][1] as FormData;
    expect(JSON.parse(String(body.get('Payload')))).toMatchObject({
      recaptchaToken: 'token-simulado',
    });
    expect(body.get('archivo')).toBe(archivo);
  });

  it('conserva el error del servidor y no reenvía automáticamente el token consumido', async () => {
    const post = vi.spyOn(apiClient, 'post').mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { mensaje: 'El reCAPTCHA no es válido o expiró.' },
      },
    });
    await expect(crearSolicitudSacramento(solicitud)).rejects.toThrow(
      'El reCAPTCHA no es válido o expiró.',
    );
    expect(post).toHaveBeenCalledTimes(1);
  });
});
