import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { cn } from "../../../shared/ui";
import { useNotificacionesPanel } from "../hooks/useNotificacionesPanel";

type Variante = "claro" | "oscuro";

interface NotificacionesPanelProps {
  /** claro = barra desktop; oscuro = barra azul móvil */
  variante?: Variante;
}

export default function NotificacionesPanel({
  variante = "claro",
}: NotificacionesPanelProps) {
  const { items, total, cargando } = useNotificacionesPanel();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const handleClick = (event: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto]);

  const badgeTexto = total > 99 ? "99+" : String(total);
  const esOscuro = variante === "oscuro";

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-label={
          total > 0
            ? `Notificaciones: ${total} solicitudes pendientes`
            : "Notificaciones"
        }
        aria-expanded={abierto}
        aria-haspopup="menu"
        className={cn(
          "relative inline-flex cursor-pointer items-center justify-center rounded-lg border-none p-2 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          esOscuro
            ? "bg-transparent text-white hover:bg-white/10 hover:text-brand-gold"
            : "bg-transparent text-brand-blue hover:bg-brand-blue/5 dark:text-[#e8eef6] dark:hover:bg-white/5",
        )}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {total > 0 && (
          <span
            className={cn(
              "absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white",
              esOscuro ? "bg-brand-gold text-brand-blue" : "bg-red-600",
            )}
          >
            {badgeTexto}
          </span>
        )}
      </button>

      {abierto && (
        <div
          role="menu"
          aria-label="Solicitudes pendientes"
          className={cn(
            "absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
            "dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]",
          )}
        >
          <div className="border-b border-border px-3 py-2.5 dark:border-[rgba(220,230,242,0.1)]">
            <p className="text-xs font-bold tracking-wide text-brand-gold uppercase dark:text-[#d9a928]">
              Solicitudes pendientes
            </p>
            <p className="mt-0.5 text-xs text-text-secondary dark:text-[#b7c3d4]">
              {cargando && total === 0
                ? "Cargando…"
                : total === 0
                  ? "No hay solicitudes pendientes"
                  : total === 1
                    ? "1 solicitud por revisar"
                    : `${total} solicitudes por revisar`}
            </p>
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-text-secondary dark:text-[#b7c3d4]">
              Sin módulos de solicitudes en su perfil.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    role="menuitem"
                    onClick={() => setAbierto(false)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm no-underline transition-colors hover:bg-brand-blue/5 dark:hover:bg-white/5"
                  >
                    <span className="min-w-0 truncate font-medium text-brand-blue dark:text-[#f3f6fa]">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                        item.count > 0
                          ? "bg-brand-gold/20 text-brand-blue dark:bg-[#d9a928]/25 dark:text-[#e8c85a]"
                          : "bg-gray-100 text-text-secondary dark:bg-white/5 dark:text-[#8a97ab]",
                      )}
                    >
                      {item.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
