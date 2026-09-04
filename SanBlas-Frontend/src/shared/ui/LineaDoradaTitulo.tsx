import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function LineaDoradaTitulo({
  parteSubrayada,
  resto = "",
}: {
  parteSubrayada: string;
  resto?: string;
}) {
  const refContenedor = useRef<HTMLDivElement>(null);
  const refTexto = useRef<HTMLSpanElement>(null);
  const [medidas, setMedidas] = useState({ ancho: 0, top: 0 });

  useLayoutEffect(() => {
    const contenedor = refContenedor.current;
    const span = refTexto.current;
    if (!contenedor || !span) return;
    const estilos = window.getComputedStyle(span);
    const fontSize = parseFloat(estilos.fontSize);
    const lineaBase = span.offsetTop + span.offsetHeight - fontSize * 0.24;
    setMedidas({ ancho: span.offsetWidth, top: lineaBase + 8 });
  }, [parteSubrayada]);

  return (
    <div ref={refContenedor} className="relative w-fit">
      <h2
        className="m-0 mt-1 pb-2 text-lg leading-tight font-semibold tracking-tight text-[#16243c]"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        <span ref={refTexto}>{parteSubrayada}</span>
        {resto}
      </h2>
      {medidas.ancho > 0 && (
        <motion.div
          className="absolute left-0 h-[3px] origin-left rounded-full bg-[#dcb55a]"
          style={{ top: medidas.top, width: medidas.ancho }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.45, 0, 0.35, 1] }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
