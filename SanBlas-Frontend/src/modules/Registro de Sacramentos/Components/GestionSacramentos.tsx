import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useGetListBautismo } from "../hooks/hooksBautismo/useGetListBautismo";
import { useGetListComunion } from "../hooks/hooksComunion/useGetListComunion";
import { useGetListConfirma } from "../hooks/hooksConfirma/useGetListConfirma";
import { useGetListMatrimonio } from "../hooks/hooksMatrimonio/useGetListMatrimonio";
import SacramentTable from "./SacramentTable";
import SacramentoEmptyState from "./SacramentoEmptyState";
import DetailsDrawer from "./DetailsDrawer";
import AddSacramentoModal from "./AddSacramentoModal";
import EditSacramentoModal from "./EditSacramentoModal";
import { useCreateBautismo } from "../hooks/hooksBautismo/useCreateBautismo";
import { useCreateComunion } from "../hooks/hooksComunion/useCreateComunion";
import { useCreateConfirma } from "../hooks/hooksConfirma/useCreateConfirma";
import { useCreateMatrimonio } from "../hooks/hooksMatrimonio/useCreateMatrimonio";
import { usePutBautismo } from "../hooks/hooksBautismo/usePutBautismo";
import { usePutComunion } from "../hooks/hooksComunion/usePutComunion";
import { usePutConfirma } from "../hooks/hooksConfirma/usePutConfirma";
import { usePutMatrimonio } from "../hooks/hooksMatrimonio/usePutMatrimonio";
import { useDeleteBautismo } from "../hooks/hooksBautismo/useDeleteBautismo";
import { useDeleteComunion } from "../hooks/hooksComunion/useDeleteComunion";
import { useDeleteConfirma } from "../hooks/hooksConfirma/useDeleteConfirma";
import { useDeleteMatrimonio } from "../hooks/hooksMatrimonio/useDeleteMatrimonio";
import { AdminModule, AdminSearch, Button, useToast } from "../../../shared/ui";

