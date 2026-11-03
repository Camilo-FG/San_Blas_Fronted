import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { desplazarAlPrimerError } from './desplazarAlError';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('desplazarAlPrimerError', () => {
  it('anima a 60 fps hasta centrar el primer campo inválido en el scroll del modal', () => {
    const frames: FrameRequestCallback[] = [];
    const requestFrame = (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    };
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    render(
      <form aria-label="Formulario de prueba">
        <div
          data-validation-scroll-container
          data-testid="scroll"
          style={{ overflowY: 'auto' }}
        >
          <input aria-invalid="true" data-testid="campo-invalido" />
        </div>
      </form>,
    );

    const scroll = screen.getByTestId('scroll');
    const campo = screen.getByTestId('campo-invalido');
    Object.defineProperties(scroll, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, writable: true, value: 0 },
      getBoundingClientRect: {
        value: () => ({ top: 100, bottom: 300, height: 200 }),
      },
    });
    Object.defineProperty(campo, 'getBoundingClientRect', {
      value: () => ({ top: 600, bottom: 640, height: 40 }),
    });

    desplazarAlPrimerError(
      screen.getByRole('form', { name: 'Formulario de prueba' }) as HTMLFormElement,
    );

    const ejecutarFrame = (tiempo: number) => {
      const callback = frames.shift();
      expect(callback).toBeDefined();
      callback?.(tiempo);
    };

    ejecutarFrame(0);
    expect(campo).toHaveFocus();
    ejecutarFrame(0);
    ejecutarFrame(500);
    expect(scroll.scrollTop).toBeCloseTo(210);
    ejecutarFrame(1000);
    expect(scroll.scrollTop).toBeCloseTo(420);
  });

  it('no hace nada si el formulario no tiene campos inválidos', () => {
    render(
      <form aria-label="Formulario válido">
        <input name="libro" />
      </form>,
    );
    const formulario = screen.getByRole('form', { name: 'Formulario válido' }) as HTMLFormElement;
    expect(() => desplazarAlPrimerError(formulario)).not.toThrow();
  });

  it('tolera un formulario nulo o sin campos', () => {
    expect(() => desplazarAlPrimerError(null)).not.toThrow();
    expect(() => desplazarAlPrimerError(document.createElement('form'))).not.toThrow();
  });
});
