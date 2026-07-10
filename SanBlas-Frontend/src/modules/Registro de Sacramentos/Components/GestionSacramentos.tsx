import { useState } from "react";
import { useGetListBautismo } from "../hooks/hooksBautismo/useGetListBautismo";
import { useGetListComunion } from "../hooks/hooksComunion/useGetListComunion";
import { useGetListConfirma } from "../hooks/hooksConfirma/useGetListConfirma";
import { useGetListMatrimonio } from "../hooks/hooksMatrimonio/useGetListMatrimonio";
import SacramentTable from "./SacramentTable";
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
import { AdminModule, AdminSearch, Button } from "../../../shared/ui";

const GestionSacramentos = () => {
  const { data: bautismos, isPending: pendingBautismo, error: errorBautismo, refetch: refetchBautismos } = useGetListBautismo();
  const { data: comuniones, isPending: pendingComunion, error: errorComunion, refetch: refetchComuniones } = useGetListComunion();
  const { data: confirmaciones, isPending: pendingConfirmacion, error: errorConfirmacion, refetch: refetchConfirmaciones } = useGetListConfirma();
  const { data: matrimonios, isPending: pendingMatrimonio, error: errorMatrimonio, refetch: refetchMatrimonios } = useGetListMatrimonio();

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

  const [searchNombre, setSearchNombre] = useState("");
  const [searchCedula, setSearchCedula] = useState("");
  const [searchFecha, setSearchFecha] = useState("");
  const [selectedSacramento, setSelectedSacramento] = useState<any>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>("Bautismo");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSacramento, setEditingSacramento] = useState<any>(null);
  const [editingTipo, setEditingTipo] = useState<string>("Bautismo");

  const isPending = pendingBautismo || pendingComunion || pendingConfirmacion || pendingMatrimonio;
  const error = errorBautismo || errorComunion || errorConfirmacion || errorMatrimonio;

  const handleSaveSacramento = async (data: any, tipo: string) => {
    if (tipo === "Bautismo") {
      await createBautismo.mutateAsync({
        id: 0,
        ...data,
        SegundoApellido: data.SegundoApellido || "",
        Prebispero: data.Prebispero || "",
        horaNacimiento: data.horaNacimiento || "",
        NombreAbuelosPaternos: data.NombreAbuelosPaternos || "",
        NombreAbuelosMaternos: data.NombreAbuelosMaternos || "",
      });
      await refetchBautismos();
    } else if (tipo === "Comunión") {
      await createComunion.mutateAsync({ id: 0, ...data });
      await refetchComuniones();
    } else if (tipo === "Confirmación") {
      await createConfirmacion.mutateAsync({ id: 0, ...data });
      await refetchConfirmaciones();
    } else if (tipo === "Matrimonio") {
      await createMatrimonio.mutateAsync({ id: 0, ...data });
      await refetchMatrimonios();
    }
  };

  const handleEdit = (sacramento: any) => {
    setEditingSacramento(sacramento.detalles);
    setEditingTipo(sacramento.tipo);
    setEditModalOpen(true);
  };

  const handleEditSave = async (data: any, tipo: string) => {
    if (tipo === "Bautismo") {
      await updateBautismo.mutateAsync(data);
      await refetchBautismos();
    } else if (tipo === "Comunión") {
      await updateComunion.mutateAsync(data);
      await refetchComuniones();
    } else if (tipo === "Confirmación") {
      await updateConfirmacion.mutateAsync(data);
      await refetchConfirmaciones();
    } else if (tipo === "Matrimonio") {
      await updateMatrimonio.mutateAsync(data);
      await refetchMatrimonios();
    }
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
  const confirmacionesArray = Array.isArray(confirmaciones) ? confirmaciones : [];
  const matrimoniosArray = Array.isArray(matrimonios) ? matrimonios : [];

  const todosLosSacramentos = [
    ...bautismosArray.map((b) => ({
      id: `bautismo-${b.id}`,
      nombre:
        `${b.Nombre || b.nombre || ""} ${b.PrimerApellido || b.primerApellido || ""} ${b.SegundoApellido || b.segundoApellido || ""}`.trim() ||
        "Sin nombre",
      cedula: b.cedula || b.Cedula || "",
      fechaCelebracion: b.FechaBautismo || b.fechaBautismo || "",
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
    const matchFecha = searchFecha === "" || fechaStr.includes(searchFecha);

    return matchNombre && matchCedula && matchFecha;
  });

  const ordenarDatos = (datos: any[], columna: string, direccion: "asc" | "desc") => {
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

  const handleSort = (columna: string) => {
    if (sortColumn === columna) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columna);
      setSortDirection("asc");
    }
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
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>+ Agregar Sacramento</Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <AdminSearch
          type="text"
          placeholder="Nombre del registrado"
          value={searchNombre}
          onChange={(e) => setSearchNombre(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <AdminSearch
          type="text"
          placeholder="Cédula"
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <input
          type="date"
          placeholder="Fecha de celebración"
          value={searchFecha}
          onChange={(e) => setSearchFecha(e.target.value)}
          className="min-h-11 min-w-[200px] flex-1 rounded-xl border border-border-strong bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
        />
      </div>

      {isPending && <p>Cargando sacramentos...</p>}
      {error && <p>Error: {error.message}</p>}

      {!isPending && !error && (
        <SacramentTable
          sacramentos={sacramentosOrdenados}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
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