const GestionSacramentos = () => {
  const { showToast } = useToast();
  const {
    data: bautismos,
    isLoading: bautismosLoading,
    error: bautismosError,
    refetch: refetchBautismos,
  } = useGetListBautismo();
  const {
    data: comuniones,
    isLoading: comunionesLoading,
    error: comunionesError,
    refetch: refetchComuniones,
  } = useGetListComunion();
  const {
    data: confirmaciones,
    isLoading: confirmacionesLoading,
    error: confirmacionesError,
    refetch: refetchConfirmaciones,
  } = useGetListConfirma();
  const {
    data: matrimonios,
    isLoading: matrimoniosLoading,
    error: matrimoniosError,
    refetch: refetchMatrimonios,
  } = useGetListMatrimonio();

  const isPending =
    bautismosLoading ||
    comunionesLoading ||
    confirmacionesLoading ||
    matrimoniosLoading;
  const error =
    bautismosError ||
    comunionesError ||
    confirmacionesError ||
    matrimoniosError;

  const createBautismo = useCreateBautismo();
  const createComunion = useCreateComunion();
  const createConfirmacion = useCreateConfirma();
  const createMatrimonio = useCreateMatrimonio();
  const updateBautismo = usePutBautismo();
  const updateComunion = usePutComunion();
  const updateConfirmacion = usePutConfirma();
  const updateMatrimonio = usePutMatrimonio();
  const deleteBautismo = useDeleteBautismo();
  const deleteComunion = useDeleteComunion();
  const deleteConfirmacion = useDeleteConfirma();
  const deleteMatrimonio = useDeleteMatrimonio();

  const [nombreInput, setNombreInput] = useState("");
  const [cedulaInput, setCedulaInput] = useState("");
  const [fechaInput, setFechaInput] = useState("");
  const [searchNombre, setSearchNombre] = useState("");
  const [searchCedula, setSearchCedula] = useState("");
  const [searchFecha, setSearchFecha] = useState("");

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const matchFechaFlexible = (fechaStr: string, search: string): boolean => {
    if (!search.trim()) return true;
    const parts = search.trim().split(/[\s\/\-]+/).filter(Boolean);
    if (parts.length === 0) return true;

    const fechaLower = fechaStr.toLowerCase();

    if (parts.length === 1) {
      const p = parts[0];
      if (/^\d{4}$/.test(p)) {
        return fechaLower.includes(p.toLowerCase());
      }
      return fechaLower.includes(p.toLowerCase());
    }

    if (parts.length === 2) {
      const [p1, p2] = parts;
      const p1Lower = p1.toLowerCase();
      const p2Lower = p2.toLowerCase();
      return (
        (fechaLower.includes(p1Lower) && fechaLower.includes(p2Lower))
      );
    }

    if (parts.length >= 3) {
      return parts.every(p => fechaLower.includes(p.toLowerCase()));
    }

    return false;
  };
  const [selectedSacramento, setSelectedSacramento] = useState<any>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>("Bautismo");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("fechaCelebracion");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSacramento, setEditingSacramento] = useState<any>(null);
  const [editingTipo, setEditingTipo] = useState<string>("Bautismo");

  const handleSaveSacramento = async (data: any, tipo: string) => {
    const fechaRegistro = new Date().toISOString();
    try {
      if (tipo === "Bautismo") {
        await createBautismo.mutateAsync({
          id: 0,
          ...data,
          fechaRegistro,
          SegundoApellido: data.SegundoApellido || "",
          Prebispero: data.Prebispero || "",
          horaNacimiento: data.horaNacimiento || "",
          NombreAbuelosPaternos: data.NombreAbuelosPaternos || "",
          NombreAbuelosMaternos: data.NombreAbuelosMaternos || "",
        });
        await refetchBautismos();
      } else if (tipo === "Comunión") {
        await createComunion.mutateAsync({ id: 0, ...data, fechaRegistro });
        await refetchComuniones();
      } else if (tipo === "Confirmación") {
        await createConfirmacion.mutateAsync({ id: 0, ...data, fechaRegistro });
        await refetchConfirmaciones();
      } else if (tipo === "Matrimonio") {
        await createMatrimonio.mutateAsync({ id: 0, ...data, fechaRegistro });
        await refetchMatrimonios();
      }
      showToast("Acta sacramental registrada correctamente", "success");
    } catch (err: any) {
      const conflicto =
        err?.response?.status === 409 ||
        /ya existe|duplicado|conflicto/i.test(err?.message || "");
      showToast(
        conflicto
          ? "Esta acta ya se encuentra registrada. Verifique los datos del libro."
          : "No se pudo registrar el acta. Intente de nuevo.",
        "error",
      );
      throw err;
    }
  };

  const handleEdit = (sacramento: any) => {
    setEditingSacramento(sacramento.detalles);
    setEditingTipo(sacramento.tipo);
    setEditModalOpen(true);
  };

  const handleEditSave = async (
    datos: Record<string, any>,
    tipoOriginal: string,
  ) => {
    const {
      Bautismo,
      Comunión: Comunion,
      Confirmación: Confirmacion,
      Matrimonio,
    } = datos;

    if (Bautismo) {
      if (tipoOriginal === "Bautismo" && Bautismo.id) {
        await updateBautismo.mutateAsync(Bautismo);
      } else {
        await createBautismo.mutateAsync({
          id: 0,
          ...Bautismo,
          fechaRegistro: new Date().toISOString(),
        });
      }
      await refetchBautismos();
    }

    if (Comunion) {
      if (tipoOriginal === "Comunión" && Comunion.id) {
        await updateComunion.mutateAsync(Comunion);
      } else {
        await createComunion.mutateAsync({
          id: 0,
          ...Comunion,
          fechaRegistro: new Date().toISOString(),
        });
      }
      await refetchComuniones();
    }

    if (Confirmacion) {
      if (tipoOriginal === "Confirmación" && Confirmacion.id) {
        await updateConfirmacion.mutateAsync(Confirmacion);
      } else {
        await createConfirmacion.mutateAsync({
          id: 0,
          ...Confirmacion,
          fechaRegistro: new Date().toISOString(),
        });
      }
      await refetchConfirmaciones();
    }

    if (Matrimonio) {
      if (tipoOriginal === "Matrimonio" && Matrimonio.id) {
        await updateMatrimonio.mutateAsync(Matrimonio);
      } else {
        await createMatrimonio.mutateAsync({
          id: 0,
          ...Matrimonio,
          fechaRegistro: new Date().toISOString(),
        });
      }
      await refetchMatrimonios();
    }

    showToast("Acta sacramental actualizada correctamente", "success");
  };

  const handleDelete = async (sacramento: any) => {
    if (confirm(`¿Estás seguro de eliminar ${sacramento.nombre}?`)) {
      const id = sacramento.detalles.id;

      switch (sacramento.tipo) {
        case "Bautismo":
          await deleteBautismo.mutateAsync(id);
          await refetchBautismos();
          break;
        case "Comunión":
          await deleteComunion.mutateAsync(id);
          await refetchComuniones();
          break;
        case "Confirmación":
          await deleteConfirmacion.mutateAsync(id);
          await refetchConfirmaciones();
          break;
        case "Matrimonio":
          await deleteMatrimonio.mutateAsync(id);
          await refetchMatrimonios();
          break;
        default:
          break;
      }
    }
  };

  const bautismosArray = Array.isArray(bautismos) ? bautismos : [];
  const comunionesArray = Array.isArray(comuniones) ? comuniones : [];
  const confirmacionesArray = Array.isArray(confirmaciones)
    ? confirmaciones
    : [];
  const matrimoniosArray = Array.isArray(matrimonios) ? matrimonios : [];

  const todosLosSacramentos = [
    ...bautismosArray.map((b) => ({
      id: `bautismo-${b.id}`,
      nombre:
        `${b.Nombre || b.nombre || ""} ${b.PrimerApellido || b.primerApellido || ""} ${b.SegundoApellido || b.segundoApellido || ""}`.trim() ||
        "Sin nombre",
      cedula: b.cedula || b.Cedula || "",
      fechaCelebracion: b.FechaBautismo || b.fechaBautismo || "",
      fechaRegistro: b.fechaRegistro || b.FechaRegistro || b.createdAt || "",
      lugar: b.NombreParroquia || b.nombreParroquia || "",
      tipo: "Bautismo" as const,
      detalles: b,
    })),
    ...comunionesArray.map((c) => ({
      id: `comunion-${c.id}`,
      nombre: c.Nombre || c.nombre || "Sin nombre",
      cedula: "",
      fechaCelebracion:
        `${c.DiaComunion || c.diaComunion || ""} ${c.MesComunion || c.mesComunion || ""} ${c.AnnioComunion || c.annioComunion || ""}`.trim() ||
        "Fecha no especificada",
      fechaRegistro: c.fechaRegistro || c.FechaRegistro || c.createdAt || "",
      lugar: c.LugarComunion || c.lugarComunion || "",
      tipo: "Comunión" as const,
      detalles: c,
    })),
    ...confirmacionesArray.map((conf) => ({
      id: `confirmacion-${conf.id}`,
      nombre: conf.Nombre || conf.nombre || "Sin nombre",
      cedula: "",
      fechaCelebracion:
        `${conf.DiaConfirmacion || conf.diaConfirmacion || ""} ${conf.MesConfirmacion || conf.mesConfirmacion || ""} ${conf.AnnioConfirmacion || conf.annioConfirmacion || ""}`.trim() ||
        "Fecha no especificada",
      fechaRegistro:
        conf.fechaRegistro || conf.FechaRegistro || conf.createdAt || "",
      lugar: conf.LugarConfirmacion || conf.lugarConfirmacion || "",
      tipo: "Confirmación" as const,
      detalles: conf,
    })),
    ...matrimoniosArray.map((m) => ({
      id: `matrimonio-${m.id}`,
      nombre:
        `${m.NombreContrayente || m.nombreContrayente || ""} y ${m.NombreContrayente2 || m.nombreContrayente2 || ""}`.trim() ||
        "Sin nombre",
      cedula: "",
      fechaCelebracion:
        `${m.DiaMatrimonio || m.diaMatrimonio || ""} ${m.MesMatrimonio || m.mesMatrimonio || ""} ${m.AnnioMatrimonio || m.annioMatrimonio || ""}`.trim() ||
        "Fecha no especificada",
      fechaRegistro: m.fechaRegistro || m.FechaRegistro || m.createdAt || "",
      lugar: m.LugarMatrimonio || m.lugarMatrimonio || "",
      tipo: "Matrimonio" as const,
      detalles: m,
    })),
  ];

  const sacramentosFiltrados = todosLosSacramentos.filter((s) => {
    const nombreLower = (s.nombre || "").toLowerCase();
    const cedulaStr = s.cedula?.toString() || "";
    const fechaStr = s.fechaCelebracion || "";

    const matchNombre =
      searchNombre === "" || nombreLower.includes(searchNombre.toLowerCase());
    const matchCedula = searchCedula === "" || cedulaStr.includes(searchCedula);
    const matchFecha = matchFechaFlexible(fechaStr, searchFecha);

    return matchNombre && matchCedula && matchFecha;
  });

  const ordenarDatos = (
    datos: any[],
    columna: string,
    direccion: "asc" | "desc",
  ) => {
    return [...datos].sort((a, b) => {
      let valA = a[columna] ?? "";
      let valB = b[columna] ?? "";

      if (columna === "fechaCelebracion") {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return direccion === "asc" ? -1 : 1;
      if (valA > valB) return direccion === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sacramentosOrdenados = ordenarDatos(
    sacramentosFiltrados,
    sortColumn,
    sortDirection,
  );

  const hayBusquedaActiva =
    searchNombre.trim() !== "" ||
    searchCedula.trim() !== "" ||
    searchFecha !== "";

  const mostrarEstadoVacio =
    !isPending &&
    !error &&
    sacramentosOrdenados.length === 0 &&
    hayBusquedaActiva;

  const handleSort = (columna: string) => {
    if (sortColumn === columna) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columna);
      setSortDirection("asc");
    }
  };

  const aplicarMascaraCedula = (valor: string) => {
    let digitos = valor.replace(/\D/g, "").slice(0, 9);
    if (digitos.length >= 1 && digitos[0] === '0') {
      digitos = digitos.slice(1);
    }
    if (digitos.length <= 1) return digitos;
    if (digitos.length <= 5) return `${digitos[0]}-${digitos.slice(1)}`;
    return `${digitos[0]}-${digitos.slice(1, 5)}-${digitos.slice(5)}`;
  };

  const soloLetras = (valor: string) => valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');

  const handleBuscar = () => {
    setSearchNombre(nombreInput.trim());
    setSearchCedula(cedulaInput.replace(/\D/g, ""));
    setSearchFecha(fechaInput);
  };

  const handleLimpiar = () => {
    setNombreInput("");
    setCedulaInput("");
    setFechaInput("");
    setSearchNombre("");
    setSearchCedula("");
    setSearchFecha("");
  };

  const handleViewDetails = (sacramento: any) => {
    setSelectedSacramento(sacramento.detalles);
    setSelectedTipo(sacramento.tipo);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedSacramento(null);
    setSelectedTipo("Bautismo");
  };

  return (
    <AdminModule className="w-full py-5">
      <div className="mb-6">
        <h2 className="m-0 font-heading text-xl font-extrabold text-royal-blue">
          CONSULTA DE REGISTROS SACRAMENTALES
        </h2>
      </div>

      <form
        className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border-strong bg-surface p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          handleBuscar();
        }}
      >
        <AdminSearch
          type="text"
          placeholder="Cédula (0-0000-0000)"
          value={cedulaInput}
          onChange={(e) => setCedulaInput(aplicarMascaraCedula(e.target.value))}
          className="min-w-[200px] flex-1"
        />
        <AdminSearch
          type="text"
          placeholder="Nombre o apellidos"
          value={nombreInput}
          onChange={(e) => setNombreInput(soloLetras(e.target.value))}
          className="min-w-[200px] flex-1"
        />
        <input
          type="date"
          value={fechaInput}
          onChange={(e) => setFechaInput(e.target.value)}
          className="min-h-11 min-w-[200px] flex-1 rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-text focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
        />
        <Button
          type="submit"
          variant="royal"
          className="shrink-0"
        >
          Buscar
        </Button>
        <Button
          type="button"
          onClick={handleLimpiar}
          variant="royal"
          className="shrink-0"
        >
          Limpiar
        </Button>
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          variant="royal"
          className="shrink-0"
        >
          + Agregar
        </Button>
      </form>

      {isPending && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2
            size={32}
            className="animate-spin text-text-muted"
          />
          <p className="m-0 text-sm text-text-secondary">
            Buscando registros...
          </p>
        </div>
      )}

      {error && !isPending && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-bg bg-danger-bg/40 px-6 py-16 text-center">
          <p className="m-0 text-sm font-medium text-danger">
            Ocurrió un error al realizar la búsqueda
          </p>
        </div>
      )}

      {mostrarEstadoVacio && (
        <div className="rounded-xl border border-border-strong bg-surface">
          <SacramentoEmptyState />
        </div>
      )}

      {!isPending && !error && !mostrarEstadoVacio && (
        <SacramentTable
          sacramentos={sacramentosOrdenados}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          searchNombre={searchNombre}
        />
      )}

      <DetailsDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        sacramento={selectedSacramento}
        tipo={selectedTipo}
      />

      <AddSacramentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSacramento}
        tieneBautismo={bautismosArray.length > 0}
      />

      <EditSacramentoModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        sacramento={editingSacramento}
        tipo={editingTipo}
      />
    </AdminModule>
  );
};

export default GestionSacramentos;
