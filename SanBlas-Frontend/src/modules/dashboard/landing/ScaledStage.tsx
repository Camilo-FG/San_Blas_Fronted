import { useEffect, useRef, useState, type ReactNode } from "react";

type ScaledStageProps = {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
};

export function ScaledStage({
  width,
  height,
  children,
  className,
}: ScaledStageProps) {
  const marcoRef = useRef<HTMLDivElement>(null);
  const [cajaW, setCajaW] = useState(0);

  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return;

    const actualizar = () => {
      const medida = marco.clientWidth;
      if (medida > 0) setCajaW(medida);
    };

    actualizar();
    const frame = requestAnimationFrame(actualizar);
    const observer = new ResizeObserver(actualizar);
    observer.observe(marco);
    window.addEventListener("resize", actualizar);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", actualizar);
    };
  }, [width, height]);

  const scale = cajaW > 0 ? cajaW / width : 0;

  return (
    <div
      ref={marcoRef}
      className={`h-full w-full overflow-x-hidden overflow-y-auto ${className ?? ""}`}
    >
      <div
        className="relative w-full"
        style={{ height: scale ? height * scale : "100%" }}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width,
            height,
            opacity: scale ? 1 : 0,
            transform: `scale(${scale || 1})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
