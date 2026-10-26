import { useEffect, useRef } from 'react';

// Ejecuta una acción al presionar Escape mientras `activo` sea verdadero.
// `habilitado` permite suspenderlo (por ejemplo, mientras se guarda).
export function useEscapeKey(
  activo: boolean,
  onEscape: () => void,
  habilitado = true,
) {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!activo || !habilitado) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscapeRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activo, habilitado]);
}
