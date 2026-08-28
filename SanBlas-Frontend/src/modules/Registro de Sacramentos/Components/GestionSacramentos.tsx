import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useBuscarSacramentosNuevos } from '../hooks/hooksNuevos/useBuscarSacramentosNuevos';
import { useCrearSacramentoNuevo } from '../hooks/hooksNuevos/useCrearSacramentoNuevo';
import { useActualizarSacramentoNuevo } from '../hooks/hooksNuevos/useActualizarSacramentoNuevo';
import { useEliminarSacramentoNuevo } from '../hooks/hooksNuevos/useEliminarSacramentoNuevo';
import SacramentTable from './SacramentTable';
import SacramentoEmptyState from './SacramentoEmptyState';
import DetailsDrawer from './DetailsDrawer';
import AddSacramentoModal from './AddSacramentoModal';
import EditSacramentoModal from './EditSacramentoModal';
import { AdminModule, AdminSearch, Button, useToast } from '../../../shared/ui';
import { ActualizarSacramentoInput, CrearSacramentoInput } from '../../../types/sacramentosNuevos';

const GestionSacramentos = () => {
  const { showToast } = useToast();

  const [nombreInput, setNombreInput] = useState('');
  const [cedulaInput, setCedulaInput] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '', cedula: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerCedula, setDrawerCedula] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCedula, setEditCedula] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const query = useBuscarSacramentosNuevos({
    nombre: filtros.nombre || undefined,
    cedula: filtros.cedula || undefined,
    page,
    pageSize,
  });

  // Consulta ligera para saber si existen bautismos y habilitar las otras pestañas.
  const bautismosQuery = useBuscarSacramentosNuevos({ tipo: 'bautismo', page: 1, pageSize: 1 });
  const tieneBautismo = (bautismosQuery.data?.total ?? 0) > 0;

  const createSacramento = useCrearSacramentoNuevo();
  const updateSacramento = useActualizarSacramentoNuevo();
  const deleteSacramento = useEliminarSacramentoNuevo();

  // Debounce de 400ms en la búsqueda por texto.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({ nombre: nombreInput.trim(), cedula: cedulaInput.replace(/\D/g, '') });
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [nombreInput, cedulaInput]);

  const aplicarMascaraCedula = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 9);
    if (digitos.length <= 1) return digitos;
    if (digitos.length <= 5) return `${digitos[0]}-${digitos.slice(1)}`;
    return `${digitos[0]}-${digitos.slice(1, 5)}-${digitos.slice(5)}`;
  };

  const handleBuscar = () => {
    setFiltros({ nombre: nombreInput.trim(), cedula: cedulaInput.replace(/\D/g, '') });
    setPage(1);
  };

  const handleLimpiar = () => {
    setNombreInput('');
    setCedulaInput('');
    setFiltros({ nombre: '', cedula: '' });
    setPage(1);
  };

  const handleViewDetails = (sacramento: { cedula: string | null }) => {
    if (!sacramento.cedula) {
      showToast('Este registro no tiene cédula asociada.', 'error');
      return;
    }
    setDrawerCedula(sacramento.cedula);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setDrawerCedula(null);
  };

  const handleEdit = (sacramento: { id: number; cedula: string | null }) => {
    setEditId(sacramento.id);
    setEditCedula(sacramento.cedula);
    setEditModalOpen(true);
  };

  const handleSaveAdd = async (dto: CrearSacramentoInput) => {
    await createSacramento.mutateAsync(dto);
    showToast('Acta sacramental registrada correctamente', 'success');
  };

  const handleUpdateSacramento = async (id: number, dto: ActualizarSacramentoInput) => {
    await updateSacramento.mutateAsync({ id, dto });
    showToast('Acta sacramental actualizada correctamente', 'success');
  };

  const handleDelete = async (sacramento: { id: number; nombre: string }) => {
    if (confirm(`¿Estás seguro de eliminar ${sacramento.nombre}?`)) {
      try {
        await deleteSacramento.mutateAsync(sacramento.id);
        showToast('Registro eliminado correctamente', 'success');
      } catch (err: any) {
        showToast(err?.response?.data?.mensaje ?? 'No se pudo eliminar el registro.', 'error');
      }
    }
  };

  const hayBusquedaActiva = filtros.nombre !== '' || filtros.cedula !== '';
  const mostrarEstadoVacio =
    !query.isPending && !query.error && (query.data?.items.length ?? 0) === 0 && hayBusquedaActiva;

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
          onChange={(e) => setNombreInput(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <Button type="submit" variant="royal" className="shrink-0">
          Buscar
        </Button>
        <Button type="button" onClick={handleLimpiar} variant="royal" className="shrink-0">
          Limpiar
        </Button>
        <Button
          type="button"
          onClick={() => setAddModalOpen(true)}
          variant="royal"
          className="shrink-0"
        >
          + Agregar
        </Button>
      </form>

      {query.isPending && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 size={32} className="animate-spin text-text-muted" />
          <p className="m-0 text-sm text-text-secondary">Buscando registros...</p>
        </div>
      )}

      {query.error && !query.isPending && (
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

      {!query.isPending && !query.error && !mostrarEstadoVacio && (
        <SacramentTable
          sacramentos={query.data?.items ?? []}
          total={query.data?.total ?? 0}
          page={query.data?.page ?? 1}
          totalPages={query.data?.totalPages ?? 1}
          pageSize={query.data?.pageSize ?? pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchNombre={filtros.nombre}
        />
      )}

      <DetailsDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        cedula={drawerCedula}
      />

      <AddSacramentoModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveAdd}
        tieneBautismo={tieneBautismo}
      />

      <EditSacramentoModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sacramentoId={editId}
        cedula={editCedula}
        onUpdate={handleUpdateSacramento}
        onCreate={handleSaveAdd}
      />
    </AdminModule>
  );
};

export default GestionSacramentos;