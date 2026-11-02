const DURACION_SCROLL = 1000;
let frameScroll: number | null = null;

export function desplazarAlPrimerError(form: HTMLFormElement | null): void {
  if (!form) return;

  if (frameScroll !== null) cancelAnimationFrame(frameScroll);

  frameScroll = requestAnimationFrame(() => {
    frameScroll = null;
    const primero = form.querySelector('[aria-invalid="true"]');
    if (!(primero instanceof HTMLElement)) return;

    primero.focus({ preventScroll: true });

    const raiz = document.scrollingElement;
    const contenedorMarcado = form.querySelector('[data-validation-scroll-container]');
    let contenedor =
      contenedorMarcado instanceof HTMLElement
        ? contenedorMarcado
        : raiz instanceof HTMLElement
          ? raiz
          : document.documentElement;
    if (!(contenedorMarcado instanceof HTMLElement)) {
      for (
        let ancestro = primero.parentElement;
        ancestro;
        ancestro = ancestro.parentElement
      ) {
        if (!(ancestro instanceof HTMLElement)) break;
        const overflowY = window.getComputedStyle(ancestro).overflowY;
        if (
          (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
          ancestro.scrollHeight > ancestro.clientHeight
        ) {
          contenedor = ancestro;
          break;
        }
        if (ancestro === form) break;
      }
    }

    const campoRect = primero.getBoundingClientRect();
    const esRaiz = contenedor === raiz || contenedor === document.documentElement;
    const altoVisible = esRaiz ? window.innerHeight : contenedor.clientHeight;
    const bordeSuperior = esRaiz
      ? 0
      : contenedor.getBoundingClientRect().top + contenedor.clientTop;
    const inicio = contenedor.scrollTop;
    const maxScroll = Math.max(
      0,
      contenedor.scrollHeight - (esRaiz ? window.innerHeight : contenedor.clientHeight),
    );
    const destino = Math.min(
      maxScroll,
      Math.max(
        0,
        inicio + campoRect.top - bordeSuperior + campoRect.height / 2 - altoVisible / 2,
      ),
    );

    if (Math.abs(destino - inicio) < 1) {
      contenedor.scrollTop = destino;
      return;
    }

    let tiempoInicio: number | null = null;
    const animar = (tiempo: number) => {
      tiempoInicio ??= tiempo;
      const progreso = Math.min((tiempo - tiempoInicio) / DURACION_SCROLL, 1);
      const suavizado = (1 - Math.cos(Math.PI * progreso)) / 2;
      contenedor.scrollTop = inicio + (destino - inicio) * suavizado;

      if (progreso < 1) {
        frameScroll = requestAnimationFrame(animar);
      } else {
        frameScroll = null;
      }
    };

    frameScroll = requestAnimationFrame(animar);
  });
}
