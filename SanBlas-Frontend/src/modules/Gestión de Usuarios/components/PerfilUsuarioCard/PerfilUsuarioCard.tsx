import { useEffect, useState } from "react";
import { AlertOctagon, Mail, Shield, User } from "lucide-react";
import type { Usuario } from "../../../../types/Usuario";
import { etiquetaRol, type Rol } from "../../../../types/Rol";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../shared/ui";
import {
  Badge,
  Button,
  Card,
  ConfirmacionAccionModal,
  cn,
} from "../../../../shared/ui";
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

  useEffect(() => {
    setActivo(usuario.state);
    setConfirmando(false);
  }, [usuario.id, usuario.state]);

  const nombre = usuario.userName || usuario.email || "Usuario";
  const correo = usuario.email || "—";
  // Todos los roles de la cuenta (no solo el primero): si la lista viene
  // vacía se usa el rol singular como respaldo para no mostrar vacío.
  const clavesRoles =
    usuario.roles && usuario.roles.length > 0
      ? usuario.roles
      : usuario.role
        ? [usuario.role]
        : [];
  const nombresRoles = clavesRoles.map((clave) => etiquetaRol(clave, roles));
  const rol = nombresRoles.join(", ") || "—";

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
    <Card className={cn("p-0 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]", className)}>
      <div
        className={cn(
          "flex flex-col gap-4 border-b border-border-strong px-5 py-5 sm:flex-row sm:items-center sm:gap-5 dark:border-[rgba(220,230,242,0.12)]",
          espacioParaCerrar && "pr-16",
        )}
      >
        <div
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#003366]/10 text-[#003366] dark:bg-[rgba(217,169,40,0.14)] dark:text-[#d9a928]"
          aria-hidden="true"
        >
          <User size={28} />
        </div>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold tracking-wide text-text-muted uppercase dark:text-[#7f8da3]">
            {titulo}
          </p>
          <h2 className="m-0 mt-1 font-heading text-xl font-bold text-royal-blue dark:text-[#f3f6fa]">
            {nombre}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary dark:text-[#b7c3d4]">
            <Mail size={14} />
            <span className="truncate">{correo}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          <Badge
            variant={activo ? "success" : "danger"}
            className={
              activo
                ? "dark:border-[#35d6a0] dark:bg-[rgba(53,214,160,0.10)] dark:text-[#35d6a0]"
                : "dark:border-[#e66a6a] dark:bg-[rgba(230,106,106,0.10)] dark:text-[#e66a6a]"
            }
          >
            {activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <dl className="m-0 grid grid-cols-1 gap-0 sm:grid-cols-2">
        {campos.map((campo) => (
          <div
            key={campo.etiqueta}
            className="border-b border-border-strong px-5 py-4 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 dark:border-[rgba(220,230,242,0.12)]"
          >
            <dt className="m-0 text-xs font-bold tracking-wide text-text-muted uppercase dark:text-[#7f8da3]">
              {campo.etiqueta}
            </dt>
            <dd className="mt-1 text-sm font-medium text-text dark:text-[#f3f6fa]">{campo.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-border-strong bg-danger-bg/40 px-5 py-4 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]">
        {esUsuarioActual ? (
          <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-text-secondary dark:text-[#b7c3d4]">
            <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
            No puede desactivar su propia cuenta, para desactivar, por favor
            comuníquese con el personal secretario.
          </p>
        ) : !activo ? (
          <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-text-secondary dark:text-[#b7c3d4]">
            <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
            Esta cuenta está inactiva y no aparece en el listado.
          </p>
        ) : (
          <div>
            <div className="flex items-start gap-2.5">
              <AlertOctagon size={18} className="mt-0.5 shrink-0 text-danger" />
              <div>
                <p className="m-0 text-sm font-bold text-danger">Zona de peligro</p>
                <p className="m-0 mt-0.5 text-xs leading-relaxed text-text-secondary dark:text-[#b7c3d4]">
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
        )}
      </div>

      {/* misma doble confirmación que usan sacramentos y "Eliminar usuario" */}
      <ConfirmacionAccionModal
        open={confirmando}
        title="Confirmar desactivación"
        parteSubrayada="Desactivar cuenta"
        iconoAdvertencia
        confirmVariant="danger"
        mensaje={
          <>
            ¿Estás seguro/a que quieres desactivar la cuenta de{' '}
            <strong className="font-semibold text-text dark:text-[#f3f6fa]">{nombre}</strong>?
            Perderá el acceso y dejará de aparecer en el listado de usuarios.
            Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Sí, desactivar"
        pendingLabel="Desactivando..."
        isPending={desactivando}
        overlayClassName="fixed inset-0 z-[1350] overflow-hidden overscroll-none bg-[#060f20]/35 backdrop-blur-[6px] dark:bg-black/60"
        className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_p.text-text-secondary]:text-[#b7c3d4] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
        cancelClassName="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!"
        onConfirm={() => void confirmarDesactivacion()}
        onCancel={() => setConfirmando(false)}
      />
    </Card>
  );
}
