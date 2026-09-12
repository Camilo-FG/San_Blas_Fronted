import { useEffect, useState } from "react";
import { AlertOctagon, Loader2, Mail, Shield, User } from "lucide-react";
import type { Usuario } from "../../../../types/Usuario";
import { etiquetaRol, type Rol } from "../../../../types/Rol";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../shared/ui";
import { Badge, Button, Card, cn } from "../../../../shared/ui";
import { useUpdateUser } from "../../hooks/hooksUsuarios/useUpdateUser";

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
  // el padre se entera cuando se desactiva la cuenta para refrescar el listado
  onEstadoCambiado?: (activo: boolean) => void;
};

export function PerfilUsuarioCard({
  usuario,
  roles = [],
  titulo = "Perfil",
  className,
  espacioParaCerrar = false,
  onEstadoCambiado,
}: PerfilUsuarioCardProps) {
  const { user: usuarioSesion } = useAuth();
  const { showToast } = useToast();
  const { actualizarUsuario, loading: desactivando } = useUpdateUser();
  const [activo, setActivo] = useState(usuario.state);
  const [confirmando, setConfirmando] = useState(false);

  // si cambia el usuario mostrado (modal que reutiliza el componente) reseteamos el estado
  useEffect(() => {
    setActivo(usuario.state);
    setConfirmando(false);
  }, [usuario.id, usuario.state]);

  const nombre = usuario.userName || usuario.email || "Usuario";
  const correo = usuario.email || "—";
  const rol = etiquetaRol(usuario.role, roles);

  // comparamos id y email porque el del modal viene del listado y el de sesión de otra fuente
  const esUsuarioActual =
    (usuarioSesion?.id != null && usuario.id === usuarioSesion.id) ||
    (usuarioSesion?.email != null &&
      usuario.email.toLowerCase() === usuarioSesion.email.toLowerCase());

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

  const confirmarDesactivacion = async () => {
    const resultado = await actualizarUsuario(usuario.id, { state: false });
    if (resultado.ok) {
      setActivo(false);
      setConfirmando(false);
      showToast("Cuenta desactivada correctamente", "success");
      onEstadoCambiado?.(false);
      return;
    }
    showToast(resultado.mensaje, "error");
    setConfirmando(false);
  };

  return (
    <Card className={cn("p-0", className)}>
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

      <div className="border-t border-border-strong bg-danger-bg/40 px-5 py-4">
        {esUsuarioActual ? (
          <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-text-secondary">
            <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
            No puede desactivar su propia cuenta desde aquí.
          </p>
        ) : !activo ? (
          <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-text-secondary">
            <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
            Esta cuenta está inactiva y no aparece en el listado.
          </p>
        ) : !confirmando ? (
          <div>
            <div className="flex items-start gap-2.5">
              <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
              <div>
                <p className="m-0 text-sm font-bold text-danger">Zona de peligro</p>
                <p className="m-0 mt-0.5 text-xs leading-relaxed text-text-secondary">
                  Al desactivar la cuenta, {nombre} perderá el acceso y dejará de
                  aparecer en el listado de usuarios.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              className="mt-3 shrink-0 self-start"
              onClick={() => setConfirmando(true)}
              disabled={desactivando}
            >
              Desactivar cuenta
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <p className="m-0 flex-1 text-sm leading-relaxed text-text-secondary">
              ¿Confirmar la desactivación de <strong>{nombre}</strong>? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => void confirmarDesactivacion()}
                disabled={desactivando}
              >
                {desactivando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {desactivando ? "Desactivando..." : "Sí, desactivar"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirmando(false)}
                disabled={desactivando}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}