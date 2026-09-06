import { useEffect, type RefObject } from "react";

function bloquearScroll(elemento: HTMLElement) {
  const overflow = elemento.style.overflow;
  const overscroll = elemento.style.overscrollBehavior;
  elemento.style.overflow = "hidden";
  elemento.style.overscrollBehavior = "none";
  return () => {
    elemento.style.overflow = overflow;
    elemento.style.overscrollBehavior = overscroll;
  };
}

export function useScrollLock(
  activo = true,
  contenedorRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!activo) return;

    const restaurar = [
      bloquearScroll(document.documentElement),
      bloquearScroll(document.body),
    ];

    const contenedorPagina = document.querySelector("main");
    if (contenedorPagina instanceof HTMLElement) {
      restaurar.push(bloquearScroll(contenedorPagina));
    }

    const impedirScrollExterno = (event: WheelEvent | TouchEvent) => {
      const contenedor = contenedorRef?.current;
      const destino = event.target;
      if (
        contenedor &&
        destino instanceof Node &&
        contenedor.contains(destino)
      ) {
        return;
      }
      event.preventDefault();
    };

    document.addEventListener("wheel", impedirScrollExterno, { passive: false });
    document.addEventListener("touchmove", impedirScrollExterno, {
      passive: false,
    });

    return () => {
      restaurar.forEach((liberar) => liberar());
      document.removeEventListener("wheel", impedirScrollExterno);
      document.removeEventListener("touchmove", impedirScrollExterno);
    };
  }, [activo, contenedorRef]);
}
