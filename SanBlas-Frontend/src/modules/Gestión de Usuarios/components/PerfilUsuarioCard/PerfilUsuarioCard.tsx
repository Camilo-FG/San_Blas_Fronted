import { Mail, Shield, User } from "lucide-react";
import type { Usuario } from "../../../../types/Usuario";
import { etiquetaRol, type Rol } from "../../../../types/Rol";
import { Badge, cn } from "../../../../shared/ui";

const formatFechaCreacion = (fecha?: string | null) => {
  if (!fecha) return "—";
  const date = new Date(fecha.includes("T") ? fecha : `${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

type PerfilUsuarioCardProps = {
  usuario: Usuario;
  roles?: Rol[];
  titulo?: string;
  className?: string;
  espacioParaCerrar?: boolean;
};

export function PerfilUsuarioCard({
  usuario,
  roles = [],
  titulo = "Perfil",
  className,
  espacioParaCerrar = false,
}: PerfilUsuarioCardProps) {
  const nombre = usuario.userName || usuario.email || "Usuario";
  const correo = usuario.email || "—";
  const rol = etiquetaRol(usuario.role, roles);
  const activo = usuario.state;

  const campos = [
    { etiqueta: "Nombre", valor: nombre },
    { etiqueta: "Correo", valor: correo },
    { etiqueta: "Teléfono", valor: usuario.phoneNumber || "No provisto" },
    { etiqueta: "Rol", valor: rol },
    {
      etiqueta: "Fecha de creación",
      valor: formatFechaCreacion(usuario.creationDate),
    },
  ];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 border-b border-border-strong px-5 py-5 sm:flex-row sm:items-center sm:gap-5",
          espacioParaCerrar && "pr-16",
        )}
      >
        <div
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#003366]/10 text-[#003366]"
          aria-hidden="true"
        >
          <User size={28} />
        </div>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold tracking-wide text-text-muted uppercase">
            {titulo}
          </p>
          <h2 className="m-0 mt-1 font-heading text-xl font-bold text-royal-blue">
            {nombre}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
            <Mail size={14} />
            <span className="truncate">{correo}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          <Badge variant="neutral">
            <span className="inline-flex items-center gap-1">
              <Shield size={12} />
              {rol}
            </span>
          </Badge>
          <Badge variant={activo ? "success" : "danger"}>
            {activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <dl className="m-0 grid grid-cols-1 gap-0 sm:grid-cols-2">
        {campos.map((campo) => (
          <div
            key={campo.etiqueta}
            className="border-b border-border-strong px-5 py-4 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <dt className="m-0 text-xs font-bold tracking-wide text-text-muted uppercase">
              {campo.etiqueta}
            </dt>
            <dd className="mt-1 text-sm font-medium text-text">{campo.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
