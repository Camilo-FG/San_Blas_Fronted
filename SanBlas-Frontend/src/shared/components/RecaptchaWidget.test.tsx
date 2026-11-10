import { StrictMode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecaptchaWidget } from './RecaptchaWidget';
import type { CaptchaControl } from '../hooks/useCaptcha';

interface OpcionesCaptcha {
  callback: (token: string | null) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
}

describe('RecaptchaWidget', () => {
  let opciones: OpcionesCaptcha[];
  let google: {
    render: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
  };
  let captchaRef: { current: CaptchaControl | null };

  // Simula solo el SDK del navegador; estas pruebas nunca resuelven un captcha real.
  beforeEach(() => {
    opciones = [];
    captchaRef = { current: null };
    google = {
      render: vi.fn((_elemento: HTMLElement, config: OpcionesCaptcha) => {
        opciones.push(config);
        return opciones.length;
      }),
      reset: vi.fn(),
    };
    vi.stubGlobal('grecaptcha', google);
    vi.stubGlobal('__SANBLAS_PRERENDER__', false);
  });

  // Quita únicamente los nodos y temporizadores que creó esta suite.
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document
      .querySelectorAll('script[src*="__sanblasRecaptchaReady"]')
      .forEach((script) => script.remove());
    vi.unstubAllGlobals();
  });

  it('sin clave no usa una clave pública de pruebas ni muestra una casilla alternativa', () => {
    render(<RecaptchaWidget sitekey="" captchaRef={captchaRef} />);
    expect(screen.getByRole('alert')).toHaveTextContent('no está configurada');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(google.render).not.toHaveBeenCalled();
    expect(document.querySelector('script[src*="recaptcha"]')).toBeNull();
  });

  it('entrega el token real, lo invalida al expirar y permite resetear el widget', async () => {
    const onChange = vi.fn();
    const onExpired = vi.fn();
    render(
      <RecaptchaWidget
        sitekey="clave-publica-ficticia"
        captchaRef={captchaRef}
        onChange={onChange}
        onExpired={onExpired}
      />,
    );
    await waitFor(() => expect(google.render).toHaveBeenCalledTimes(1));
    act(() => opciones[0].callback('token-simulado'));
    expect(onChange).toHaveBeenLastCalledWith('token-simulado');
    act(() => opciones[0]['expired-callback']());
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(onExpired).toHaveBeenCalledTimes(1);
    captchaRef.current?.reset();
    expect(google.reset).toHaveBeenCalledWith(1);
  });

  it('un error invalida el token y ofrece reintentar, nunca saltarse el captcha', async () => {
    const onChange = vi.fn();
    render(
      <RecaptchaWidget
        sitekey="clave-publica-ficticia"
        captchaRef={captchaRef}
        onChange={onChange}
      />,
    );
    await waitFor(() => expect(google.render).toHaveBeenCalledTimes(1));
    act(() => opciones[0]['error-callback']());
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar captcha' }));
    await waitFor(() => expect(google.render).toHaveBeenCalledTimes(2));
    expect(google.reset).toHaveBeenCalledWith(1);
  });

  it('StrictMode no duplica el widget y descarta callbacks después de desmontar', async () => {
    const onChange = vi.fn();
    const view = render(
      <StrictMode>
        <RecaptchaWidget
          sitekey="clave-publica-ficticia"
          captchaRef={captchaRef}
          onChange={onChange}
        />
      </StrictMode>,
    );
    await waitFor(() => expect(google.render).toHaveBeenCalledTimes(1));
    view.unmount();
    expect(captchaRef.current).toBeNull();
    expect(google.reset).toHaveBeenCalledWith(1);
    onChange.mockClear();
    act(() => opciones[0].callback('token-antiguo'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('el prerender no carga Google ni serializa un desafío del servidor de build', () => {
    vi.stubGlobal('__SANBLAS_PRERENDER__', true);
    render(
      <RecaptchaWidget
        sitekey="clave-publica-ficticia"
        captchaRef={captchaRef}
      />,
    );
    expect(google.render).not.toHaveBeenCalled();
    expect(document.querySelector('script[src*="recaptcha"]')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('un fallo de script muestra un error y permite una carga nueva', async () => {
    vi.stubGlobal('grecaptcha', undefined);
    render(
      <RecaptchaWidget
        sitekey="clave-publica-ficticia"
        captchaRef={captchaRef}
      />,
    );
    const script = document.querySelector(
      'script[src*="__sanblasRecaptchaReady"]',
    )!;
    expect(script.getAttribute('src')).toMatch(
      /^https:\/\/www\.google\.com\/recaptcha\//,
    );
    expect(script.getAttribute('src')).not.toContain('recaptcha.net');
    fireEvent.error(script);
    await screen.findByRole('alert');
    expect(document.contains(script)).toBe(false);
  });

  it('termina la espera de carga sin fabricar un token cuando Google no responde', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('grecaptcha', undefined);
    const onChange = vi.fn();
    render(
      <RecaptchaWidget
        sitekey="clave-publica-ficticia"
        captchaRef={captchaRef}
        onChange={onChange}
      />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
    expect(onChange.mock.calls.every(([token]) => token === null)).toBe(true);
  });

  it('dos widgets comparten una sola carga del script', async () => {
    vi.stubGlobal('grecaptcha', undefined);
    render(
      <>
        <RecaptchaWidget
          sitekey="clave-publica-ficticia"
          captchaRef={captchaRef}
        />
        <RecaptchaWidget
          sitekey="clave-publica-ficticia"
          captchaRef={{ current: null }}
        />
      </>,
    );
    expect(
      document.querySelectorAll('script[src*="__sanblasRecaptchaReady"]'),
    ).toHaveLength(1);
    vi.stubGlobal('grecaptcha', google);
    const ventana = window as Window & { __sanblasRecaptchaReady?: () => void };
    await act(async () => {
      ventana.__sanblasRecaptchaReady?.();
    });
    expect(google.render).toHaveBeenCalledTimes(2);
  });
});
