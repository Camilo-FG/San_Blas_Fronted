import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getUserById } from "../../Gestión de Usuarios/services/userServices";
import { PerfilUsuarioCard } from "../../Gestión de Usuarios/components/PerfilUsuarioCard/PerfilUsuarioCard";
import type { Usuario } from "../../../types/Usuario";
import { AdminModule, ErrorMessage, PageLoader } from "../../../shared/ui";

export default function MiPerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (user?.id == null) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getUserById(user.id);
        setPerfil(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el perfil.",
        );
      } finally {
        setLoading(false);
      }
    };

    void cargar();
  }, [user?.id]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} />;
  if (!perfil && !user) {
    return <ErrorMessage message="No hay una sesión activa." />;
  }

  const usuario: Usuario = perfil ?? {
    id: user?.id ?? 0,
    userName: user?.email ?? "Usuario",
    email: user?.email ?? "",
    phoneNumber: "",
    role: user?.role ?? "user",
    state: true,
    creationDate: "",
  };

  return (
    <AdminModule>
      <PerfilUsuarioCard usuario={usuario} titulo="Mi perfil" />
    </AdminModule>
  );
}
