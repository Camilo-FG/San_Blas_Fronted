/**
 * Al fallar la validación al guardar, mueve la vista hasta el primer campo
 * inválido del formulario (en el orden visual real del DOM) y le pone el foco,
 * con el cursor listo para corregirlo.
 */
export function desplazarAlPrimerError(form: HTMLFormElement | null): void {
  if (!form) return;
  const primero = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!primero) return;
  const movimientoReducido =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  primero.focus({ preventScroll: true });
  primero.scrollIntoView?.({ behavior: movimientoReducido ? 'auto' : 'smooth', block: 'center' });
}
