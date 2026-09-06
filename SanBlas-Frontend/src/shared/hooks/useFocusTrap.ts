import { useEffect } from 'react';

const FOCUSABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Atrapa el foco dentro de un contenedor modal (que debe tener un ref propio),
// ciclando con Tab / Shift+Tab y enfocando el primer elemento al abrirse.
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, abierto: boolean) {
  useEffect(() => {
    if (!abierto) return;
    const contenedor = ref.current;
    if (!contenedor) return;

    const obtenerEnfocables = () =>
      Array.from(contenedor.querySelectorAll<HTMLElement>(FOCUSABLES)).filter(
        (el) => el.offsetParent !== null,
      );

    const enfocarPrimero = () => {
      const enfocables = obtenerEnfocables();
      if (enfocables.length > 0) enfocables[0].focus();
    };

    const manejarTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const enfocables = obtenerEnfocables();
      if (enfocables.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement;

      if (e.shiftKey) {
        if (activo === primero || !contenedor.contains(activo)) {
          e.preventDefault();
          ultimo.focus();
        }
      } else if (activo === ultimo || !contenedor.contains(activo)) {
        e.preventDefault();
        primero.focus();
      }
    };

    enfocarPrimero();
    document.addEventListener('keydown', manejarTab);
    return () => document.removeEventListener('keydown', manejarTab);
  }, [ref, abierto]);
}
