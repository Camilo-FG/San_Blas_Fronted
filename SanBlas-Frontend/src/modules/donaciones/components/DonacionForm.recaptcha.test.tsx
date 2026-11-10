import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DonacionForm from './DonacionForm';

const mocks = vi.hoisted(() => ({
  enviar: vi.fn(),
  reset: vi.fn(),
  toast: vi.fn(),
}));
const scrollOriginal = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'scrollIntoView',
);
vi.mock('../hooks/useDonacionInsumos', () => ({
  useDonacionInsumos: () => ({
    cargando: false,
    error: null,
    erroresCampo: {},
    limpiarErroresCampo: vi.fn(),
    enviar: mocks.enviar,
  }),
}));
vi.mock('../../../shared/ui', () => ({
  useToast: () => ({ showToast: mocks.toast }),
}));
vi.mock('../../../shared/components/RecaptchaWidget', async () => {
  const { useEffect } = await import('react');
  return {
    // Solo permite generar un token simulado dentro de esta prueba, no en la aplicación.
    RecaptchaWidget: function CaptchaSimulado({
      captchaRef,
      onChange,
    }: {
      captchaRef: { current: { reset: () => void } | null };
      onChange: (token: string | null) => void;
    }) {
      useEffect(() => {
        captchaRef.current = { reset: mocks.reset };
      }, [captchaRef]);
      return (
        <button type="button" onClick={() => onChange('token-simulado')}>
          Resolver captcha simulado
        </button>
      );
    },
  };
});

describe('reCAPTCHA en formulario de donaciones', () => {
  beforeEach(() => {
    mocks.enviar.mockReset();
    mocks.reset.mockClear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (scrollOriginal)
      Object.defineProperty(
        Element.prototype,
        'scrollIntoView',
        scrollOriginal,
      );
    else Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  // Completa una donación anónima para probar el envío sin datos de personas reales.
  const completar = () => {
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'prueba@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Detalle de la donación'), {
      target: { value: 'Insumos para una prueba automatizada' },
    });
  };

  it('sin resolver el captcha mantiene el envío deshabilitado y no llama al servicio', () => {
    const { container } = render(<DonacionForm />);
    completar();
    expect(
      screen.getByRole('button', { name: 'Enviar Donación' }),
    ).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.enviar).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'envía el token y lo invalida tras terminar (guardado=%s)',
    async (resultado) => {
      mocks.enviar.mockResolvedValueOnce(resultado);
      render(<DonacionForm />);
      completar();
      fireEvent.click(
        screen.getByRole('button', { name: 'Resolver captcha simulado' }),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Enviar Donación' }));
      await waitFor(() => expect(mocks.reset).toHaveBeenCalledTimes(1));
      expect(mocks.enviar).toHaveBeenCalledWith(
        expect.objectContaining({ recaptchaToken: 'token-simulado' }),
      );
      expect(
        screen.getByRole('button', { name: 'Enviar Donación' }),
      ).toBeDisabled();
      if (!resultado)
        expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
          'prueba@example.com',
        );
    },
  );
});
