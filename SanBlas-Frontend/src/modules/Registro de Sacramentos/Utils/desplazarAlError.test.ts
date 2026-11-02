import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { desplazarAlPrimerError } from './desplazarAlError';

const scrollIntoViewOriginal = HTMLElement.prototype.scrollIntoView;
const matchMediaOriginal = window.matchMedia;

afterEach(() => {
  HTMLElement.prototype.scrollIntoView = scrollIntoViewOriginal;
  window.matchMedia = matchMediaOriginal;
});

const montarFormulario = () => (
  <form>
    <input name="idParroquia" disabled={false} data-testid="a" />
    <input name="libro" aria-invalid="true" data-testid="b" />
    <input name="folio" aria-invalid="true" data-testid="c" />
  </form>
);

describe('desplazarAlPrimerError', () => {
  it('enfoca y centra el primer campo inválido en el orden del formulario', () => {
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    render(montarFormulario());
    const form = document.querySelector('form') as HTMLFormElement;
    desplazarAlPrimerError(form);
    expect(document.activeElement).toBe(screen.getByTestId('b'));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('no hace nada si el formulario no tiene campos inválidos', () => {
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    render(
      <form>
        <input name="libro" />
      </form>,
    );
    const form = document.querySelector('form') as HTMLFormElement;
    desplazarAlPrimerError(form);
    expect(scroll).not.toHaveBeenCalled();
  });

  it('tolera un formulario nulo o ausente', () => {
    expect(() => desplazarAlPrimerError(null)).not.toThrow();
    const form = document.createElement('form');
    expect(() => desplazarAlPrimerError(form)).not.toThrow();
  });

  it('usa scroll instantáneo cuando el sistema pide movimiento reducido', () => {
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    render(montarFormulario());
    const form = document.querySelector('form') as HTMLFormElement;
    desplazarAlPrimerError(form);
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' });
  });
});
