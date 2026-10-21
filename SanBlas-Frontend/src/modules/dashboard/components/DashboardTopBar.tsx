import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, User } from "lucide-react";
import Rutas from "../../../routes/Rutas";
import { useAuth } from "../../../context/AuthContext";
import { cn } from "../../../shared/ui";
import NotificacionesPanel from "./NotificacionesPanel";

interface DashboardTopBarProps {
  tituloSeccion: string;
  esAdmin?: boolean;
}

function getUserInitial(email?: string | null): string {
  if (!email) return "A";
  return email.charAt(0).toUpperCase();
}

function getRoleLabel(role?: string | null): string {
  if (!role) return "Usuario";
  const clave = role.toLowerCase();
  if (clave === "secretario" || clave === "admin") return "Secretario";
  if (clave === "catequista") return "Catequista";
  if (clave === "gestor-eventos") return "Gestor de Eventos";
  if (clave === "gestor-donaciones") return "Personal de Donaciones";
  if (clave === "user") return "Usuario";
  return role;
}

/** Barra superior del panel (solo desktop): sección actual + campana + perfil. */
export default function DashboardTopBar({
  tituloSeccion,
  esAdmin = false,
}: DashboardTopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto) return;

    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuAbierto(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuAbierto(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuAbierto]);

  const handleLogout = () => {
    setMenuAbierto(false);
    logout();
    navigate({ to: Rutas.login });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-border bg-surface/95 px-6 py-3 backdrop-blur-sm lg:flex lg:px-8",
        esAdmin &&
          "dark:border-[rgba(220,230,242,0.1)] dark:bg-[#040b16]/95",
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "text-[0.68rem] font-extrabold tracking-[0.14em] text-brand-gold uppercase",
            esAdmin && "dark:text-[#d9a928]",
          )}
        >
          Panel
        </p>
        <p
          className={cn(
            "truncate font-heading text-sm font-semibold text-brand-blue",
            esAdmin && "dark:text-[#f3f6fa]",
          )}
        >
          {tituloSeccion}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <NotificacionesPanel variante="claro" />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-label="Menú de perfil"
            aria-expanded={menuAbierto}
            aria-haspopup="menu"
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-1.5 py-1 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "hover:bg-brand-blue/5 dark:hover:bg-white/5",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold font-heading text-[10px] font-bold text-brand-blue uppercase">
              {getUserInitial(user?.email)}
            </div>
            <div className="hidden min-w-0 text-left xl:block">
              <p
                className={cn(
                  "max-w-[140px] truncate text-xs font-bold text-brand-blue",
                  esAdmin && "dark:text-[#f3f6fa]",
                )}
              >
                {getRoleLabel(user?.role)}
              </p>
              <p className="max-w-[140px] truncate text-[10px] text-text-secondary dark:text-[#8a97ab]">
                {user?.email}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-text-secondary transition-transform xl:block",
                menuAbierto && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {menuAbierto && (
            <div
              role="menu"
              aria-label="Opciones de perfil"
              className={cn(
                "absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
                "dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]",
              )}
            >
              <div className="border-b border-border px-3 py-2.5 dark:border-[rgba(220,230,242,0.1)]">
                <p className="truncate text-xs font-bold text-brand-blue dark:text-[#f3f6fa]">
                  {getRoleLabel(user?.role)}
                </p>
                <p className="truncate text-[11px] text-text-secondary dark:text-[#b7c3d4]">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <Link
                  to={Rutas.dashboardUrl.perfil}
                  role="menuitem"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-blue no-underline transition-colors hover:bg-brand-blue/5 dark:text-[#f3f6fa] dark:hover:bg-white/5"
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Mi perfil
                </Link>
                <Link
                  to={Rutas.home}
                  role="menuitem"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-blue no-underline transition-colors hover:bg-brand-blue/5 dark:text-[#f3f6fa] dark:hover:bg-white/5"
                >
                  Ver sitio
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
